#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const signale = require('signale')
const packageInfo = require('../package')
const list = require('../lib/list')
const covert = require('../lib/convert')

function checkTaskDir(taskDir) {
  if (!fs.existsSync(path.join(taskDir, 'aspp.config.yaml'))) {
    signale.error(
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
  list({ taskDir }) {
    checkTaskDir(taskDir)
    console.log(JSON.stringify(list(taskDir), null, 2))
  },
  showConfig({ taskDir }) {
    checkTaskDir(taskDir)
    const config = yaml.safeLoad(fs.readFileSync(path.resolve(taskDir, 'aspp.config.yaml'), 'utf8'))
    console.log(JSON.stringify(config, null, 2))
  },
  convert({ taskDir }) {
    checkTaskDir(taskDir)
    signale.start('Starting converting...')
    covert(path.resolve(taskDir, 'annotations'))
    covert(path.resolve(taskDir, 'deleted'))
    signale.success('Conversion succeed')
  },
}

require('yargs')
  .option('task-dir', {
    default: '.',
    type: 'string',
    alias: 't',
    describe: 'Task directory',
  })
  .command('list', 'List docs and annotation files of the task', noop, commandHandlers.list)
  .command('config', 'Show config of the task', noop, commandHandlers.showConfig)
  .command('convert', 'Convert yaml files to json format', noop, commandHandlers.convert)
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
  .command('*', false, noop, () => {
    signale.error('Invalid command. Run `aspp --help` for more detail.')
    process.exit(1)
  })
  .parse()
