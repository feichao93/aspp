#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const packageInfo = require('../package')
const getStatus = require('../lib/getStatus')

function checkTaskDir(taskDir) {
  if (!fs.existsSync(path.join(taskDir, 'aspp.config.yaml'))) {
    console.error(
      `${path.resolve(taskDir)} is not a valid task directory.` +
        ' A config file named `aspp.config.yaml` is required.',
    )
    process.exit(1)
  }
}

const noop = () => {}

const commandHandlers = {
  serve({ taskDir, port }) {
    checkTaskDir(taskDir)
    const server = require('../lib/server')
    console.log(`ASPP v${packageInfo.version}`)
    server({ port, taskDir })
  },
  showStatus({ taskDir }) {
    checkTaskDir(taskDir)
    console.log(JSON.stringify(getStatus(taskDir), null, 2))
  },
  showConfig({ taskDir }) {
    checkTaskDir(taskDir)
    const config = yaml.safeLoad(fs.readFileSync(path.resolve(taskDir, 'aspp.config.yaml'), 'utf8'))
    console.log(JSON.stringify(config, null, 2))
  },
}

// TODO 检查 taskDir 文件夹下是否包含 aspp.config.yaml
require('yargs')
  .option('task-dir', {
    default: '.',
    type: 'string',
    alias: 't',
    describe: 'Task directory',
  })
  .command('status', 'Show status of the task', noop, commandHandlers.showStatus)
  .command('config', 'Show config of the task', noop, commandHandlers.showConfig)
  .command(
    'serve',
    'Start the server',
    yargs => {
      yargs.option('port', {
        alias: 'p',
        describe: 'port to bind on',
        default: 1477,
        type: 'number',
      })
    },
    commandHandlers.serve,
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .parse()
