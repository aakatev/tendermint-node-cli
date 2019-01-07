// CLI module
const readline = require('readline');
// const util = require('util');
const events = require('events');

// Events
class _events extends events{};
const e = new _events();

// Event handlers
e.on('init', () => {
  cli.responders.init();
});

e.on('subscribe', () => {
  cli.responders.subscribe();
});

e.on('unsubscribe all', () => {
  cli.responders.unsubscribeAll();
});

e.on('exit', () => {
  cli.responders.exit();
});

// Commands
const commands = [
  'init',
  'subscribe',
  'unsubscribe all',
  'help',
  'exit',
];

// Node cli
const cli = {
  responders: {
    init() {
      console.log("init check!");
    },
    subscribe() {
      console.log("subscribe check!");
    },
    unsubscribeAll() {
      console.log("unsubscribe check!");
    },
    exit() {
      console.log('\x1b[31m%s\x1b[0m', `Goodbye!`);
      process.exit(0);
    },
  },
  // Handle user input
  processInput(str) {
    str = typeof str === 'string' && str.trim().length > 0 ? str : false;
    if(str) {
      if (commands.indexOf(str) !== -1) {
        e.emit(str);
      } else {
        console.log('Invalid input!');
      }
    }

  },
  // "Constructor"
  init() {
    console.log('\x1b[36m%s\x1b[0m', `Welcome to Tendermint Node CLI`);

    const _interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'node-cli$ ',
    });

    _interface.prompt();

    _interface.on('line', (str) => {
      cli.processInput(str);

      _interface.prompt();
    });

    _interface.on('close', (str) => {
      console.log('\x1b[31m%s\x1b[0m', `\nGoodbye!`);
      process.exit(0)
    });
  },
};

module.exports = cli;