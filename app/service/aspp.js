const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const Service = require('egg').Service
const getStatus = require('../../lib/getStatus')

const STATUS = Symbol('status')
const CONFIG = Symbol('config')

class AsppService extends Service {
  getConfig() {
    if (this[CONFIG] == null) {
      this[CONFIG] = yaml.safeLoad(
        fs.readFileSync(path.resolve(this.config.aspp.dir, 'aspp.config.yaml'), 'utf-8'),
      )
    }
    return this[CONFIG]
  }

  getStatus() {
    if (this[STATUS] == null) {
      this[STATUS] = getStatus(this.config.aspp.dir)
    }
    return this[STATUS]
  }

  incAndGetNextId() {
    const status = this.getStatus()
    status.nextId = (status.nextId || 0) + 1
    return status.nextId
  }

  resolveAnnotationFilename(docName, annotationSetName) {
    return path.resolve(this.config.aspp.dir, 'annotations', `${docName}.${annotationSetName}.yaml`)
  }

  getDocByName(docname) {
    const filename = path.resolve(this.config.aspp.dir, 'docs', docname)
    if (!fs.existsSync(filename)) {
      this.ctx.throw(404, 'doc not found')
    } else {
      return fs.readFileSync(filename, 'utf-8')
    }
  }

  getAnnotation(docname, annotationSetName) {
    const filename = this.resolveAnnotationFilename(docname, annotationSetName)
    if (!fs.existsSync(filename)) {
      this.ctx.throw(404, 'annotation-set file not found')
    }
    return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
  }

  deleteAnnotation(docname, annotationSetName) {
    const status = this.getStatus()
    const doc = status.docs.find(doc => doc.name === docname)
    doc.annotations.splice(doc.annotations.indexOf(annotationSetName))

    const filename = this.resolveAnnotationFilename(docname, annotationSetName)
    fs.unlinkSync(filename)
  }

  saveAnnotation(docname, annotationSetName) {
    const status = this.getStatus()
    const doc = status.docs.find(doc => doc.name === docname)
    if (!doc.annotations.includes(annotationSetName)) {
      doc.annotations.push(annotationSetName)
    }
    const filename = this.resolveAnnotationFilename(doc.name, annotationSetName)
    fs.writeFileSync(filename, yaml.safeDump(this.ctx.request.body), 'utf-8')
  }
}

module.exports = AsppService
