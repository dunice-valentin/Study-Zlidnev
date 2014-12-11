/**
 * Created by dunice on 10.12.14.
 */
var mongoose = require("mongoose");

/*
* Define schema of model: 2 fields
*/
var TodoSchema = new mongoose.Schema({
  title: String,
  state: {
    type: Boolean,
    default: false
  }
});

/*
* Load Schema of model to mongoose area of memory with alias "Todo"
* by this alias it will be available from any place of project
*/
mongoose.model("Todo", TodoSchema);
