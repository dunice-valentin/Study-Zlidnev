/**
 * Created by dunice on 10.12.14.
 */
var config = require("./config");       // load config

var mongoose = require('mongoose');
mongoose.connect(config.db);            // connect to DB, using config

var db = mongoose.connection;
/*
* output debug information:
* - on any error
* - once on first connection
*/
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", console.log.bind(console, "Connected to:", config.db));

/*
* load models
*/
require("./models/todo");
