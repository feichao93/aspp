const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const nunjucks = require('nunjucks')
const WebSocket = require('ws')
const packageInfo = require('../package.json')
const apiRouter = require('./apiRouter')
const asppService = require('./asppService')

let nextClientId = 1

module.exports = function server({ port, taskDir }) {
  const app = new Koa()

  const router = new Router()
    .get('/', async ctx => {
      const context = {
        ASPP_CONFIG: JSON.stringify(ctx.aspp.getConfig()),
        VERSION: JSON.stringify(packageInfo.version),
      }
      const template = fs.readFileSync(path.resolve(__dirname, 'index.njk'), 'utf-8')
      ctx.body = nunjucks.renderString(template, context)
    })
    .use('/api', apiRouter.routes())

  const server = app
    .use(bodyParser())
    .use(asppService({ taskDir }))
    .use(router.routes())
    .use(mount('/public', koaStatic(path.resolve(__dirname, '../public'))))
    .listen(port, () => {
      console.log(`Using task directory ${path.resolve(taskDir)}`)
      console.log(`ASPP server started at ${port}`)
    })

  const wss = new WebSocket.Server({ noServer: true })
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit('connection', ws, request)
    })
  })

  const clients = {}

  function broadcastClientsInfo() {
    for (const ws of wss.clients) {
      ws.send(JSON.stringify({ type: 'clients-info', clients }))
    }
  }

  wss.on('connection', function connection(ws) {
    ws.clientId = nextClientId++
    console.log(`client ${ws.clientId} connection`)
    clients[ws.clientId] = {
      clientId: ws.clientId,
      username: null,
      editingColl: null,
      online: true,
    }

    ws.on('message', data => {
      // console.log('receive:', data, 'from', ws.clientId)
      const msg = JSON.parse(data)
      if (msg.type === 'update-username') {
        clients[ws.clientId].username = msg.username
        broadcastClientsInfo()
      } else if (msg.type === 'start-editing') {
        clients[ws.clientId].editingColl = msg.fileInfo
        broadcastClientsInfo()
      } else if (msg.type === 'stop-editing') {
        clients[ws.clientId].editingColl = null
        broadcastClientsInfo()
      }
    })
    ws.on('close', () => {
      console.log(`client ${ws.clientId} close`)
      // clients[ws.clientId].online = false
      delete clients[ws.clientId]
      broadcastClientsInfo()
    })
  })
}
