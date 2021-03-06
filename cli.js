// Tendermint CLI module
// Dependencies
const readline = require('readline');
const events = require('events');
const WebSocket = require('ws');
const config = require('./config.json');
const util = require('util');
const dataUtil = require('./data-util');

// CLI
const _interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'node-cli$ ',
});

const ws = new WebSocket(`ws://${config.cosmos_node.url}:${config.cosmos_node.ports[0]}/websocket`);
// TODO: Improve error handling method
try {
  // open ws
  ws.on('open', function open() {
    console.log(`Connection with ${config.cosmos_node.url}:${config.cosmos_node.ports[0]} established!`);
    _interface.prompt();
  });

  // Ws handlers
  ws.on('close', function close() {
    console.log(`Connection with ${config.cosmos_node.url}:${config.cosmos_node.ports[0]} closed!`);
    _interface.prompt();
  });

  ws.on('message', function incoming(data) {
    let json = JSON.parse(data)
    if(isEmpty(json.result)) {
      console.log('Subscribed!');
    } else {
      dataUtil.create(`${json.result.data.type.replace(/.*\//g,'')}-${Date.now()}`, json.result.data, (err) => {
        console.log(err);
      }); 
      // Log full json
      console.log(util.inspect(json.result.data, {showHidden: false, depth: null}))
    }
    _interface.prompt();
  });
} catch (e) {
  console.log(e);
  // Unsubscribe on error
  ws.send(JSON.stringify(unsubscribeMsg));
}

// Queries
let queryIndex = 2;
// Subscribtion query
const eventQueries = [
  'Tx',
  'NewBlock',
  'NewBlockHeader',
  'Vote',
  'NewRound',
  'NewRoundStep',
  'Polka',
  'Relock',
  'TimeoutPropose',
  'TimeoutWait',
  'Unlock',
  'ValidBlock',
  'ValidatorSetUpdates',
  'Lock',
  'CompleteProposal',
];

let subscribeMsg = {
  'jsonrpc': '2.0',
  'method': 'subscribe',
  'id': '0',
  'params': {
    'query': `tm.event='${eventQueries[queryIndex]}'`,
  },
};
// TODO: Try to figuire out when exactly to send
// possible memory leak if WS isn't closed properly
let unsubscribeMsg = {
  'jsonrpc': '2.0',
  'method': 'unsubscribe_all',
  'id': '0',
  'params': {},
};

// Helper method
const isEmpty = (object) => {
  return !object || Object.keys(object).length === 0;
}

// Custom events emitter (Cli commands handing)
class _events extends events {
  constructor() {
    super()
  }
  emit(e) {
    super.emit(...arguments)
  };
}

const e = new _events();

// Event handlers
e.on('init', () => {
  cli.responders.init();
});

// TODO: FIX bug with prompt
e.on('stop', () => {
  cli.responders.stop();
});

e.on('subscribe', (query) => {
  cli.responders.subscribe(query);
});

e.on('scrape', (query) => {
  cli.responders.scrape(query);
});

e.on('man', () => {
  cli.responders.man();
});

e.on('exit', () => {
  cli.responders.exit();
});

// Commands
const commands = [
  'init',
  'stop',
  'subscribe',
  'scrape',
  'man',
  'exit',
];

// Node Cli
const cli = {
  responders: {
    init () {
      ws.send(JSON.stringify(subscribeMsg));
    },
    stop () {
      ws.send(JSON.stringify(unsubscribeMsg));
    },
    subscribe (query) {
      if (isEmpty(query)) {
        console.log('Available queries:');
        for(query of eventQueries) {
          console.log(query);
        }
      } else {
        queryIndex = eventQueries.indexOf(query);
        if(queryIndex === -1) {
          console.log('\x1b[31m%s\x1b[0m','Invalid query! Setted to NewBlockHeader (default).');
          queryIndex = 2;
        }
        console.log('\x1b[32m%s\x1b[0m',`Subscribtion query changed to ${eventQueries[queryIndex]}`);
        subscribeMsg.params.query = `tm.event='${eventQueries[queryIndex]}'`;
      }
    },
    // Todo
    scrape () {

      eventQueries.forEach((query) => {
        let scrapeMsg = {
          'jsonrpc': '2.0',
          'method': 'subscribe',
          'id': '0',
          'params': {
            'query': `tm.event='${query}'`,
          },
        };
        ws.send(JSON.stringify(scrapeMsg));  
      });

    },
    man (){
      console.log('-------\nCommands\n-------\n');
      console.log('1. scrape - Start scraping.\n');
      console.log('2. subscribe - List of available queries.\n');
      console.log('3. subscribe [query_name] - Confiquire your query *(You can only subscribe to one endpoint at a time).\n');
      console.log('4. init - Send subscribtion request to your node.\n');
      console.log('5. stop - Unsubscribe.\n');
      console.log('6. exit - Quit app (or Ctrl+C)\n');
      console.log('For more information, suggestions, or contributions visit: https://github.com/aakatev/tendermint-node-cli\n');
    },
    exit () {
      // TODO: Make sure unsubscribe was send
      // Maybe do a callback ???
      ws.send(JSON.stringify(unsubscribeMsg));
      console.log('\x1b[31m%s\x1b[0m', `Goodbye!`);
      process.exit(0);
    },
  },
  // Handle user input
  processInput(str) {
    str = typeof str === 'string' && str.trim().length > 0 ? str : false;
    if(str) {
      if (commands.indexOf(str) !== -1) {
        e.emit(str)
      } else if(str.slice(0, 9) === 'subscribe') {
        e.emit(str.slice(0, 9), str.slice(10, str.length));
      } else {
        console.log('Invalid input! Try man to get help.');
      }
    }

  },
  // Constructor
  init() {
    console.log('\x1b[36m%s\x1b[0m', `Welcome to Tendermint Node CLI`);

    _interface.on('line', (str) => {
      cli.processInput(str);

      _interface.prompt();
    });

    _interface.on('close', () => {
      // TODO: Make sure unsubscribe was send
      // Maybe do a callback ???
      ws.send(JSON.stringify(unsubscribeMsg));
      console.log('\x1b[31m%s\x1b[0m', `\nGoodbye!`);
      process.exit(0)
    });
  },
};

module.exports = cli;
