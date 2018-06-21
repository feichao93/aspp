const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = function getStatus(dir) {
  console.log('reloading annotation status from file system')
  mkdirp.sync(path.join(dir, 'docs'))
  mkdirp.sync(path.join(dir, 'annotations'))

  const status = { docs: [] }
  const docs = status.docs
  const docnameSet = new Set(docs.map(doc => doc.name))

  const existingDocnams = fs.readdirSync(path.resolve(dir, 'docs'))
  const existingAnnotationNames = fs.readdirSync(path.resolve(dir, 'annotations'))

  for (const docname of existingDocnams) {
    if (!docnameSet.has(docname)) {
      docs.push({ name: docname, annotations: [] })
    }
  }

  for (const annotation of existingAnnotationNames) {
    const doc = docs.find(
      doc =>
        annotation.startsWith(doc.name) && annotation.replace(doc.name, '').match(/\.[\w-]+\.yaml/),
    )
    if (doc) {
      const name = annotation.replace(doc.name, '').match(/\.([\w-]+)\.yaml/)[1]
      if (!doc.annotations.includes(name)) {
        doc.annotations.push(name)
      }
    } else {
      console.warn(`${annotation} has no corresponding plain doc.`)
    }
  }

  return status
}
