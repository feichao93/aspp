const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const getStatus = require('./getStatus')

module.exports = function asppService({ taskDir }) {
  let status = null
  let config = null

  return async (ctx, next) => {
    ctx.aspp = {
      getConfig() {
        if (config == null) {
          const content = fs.readFileSync(path.join(taskDir, 'aspp.config.yaml'), 'utf-8')
          config = yaml.safeLoad(content)
        }
        return config
      },

      getStatus() {
        if (status == null) {
          status = getStatus(taskDir)
        }
        return status
      },

      resolveAnnotationFilename(docname, annotationSetName) {
        return path.join(taskDir, 'annotations', `${docname}.${annotationSetName}.yaml`)
      },

      getDocByName(docname) {
        const filename = path.join(taskDir, 'docs', docname)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `doc ${docname} not found`)
        } else {
          return fs.readFileSync(filename, 'utf-8')
        }
      },

      getAnnotation(docname, annotationSetName) {
        const filename = this.resolveAnnotationFilename(docname, annotationSetName)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `annotation-set file ${filename} not found`)
        }
        return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
      },

      deleteAnnotation(docname, annotationSetName) {
        const status = this.getStatus()
        const doc = status.docs.find(doc => doc.name === docname)
        doc.annotations.splice(doc.annotations.indexOf(annotationSetName))

        const filename = this.resolveAnnotationFilename(docname, annotationSetName)
        fs.unlinkSync(filename)
      },

      saveAnnotation(docname, annotationSetName) {
        const status = this.getStatus()
        const doc = status.docs.find(doc => doc.name === docname)
        if (!doc.annotations.includes(annotationSetName)) {
          doc.annotations.push(annotationSetName)
        }
        const filename = this.resolveAnnotationFilename(doc.name, annotationSetName)
        fs.writeFileSync(filename, yaml.safeDump(ctx.request.body), 'utf-8')
      },
    }

    await next()
  }
}
