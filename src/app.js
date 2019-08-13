const http = require('http');
const conf = require('./config/defaultConfig.js');
const path = require('path');
const route = require('./helper/route');
//const openUrl = require('./helper/openUrl.js')


class Server {
  constructor(config) {
    this.conf = Object.assign({}, conf, config);
  }

  start() {
    console.log(`Server started at`);
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url);
      route(req, res, filePath, this.conf);
    });

    server.listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.log(`Server started at ${addr}`);
      //openUrl(addr);
    });
  }
}

module.exports = Server;