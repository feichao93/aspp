#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const getStatus = require('../../aspp-backend/lib/getStatus')

const noop = () => {}

const commandHandlers = {
  serve({ taskDir, port }) {
    const startCluster = require('egg-cluster').startCluster
    process.env.TASK_DIR = taskDir
    // FIXME 设置为 prod 的时候，访问 api 都会报 404
    // process.env.EGG_SERVER_ENV = 'prod'
    startCluster({
      baseDir: path.resolve(__dirname, '../../aspp-backend'),
      workers: 1,
      port,
    })
  },
  showStatus({ taskDir }) {
    console.log(JSON.stringify(getStatus(taskDir), null, 2))
  },
  showConfig(options) {
    const config = yaml.safeLoad(
      fs.readFileSync(path.resolve(options.taskDir, 'aspp.config.yaml'), 'utf8'),
    )
    console.log(JSON.stringify(config, null, 2))
  },
}

require('yargs')
  .command('status', 'show status of the task', noop, commandHandlers.showStatus)
  .command('config', 'show config of the task', noop, commandHandlers.showConfig)
  .command(
    'serve [port]',
    'start the server',
    yargs => {
      yargs.positional('port', {
        describe: 'port to bind on',
        default: 8080,
      })
    },
    commandHandlers.serve,
  )
  .option('task-dir', { default: '.' })
  .parse()
