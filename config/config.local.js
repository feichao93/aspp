const path = require('path')

exports.security = {
  // 本地开发的时候在白名单中加入 webpack-dev-server 默认端口
  domainWhiteList: ['http://localhost:8080'],
}

exports.aspp = {
  dir: path.resolve(__dirname, '../example'),
}
