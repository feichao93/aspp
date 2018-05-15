const path = require('path')

exports.keys = 'keykeykey'

exports.view = {
  defaultViewEngine: 'nunjucks',
  mapping: {
    '.tpl': 'nunjucks',
  },
}

exports.security = {
  csrf: {
    enable: false,
  },
}

exports.static = {
  dir: path.resolve(__dirname, '../../public'),
}

exports.aspp = {
  dir: process.env.TASK_DIR,
}
