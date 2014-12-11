/**
 * Created by dunice on 10.12.14.
 */
/*
* Declare to use specific PORT, DB
* could be configurated diffently for development, staging, production, etc
*/
var config = {
  "db":   "mongodb://localhost/todo_express",
  "port": 3000
};

module.exports = config;
