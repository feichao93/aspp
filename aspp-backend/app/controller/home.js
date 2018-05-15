const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    const context = { ASPP_CONFIG: JSON.stringify(this.service.aspp.getConfig()) }
    await this.ctx.render('index.njk', context)
  }
}

module.exports = HomeController
