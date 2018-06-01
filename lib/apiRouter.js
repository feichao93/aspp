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
  .get('/annotation-set/:docname/:annotationSetName', ctx => {
    const { docname, annotationSetName } = ctx.params
    ctx.body = ctx.aspp.getAnnotation(docname, annotationSetName)
  })
  .delete('/annotation-set/:docname/:annotationSetName', ctx => {
    const { docname, annotationSetName } = ctx.params
    ctx.aspp.deleteAnnotation(docname, annotationSetName)
    ctx.status = 200
  })
  .put('/annotation-set/:docname/:annotationSetName', ctx => {
    const { docname, annotationSetName } = ctx.params
    ctx.aspp.saveAnnotation(docname, annotationSetName)
    ctx.status = 200
  })
