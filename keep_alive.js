const http = require("http");

function keepAlive() {
  http
    .createServer((req, res) => {
      res.write("I am alive");
      res.end();
    })
    .listen(3001);
}

module.exports = keepAlive;
