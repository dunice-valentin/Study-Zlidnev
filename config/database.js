/**
 * Created by dunice on 10.12.14.
 */
var config = require("./config");

var mongoose = require('mongoose');
mongoose.connect(config.db);

var db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", console.log.bind(console, "Connected to:", config.db));

require("./models/todo");
