import { Intent } from '@blueprintjs/core'
import { eventChannel, io, takeEvery } from 'little-saga'
import { State } from '../reducers'
import Action from '../utils/actions'
import InteractionCollector, { Interaction } from '../utils/InteractionCollector'
import toaster from './toaster'

function wait(target: EventTarget, eventType: string) {
  return io.cps((cb: any) => {
    target.addEventListener(eventType, function callback(e: Event) {
      cb(null, e)
      target.removeEventListener(eventType, callback)
    })
  })
}

function getWSUrl(url: string) {
  if (process.env.NODE_ENV === 'development') {
    return 'ws://localhost:1477'
  }
  const u = new URL(url)
  u.protocol = 'ws'
  return u.href
}

export default function* wsSaga() {
  const collector: InteractionCollector = yield io.getContext('collector')

  const ws = new WebSocket(getWSUrl(document.URL))

  yield io.fork(handleWSCloseOrError)

  yield wait(ws, 'open')

  const { config }: State = yield io.select()
  ws.send(JSON.stringify({ type: 'update-username', username: config.username }))

  yield io.fork(function*() {
    const msgChan = eventChannel<any>(emit => {
      const listener = (e: MessageEvent) => emit(JSON.parse(e.data))
      ws.addEventListener('message', listener)
      return () => ws.removeEventListener('message', listener)
    })
    while (true) {
      const msg = yield io.take(msgChan)
      if (msg.type === 'clients-info') {
        yield io.put(Action.updateClientsInfo(msg.clients))
      }
    }
  })

  yield takeEvery('SET_USERNAME', function({ username }: Action.SetUsername) {
    ws.send(JSON.stringify({ type: 'update-username', username }))
  })

  yield io.fork(handleCollOpened)
  yield io.fork(handleCollClosed)

  function* handleCollClosed() {
    while (true) {
      yield io.take(collector.channel, 'COLL_CLOSED')
      const { config }: State = yield io.select()
      ws.send(
        JSON.stringify({
          type: 'stop-editing',
          username: config.username,
        }),
      )
    }
  }

  function* handleCollOpened() {
    while (true) {
      const { fileInfo }: Interaction.CollOpened = yield io.take(collector.channel, 'COLL_OPENED')
      if (fileInfo.getType() === 'coll') {
        const { config }: State = yield io.select()
        ws.send(
          JSON.stringify({
            type: 'start-editing',
            username: config.username,
            fileInfo,
          }),
        )
      }
    }
  }

  function* handleWSCloseOrError() {
    yield io.fork(function*() {
      yield wait(ws, 'close')
      toaster.show({ message: 'websocket closed', intent: Intent.WARNING })
    })

    yield io.fork(function*() {
      const e = yield wait(ws, 'error')
      console.error(e)
      toaster.show({ message: 'websocket error', intent: Intent.DANGER })
    })
  }
}
