## tendermint-node-cli

#### What is that?

Small nodejs cli tool allowing to subscribe to queries available in Tendermint via WS interface.

#### Features

Two main modes: 1) Subscribing to individual queries; or 2) Scrape all queries as json individual files (filename: timestamp+queryName).  

#### How to install?
```bash
# install dependencies (ws)
npm i && mkdir .data
# run app
node app
```

##### Commands

scrape - Start scraping.

subscribe - List of available queries.

subscribe [query_name] - Confiquire your query.

init - Send subscribtion request to your node.

stop - Unsubscribe.

exit - Quit app (or Ctrl+C).