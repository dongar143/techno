const winston = require('winston');
const express = require('express');
const app = express();

const config = require("config");
let server;
let protcol = config.get("serverProtocal");
if (protcol == "https") {
  const fs = require("fs");
  httpsOptions = module.exports = {
    key: fs.readFileSync("KEY GOES HERE"),
    cert: fs.readFileSync("CERT GOES HERE")
  };


  console.log("https Server Started");
  server = require("https").createServer(httpsOptions, app);
} else {
  console.log("http Server Started");
  server = require("http").createServer(app);
}

require('./startup/db')();
require('./startup/routes')(app);
require('./startup/validation')();
require('./startup/prod')(app);
//start socket server
require("./startup/socketserver")(server);


// Listen to port 3000
const PORT = config.get("port");
server.listen(PORT, () => { console.log("Server started ", PORT) })


module.exports = server;
