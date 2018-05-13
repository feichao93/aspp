const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const STATUS = Symbol('status')
const CONFIG_FILENAME = 'aspp.status.yaml'

module.exports = {
  // 这个改成 Service 应该更好一些
  getStatus() {
    if (this[STATUS] == null) {
      this[STATUS] = yaml.safeLoad(
        fs.readFileSync(path.resolve(this.config.aspp.dir, CONFIG_FILENAME)),
      )
    }
    return this[STATUS]
  },

  incAndGetNextId() {
    const status = this.getStatus()
    status.nextId = (status.nextId || 0) + 1
    this.save()
    return status.nextId
  },

  save() {
    fs.writeFileSync(
      path.resolve(this.config.aspp.dir, CONFIG_FILENAME),
      yaml.safeDump(this[STATUS]),
      'utf-8',
    )
  },

  resolveAnnotationFilename(docName, annotationSetName) {
    return path.resolve(this.config.aspp.dir, 'annotations', `${docName}.${annotationSetName}.yaml`)
  },
}
