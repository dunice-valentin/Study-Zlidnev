/**
 * Created by dunice on 12.12.14.
 */
/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var mongoose = require("mongoose");

var _ = require('lodash');
require('./todo.model');

var Todo = mongoose.model("Todo");

// Get list of things
exports.index = function (req, res, next) {
  Todo.find({}, function (err, todos) {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(err);
    }

    return res.status(200).json(todos);
  });
};

// Get a single _todo
exports.show = function (req, res, next) {
  var id = req.params.id;

  Todo.findById(id, function (err, todo) {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(err);
    }

    if (todo) {
      return res.status(200).json(todo);
    }
    else {
      return res.status(404).json({});
    }
  });
};

// Create a new _todo
exports.create = function (req, res, next) {
  var createQuery = {};
  // I allow to create _todo only by title arg
  var title = req.body.title;
  if (!title) {
    createQuery["title"] = title.toString();
  }

  Todo.create(createQuery, function (err, todo) {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(err);
    }

    return res.status(201).json(todo);
  })
};


