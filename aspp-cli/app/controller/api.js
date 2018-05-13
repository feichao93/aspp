const fs = require('fs')
const yaml = require('js-yaml')
const Controller = require('egg').Controller

class APIController extends Controller {
  async nextId() {
    this.ctx.body = this.app.incAndGetNextId()
  }

  async list() {
    this.ctx.body = this.app.getStatus()
  }

  async getDoc() {
    const docId = this.ctx.params.docId
    const status = yaml.safeLoad(fs.readFileSync('test-dir/aspp.status.yaml'))
    const doc = status.docs.find(doc => doc.id === docId)
    const filename = `test-dir/docs/${doc.name}`
    if (!fs.existsSync(filename)) {
      this.ctx.throw(404, 'doc not found')
    }
    this.ctx.body = fs.readFileSync(filename)
    this.ctx.response.set('content-type', 'text/plain;charset=utf8')
  }

  async getAnnotationSet() {
    const { docId, annotationSetName } = this.ctx.params
    const status = yaml.safeLoad(fs.readFileSync('test-dir/aspp.status.yaml'))
    const doc = status.docs.find(doc => doc.id === docId)
    const filename = this.app.resolveAnnotationFilename(doc.name, annotationSetName)
    if (!fs.existsSync(filename)) {
      this.ctx.throw(404, 'annotation-set file not found')
    }
    this.ctx.body = yaml.safeLoad(fs.readFileSync(filename))
  }

  async deleteAnnotationSet() {
    const { docId, annotationSetName } = this.ctx.params
    const status = this.app.getStatus()
    const doc = status.docs.find(doc => doc.id === docId)
    const filename = this.app.resolveAnnotationFilename(doc.name, annotationSetName)
    fs.unlinkSync(filename)
    doc.annotations.splice(doc.annotations.indexOf(annotationSetName))
    this.app.save()
    this.ctx.status = 200
  }

  async putAnnotationSet() {
    const { docId, annotationSetName } = this.ctx.params
    const status = this.app.getStatus()
    const doc = status.docs.find(doc => doc.id === docId)
    if (!doc.annotations.includes(annotationSetName)) {
      doc.annotations.push(annotationSetName)
    }
    const filename = this.app.resolveAnnotationFilename(doc.name, annotationSetName)
    fs.writeFileSync(filename, yaml.safeDump(this.ctx.request.body), 'utf-8')
    this.app.save()
    this.ctx.status = 200
  }
}

module.exports = APIController
