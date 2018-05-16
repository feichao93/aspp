const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const mount = require('koa-mount')
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const nunjucks = require('nunjucks')
const apiRouter = require('./apiRouter')
const asppService = require('./asppService')

module.exports = function server({ port, taskDir }) {
  const app = new Koa()

  const router = new Router()
    .get('/', async ctx => {
      const context = { ASPP_CONFIG: JSON.stringify(ctx.aspp.getConfig()) }
      const template = fs.readFileSync(path.resolve(__dirname, 'index.njk'), 'utf-8')
      ctx.body = nunjucks.renderString(template, context)
    })
    .use('/api', apiRouter.routes())

  app
    .use(bodyParser())
    .use(asppService({ taskDir }))
    .use(router.routes())
    .use(mount('/public', koaStatic(path.resolve(__dirname, '../public'))))
    .listen(port, () => {
      console.log(`Using task directory ${path.resolve(taskDir)}`)
      console.log(`ASPP server started at ${port}`)
    })
}
