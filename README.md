## tendermint-node-cli

#### What is that?

Small nodejs cli tool allowing to subscribe to queries available in Tendermint via WS interface.

#### Features

s

#### How to install use?
s
```bash
# install dependencies (ws)
npm i && mkdir .data
# run app
node app
```

##### Commands

scrape - Start scraping.

subscribe - List of available queries.

subscribe [query_name] - Confiquire your query *(You can only subscribe to one endpoint at a time).

init - Send subscribtion request to your node.

stop - Unsubscribe.

exit - Quit app (or Ctrl+C).