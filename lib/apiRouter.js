const Router = require('koa-router')

module.exports = new Router('/api')
  .get('/list', ctx => {
    const { reload } = ctx.query
    ctx.body = ctx.aspp.getStatus(reload === 'true')
  })
  .get('/doc/:docname', ctx => {
    const { docname } = ctx.params
    ctx.body = ctx.aspp.getDocByName(docname)
  })
  .get('/annotation-set/:docname/:collName', ctx => {
    const { docname, collName } = ctx.params
    ctx.body = ctx.aspp.getAnnotation(docname, collName)
  })
  .delete('/annotation-set/:docname/:collName', ctx => {
    const { docname, collName } = ctx.params
    ctx.aspp.deleteAnnotation(docname, collName)
    ctx.status = 200
  })
  .put('/annotation-set/:docname/:collName', ctx => {
    const { docname, collName } = ctx.params
    ctx.aspp.saveAnnotation(docname, collName)
    ctx.status = 200
  })
