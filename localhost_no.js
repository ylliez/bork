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
let exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, exp9, exp10, exp11, exp12, exp13, exp14;
let exp = [exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, exp9, exp10, exp11, exp12, exp13, exp14]
let exp_tag = [`exp1`, `exp2`, `exp3`, `exp4`, `exp5`, `exp6`, `exp7`, `exp8`, `exp9`, `exp10`, `exp11`, `exp12`, `exp13`, `exp14`]
let exp_name = [`EXP1`, `EXP2`, `EXP3`, `EXP4`, `EXP5`, `EXP6`, `EXP7`, `EXP8`, `EXP9`, `EXP10`, `EXP11`, `EXP12`, `EXP13`, `EXP14`]
for (let i = 0; i < exp.length; i++) {
  app.get(`/${exp_tag[i]}`, (req, res) => { res.sendFile(__dirname + `/public/${exp_tag[i]}.html`); });
  exp[i] = io.of(`/${exp_tag[i]}`);
  exp[i].conns = 0;
}
let exps = io.of(`/exp`);
app.get(`/exp`, (req, res) => {
  for (let i = 0; i < exp.length; i++) {
    if (exp[i].conns < 1) {
      res.sendFile(__dirname + `/public/${exp_tag[i]}.html`);
    }
  }
});

io.on('connection', (socket) => {
  console.log(`a new user client joined. ${io.engine.clientsCount} clients connected`);
  socket.emit(`${io.engine.clientsCount}`, `exp`)
});

exps.on('connection', (socket) => {
  socket.emit("exp connected");
  exps.conns++;
  Max.post(`${socket.id} joined; ${io.engine.clientsCount} users connected`);
  socket.onAny((event, args) => {
    Max.outlet(args);
  });
  socket.on("disconnect", () => {
    Max.post(`${socket.id} left; ${io.engine.clientsCount} users connected`);
    exps.conns--;
  });
});

for (let i = 0; i < exp.length; i++) {
  exp[i].on('connection', (socket) => {
    if (exp[i].conns >= 1) {
      Max.post(`${socket.id} tried to join ${exp_name[i]} but already occupied`);
      socket.emit("reject");
    } else {
      socket.emit("accept");
      exp[i].conns++;
      Max.post(`${socket.id} joined ${exp_name[i]}. ${io.engine.clientsCount} users connected`);
      io.emit(`connFull`, `${exp_tag[i]}`)
      socket.onAny((event, args) => {
        Max.outlet(args);
      });
      socket.on("disconnect", () => {
        Max.post(`${socket.id} left ${exp_name[i]}. ${io.engine.clientsCount} users connected`);
        io.emit(`connOpen`, `${exp_tag[i]}`)
        exp[i].conns--;
      });
    }
  });
}
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