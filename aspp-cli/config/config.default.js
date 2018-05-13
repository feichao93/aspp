const path = require('path')

exports.keys = 'keykeykey'

exports.view = {
  defaultViewEngine: 'nunjucks',
  mapping: {
    '.tpl': 'nunjucks',
  },
}

exports.security = {
  domainWhiteList: ['http://localhost:8080'],
  csrf: {
    enable: false,
  },
}

exports.aspp = {
  dir: path.resolve(__dirname, '../test-dir'),
}
