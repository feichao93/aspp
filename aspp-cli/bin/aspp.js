#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const noop = () => {}

const commandHandlers = {
  serve(port) {
    const startCluster = require('egg-cluster').startCluster
    startCluster({
      baseDir: path.resolve(__dirname, '../../aspp-backend'),
      workers: 1,
      port,
    })
  },
  showConfig(options) {
    console.log(fs.readFileSync(path.resolve(options.taskDir, 'aspp.config.yaml'), 'utf8'))
  },
}

require('yargs')
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
    argv => commandHandlers.serve(argv.port),
  )
  .option('task-dir', { default: '.' })
  .parse()
