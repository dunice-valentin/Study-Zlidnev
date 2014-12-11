var mongoose = require("mongoose");
var express = require('express'),
    router = express.Router();
var _ = require("underscore");

/*******************************************************************************
* Load models from mongoose to our controllers
* *****************************************************************************/
var TodoModel = mongoose.model("Todo");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('todo/todo', { title: 'Todo' });
});

/******************************************************************************
* RESTful api
*   The way to build client-server interaction. Server serve simple request and 
* response plain data. REST declare, that we hava at leas 4 types of requests:
* (with same names as http request types):
* GET - retrive data from server, any arguments - filtering query
* POST - add new items, any arguments - pairs of key and value to add. POST req
*   uest with {name: "Zlydnev", teacher: "true"} to /todos/ will new Todo with
*   fields: "title", "state", "name", "teacher"
* PUT - update existing element, not sure how it should be. See my declaration
* DELETE - delete existing elements. Any arguments - filter query to delete. No
*   arguments - delete all.
* *****************************************************************************/
router.get("/todos/(:state){0,1}", function(req, res, next) {
  /***************************************************************************** 
  * I declare that "state" are the only way to filter results.
  * "/todos/checked" will return todos only with state field set to true
  * "/todos/unchecked" will return todos only with state field set to false
  * any other request will return all todos
  * ***************************************************************************/
  var query = {};
  switch (req.params.state) {
    case "checked": query["state"] = true; break;
    case "unchecked": query["state"] = false; break;
  }

  TodoModel.find(query, function(err, todoCollection) {
    if (err) {
      console.error("get('/todos/') error", err);
      return res.status(500).json(err);
    }

    return res.status(200).json(todoCollection);
  });
});
router.post("/todos/", function (req, res, next) {
  /*****************************************************************************
  * I declare that "title" argument are required and any other arguments skips
  * ***************************************************************************/
  var title = req.body.title;
  if (!title) {
    return res.status(400).json({
      message: "Введите текст"
    });
  }

  var todo = new TodoModel({title: title});
  todo.save(function (err, todo) {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(err);
    }

    if (todo) {
      return res.status(200).json(todo);
    }
    else {
      return res.status(500).json({
        message: "Не получилось сохранить"
      });
    }
  });
});
router.put("/todos/", function (req, res, next) {
  /*****************************************************************************
  * I declare, that ID attr should be passed as part of request's data
  * also I declare that only "title" and "state" are available for change
  * ***************************************************************************/
  var id = req.body._id;
  if (!id) {
    return res.status(400).json({
      message: "Unable to find entry without ID"
    });
  }
  var setQuery = {};
  if (req.body.title) {
    setQuery["title"] = req.body.title;
  }
  if (req.body.state !== undefined) {
    setQuery["state"] = (req.body.state === true || req.body.state === "true");
  }

  TodoModel.findById(id, function (err, todo) {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(err);
    }

    if (todo) {
      todo.set(setQuery);
      todo.save(function (err, todo) {
        if (err) {
          console.error("Error", err);
          return res.status(500).json(err);
        }

        if (todo) {
          return res.status(200).json(todo);
        }
        else {
          return res.status(500).json({
            message: "Не получилось сохранить"
          });
        }
      })
    }
    else {
      return res.status(500).json({
        message: "Не получилось найти запись"
      });
    }
  })
});
router.delete("/todos/", function (req, res, next) {
  /* as described */
  var removeQuery = {};

  _.each(req.body, function(value, key) {
    if (key === "_id") {
      removeQuery[key] = mongoose.Types.ObjectId(value);
    }
    else {
      removeQuery[key] = value.toString();
    }
  });

  TodoModel.remove(removeQuery, function (err, removedCount) {
    if (err) {
      console.console.error("Error", err);
      return res.status(500).json(err);
    }

    return res.status(200).json({removedCount: removedCount});
  });
});

module.exports = router;
