// app/router.js
module.exports = app => {
  const { router } = app
  router.get('/', 'home.index')
  router.post('/api/next-id', 'api.nextId')
  router.get('/api/list', 'api.list')
  router.get('/api/doc/:docId', 'api.getDoc')
  router.get('/api/annotation-set/:docId/:annotationSetName', 'api.getAnnotationSet')
  router.delete('/api/annotation-set/:docId/:annotationSetName', 'api.deleteAnnotationSet')
  router.put('/api/annotation-set/:docId/:annotationSetName', 'api.putAnnotationSet')
}
