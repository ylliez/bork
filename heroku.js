// import Express module & make instance
const express = require("express");
let app = express();
// import HTTP module, set port number & create server
const http = require('http')
const port = process.env.PORT;
let server = http.createServer(app);
server.listen(port, () => { console.log('server listening on port ' + port); })
const io = require('socket.io')(server);
const sockets = io.sockets.sockets;

// serve pages from public and node-modules directories
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
// procedurally declare, route and namespace parameter client page
let exp;
app.get(`/exp`, (req, res) => { res.sendFile(__dirname + `/public/exp.html`); });
exp = io.of(`/exp`);
exp.conns = 0;

let max = io.of('/max');
max.on('connection', (socket) => {
  console.log(`Max/MSP client connected. ${io.engine.clientsCount} clients connected`);
});
max.on('disconnect', () => { exp.conns = 0; });

io.on('connection', (socket) => {
  console.log(`a new user client joined. ${io.engine.clientsCount} clients connected`);
  socket.emit(`${io.engine.clientsCount}`, `exp`)
});

exp.on('connection', (socket) => {
  socket.emit("exp connected");
  exp.conns++;
  let fakeID = exp.conns;
  // Max.post(`${socket.id} joined; ${io.engine.clientsCount} users connected`);
  console.log(`${socket.id} joined; ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    // Max.outlet(`${socket.id} `, args);
    // Max.outlet(args);
    // max.emit(args);
    max.emit(`u${fakeID}`, args);
  });
  socket.on("disconnect", () => {
    // Max.post(`${socket.id} left; ${io.engine.clientsCount} users connected`);
    console.log(`${socket.id} left; ${io.engine.clientsCount} users connected`);
    // exp.conns--;
  });
});