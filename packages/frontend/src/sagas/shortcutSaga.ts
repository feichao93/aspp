import { eventChannel, io } from 'little-saga'
import ASPP_CONFIG from '../aspp-config'
import { State } from '../reducers'
import Action from '../utils/actions'
import schedulers from '../utils/schedulers'

/** 绑定快捷键 */
export default function* shortcutSaga() {
  const chan = eventChannel<KeyboardEvent>(emit => {
    const callback = (e: KeyboardEvent) => schedulers.batch(emit, e)
    document.addEventListener('keydown', callback)
    return () => document.removeEventListener('keydown', callback)
  })

  try {
    while (true) {
      const event: KeyboardEvent = yield io.take(chan)
      if ((event.target as Element).tagName === 'INPUT') {
        continue
      }
      const key = event.key

      if (key === 'Escape') {
        yield io.put(Action.userClearSel('manual'))
      } else if (key === 'Backspace' || key === 'd') {
        yield io.put(Action.userDeleteCurrent())
      } else if (key === 'Enter' || key === 'a') {
        yield io.put(Action.userAcceptCurrent())
      } else if (key === 's' && !event.ctrlKey) {
        yield io.put(Action.userSelectCurrent())
      } else if (key === 's' && event.ctrlKey) {
        event.preventDefault()
        yield io.put(Action.reqSaveCurrentColl())
      } else if (key === 'z' && event.ctrlKey) {
        yield io.put(Action.userReqUndo())
      } else if (key === 'y' && event.ctrlKey) {
        yield io.put(Action.userReqRedo())
      } else {
        const { tagShortcutMap, groupShortcutMap, asppConfig } = ASPP_CONFIG
        const { editor }: State = yield io.select()
        if (editor.activeGroup) {
          const targetTag = asppConfig.tags
            .filter(tag => tag.group && tag.group === editor.activeGroup)
            .find(tag => tag.shortcut === key)
          if (targetTag) {
            yield io.put(Action.userAnnotateCurrent(targetTag.name))
            yield io.put(Action.setActiveGroup(''))
          } else if (groupShortcutMap.get(key) === editor.activeGroup) {
            yield io.put(Action.setActiveGroup(''))
          }
        } else {
          if (tagShortcutMap.has(key)) {
            yield io.put(Action.userAnnotateCurrent(tagShortcutMap.get(key)))
          } else if (groupShortcutMap.has(key)) {
            yield io.put(Action.setActiveGroup(groupShortcutMap.get(key)))
          }
        }
      }
    }
  } finally {
    chan.close()
  }
}
