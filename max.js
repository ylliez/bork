// import Max/MSP API library
const Max = require('max-api-or-not');
Max.post("Max/MSP API loaded");
// import Socket.IO client library & set socket namespace
const io = require("socket.io-client");
const socket = io("https://bork-7250e811ddfb.herokuapp.com/max");
socket.on("connect", () => { Max.post(`client ID: ${socket.id}`); });
socket.on("disconnect", () => { socket.emit("kill"); });
// socket.onAny((args) => { Max.outlet(args); });
socket.onAny((arg1, arg2) => { Max.outlet(arg1, arg2); });