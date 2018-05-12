const fs = require('fs')
const yaml = require('js-yaml')
const Controller = require('egg').Controller

class APIController extends Controller {
  async nextId() {
    this.ctx.body = this.ctx.aspp.incAndGetNextId()
  }

  async list() {
    const status = yaml.safeLoad(fs.readFileSync('test-dir/aspp.status.yaml'))
    this.ctx.set('content-type', 'application/json')
    this.ctx.body = JSON.stringify(status.docs, null, 2)
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
    const filename = `test-dir/annotations/${doc.name}.${annotationSetName}.json`
    if (!fs.existsSync(filename)) {
      this.ctx.throw(404, 'annotation-set file not found')
    }
    this.ctx.body = fs.readFileSync(filename)
    this.ctx.response.set('content-type', 'text/plain;charset=utf8')
  }

  async deleteAnnotationSet() {
    // TODO
    const { docId, annotationSetName } = this.ctx.params
    const status = yaml.safeLoad(fs.readFileSync('test-dir/aspp.status.yaml'))
    const doc = status.docs.find(doc => doc.id === docId)
    const filename = `test-dir/annotations/${doc.name}.${annotationSetName}.json`
    fs.unlinkSync(filename)
    doc.annotations.splice(doc.annotations.indexOf(annotationSetName))
    // TODO this.ctx.saveStatus()
    this.ctx.status = 200
  }

  // TODO 更新标注文件
  async putAnnotationSet() {
    this.ctx.NOT_IMPLEMENTED()
  }

  // TODO 新增一个标注文件
  async addAnnotationSet() {
    const { docId } = this.ctx.params
  }
}

module.exports = APIController
