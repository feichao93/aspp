const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const yaml = require('js-yaml')
const uuidv1 = require('uuid/v1')

function md5(data) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex')
}

const DIR = path.resolve('test-dir')

const statusFile = path.resolve(DIR, 'aspp.status.yaml')
let status
if (fs.existsSync(statusFile)) {
  status = yaml.safeLoad(fs.readFileSync(statusFile, 'utf8')) || {}
} else {
  status = {}
}

status.docs = status.docs || []
const docs = status.docs
const docnameSet = new Set(docs.map(doc => doc.name))

const existingDocnams = fs.readdirSync(path.resolve(DIR, 'docs'))

for (const docname of existingDocnams) {
  if (!docnameSet.has(docname)) {
    const id = uuidv1()
    const hash = md5(fs.readFileSync(path.resolve(DIR, 'docs', docname)))
    docs.push({ id, name: docname, hash, annotations: [] })
  }
}

fs.writeFileSync(statusFile, yaml.safeDump(status), 'utf8')
