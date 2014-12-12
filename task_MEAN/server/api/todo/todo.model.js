/**
 * Created by dunice on 12.12.14.
 */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TodoSchema = new Schema({
  title: String,
  state: {
    type: Boolean,
    default: false
  }
});

mongoose.model('Todo', TodoSchema);