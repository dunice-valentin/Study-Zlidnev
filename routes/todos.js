var mongoose = require("mongoose");
var express = require('express'),
    router = express.Router();

/*******************************************************************************
* Load models from mongoose to our controllers
* *****************************************************************************/
var TodoModel = mongoose.model("Todo");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('todo/todo', { title: 'Todo' });
});

router.get("/todos/(:state){0,1}", function(req, res, next) {
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

});

module.exports = router;
