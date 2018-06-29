const Router = require('koa-router')

module.exports = new Router('/api')
  .get('/list', ctx => {
    const { reload } = ctx.query
    ctx.body = ctx.aspp.list(reload != null)
  })
  .get('/doc/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    await ctx.aspp.getDoc(fullDocPath)
  })
  .get('/doc-stat/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    await ctx.aspp.getDocStat(fullDocPath)
  })
  .get('/coll/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    const { collname } = ctx.query
    await ctx.aspp.getColl(fullDocPath, collname)
  })
  .delete('/coll/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    const { collname } = ctx.query
    await ctx.aspp.deleteColl(fullDocPath, collname)
  })
  .put('/coll/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    const { collname } = ctx.query
    await ctx.aspp.putColl(fullDocPath, collname, ctx.request.body)
  })
  .post('/rename/coll/:fullDocPath+', async ctx => {
    const { fullDocPath } = ctx.params
    const { collname } = ctx.query
    const { newName } = ctx.request.body
    await ctx.aspp.renameColl(fullDocPath, collname, newName)
  })
