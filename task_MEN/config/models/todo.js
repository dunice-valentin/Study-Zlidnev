/**
 * Created by dunice on 10.12.14.
 */
var mongoose = require("mongoose");

var TodoSchema = new mongoose.Schema({
  title: String,
  state: {
    type: Boolean,
    default: false
  }
});

mongoose.model("Todo", TodoSchema);
