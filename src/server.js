const express = require("express");
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const {initSocket} = require("./modules/collaboration/socket");

require("dotenv").config();
// require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const server  = http.createServer(app);

initSocket(server);

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
})