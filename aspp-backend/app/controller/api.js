const Controller = require('egg').Controller

class APIController extends Controller {
  async nextId() {
    this.ctx.body = this.service.aspp.incAndGetNextId()
  }

  async list() {
    this.ctx.body = this.service.aspp.getStatus()
  }

  async getDoc() {
    const { docname } = this.ctx.params
    this.ctx.body = this.service.aspp.getDocByName(docname)
  }

  async getAnnotationSet() {
    const { docname, annotationSetName } = this.ctx.params
    this.ctx.body = this.service.aspp.getAnnotation(docname, annotationSetName)
  }

  async deleteAnnotationSet() {
    const { docname, annotationSetName } = this.ctx.params
    this.service.aspp.deleteAnnotation(docname, annotationSetName)
    this.ctx.status = 200
  }

  async saveAnnotationSet() {
    const { docname, annotationSetName } = this.ctx.params
    this.service.aspp.saveAnnotation(docname, annotationSetName)
    this.ctx.status = 200
  }
}

module.exports = APIController
