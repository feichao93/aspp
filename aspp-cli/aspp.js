#!/usr/bin/env node

const fs = require('fs')
const noop = () => {}

const commandHandlers = {
  serve(port) {
    console.log('serve()!')
  },
  showConfig() {
    console.log(fs.readFileSync('aspp.config.yaml', 'utf8'))
  },
}

require('yargs')
  .command('config', 'show config of this task', noop, commandHandlers.showConfig)
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
  // .option('verbose', { default: false })
  .parse()
