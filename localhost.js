// import Max/MSP library
const Max = require('max-api-or-not');
// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
const port = 4200;
let server = http.createServer(app);
server.listen(port, () => { Max.post('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;

// serve pages from public dir
app.use(express.static(__dirname + '/public'));
// procedurally declare, route and namespace parameter client page
let exp;
app.get(`/exp`, (req, res) => { res.sendFile(__dirname + `/public/exp.html`); });
exp = io.of(`/exp`);
exp.conns = 0;

io.on('connection', (socket) => {
  console.log(`a new user client joined. ${io.engine.clientsCount} clients connected`);
  socket.emit(`${io.engine.clientsCount}`, `exp`)
});

exp.on('connection', (socket) => {
  socket.emit("exp connected");
  exp.conns++;
  Max.post(`${socket.id} joined; ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    // Max.outlet(`${socket.id} `, args);
    Max.outlet(args);
  });
  socket.on("disconnect", () => {
    Max.post(`${socket.id} left; ${io.engine.clientsCount} users connected`);
    exp.conns--;
  });
});