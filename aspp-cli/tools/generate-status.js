const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const getStatus = require('../lib/getStatus')

const status = getStatus('test-dir')
const statusFile = path.resolve('test-dir/aspp.status.yaml')
fs.writeFileSync(statusFile, yaml.safeDump(status), 'utf8')
