/**
 * Created by dunice on 10.12.14.
 */
$(document).ready(function() {
  /****************************************************************************
  * Create new instance of our TodoApp, and sync with remote server
  * **************************************************************************/
  var App = new TodoApp();
  App.sync();

  $("#tabs").on("show.bs.tab", function(event) {
    /**************************************************************************
    * user interaction with tabs. When tab switched - change inner state of
    * our instance of TodoApp and sync with server
    * ************************************************************************/
    var newState = $(event.target).attr("href").slice(1);
    App.state = newState;
    App.sync();
  });

  $("form#todo-form").on("submit", function(event) {
    /**************************************************************************
    * User interaction with app. prevent default operation of submitting form
    * to server. And just call method of our instance of TodoApp. This will 
    * work same way with 'Enter' keypress and 'Submit' button click.
    * ************************************************************************/
    event.preventDefault();

    var text = $("#new-todo").val();
    App.addTodo(text);
    $("#new-todo").val("");
  });

  $("#tabs").on("click", "input:checkbox", function(event) {
    /**************************************************************************
    * user interaction with state of todo. We do not toggle to opposite, but
    * set new, that we want... by calling method of our instance of TodoApp
    * ************************************************************************/
    var id = $(this).closest("li").data("id");  // store ID as 'data' attribute
    var newState = this.checked;
    App.update(id, {state: newState});
  });
  $("#tabs").on("dblclick", "li", function(event) {
    /**************************************************************************
    * user interaction of changing title of todo. Just show/hide tags of entry
    * ************************************************************************/
    $("span", this).hide();
    $("input:text", this).show().focus();
  });
  $("#tabs")
    .on("blur", "input:text", function(event) {
      /************************************************************************
      * Hide input and show text, when click on body of page. "blur" - event
      * of loosing 'focus' from element (input mostly)
      * **********************************************************************/
      $(this).hide();
      $("#tabs li span").show();
    })
    .on("keypress", "input:text", function(event) {
      /************************************************************************
      * user interaction with todo' title to change it. We call same method of
      * instance of our TodoApp, BUT pass other params.
      * **********************************************************************/
      if (event.which === 13) {
        event.preventDefault();
        var id = $(this).closest("li").data("id");
        var title = $(this).val();
        App.update(id, {title: title});
      }
    });

  $("ul.pagination").on("click", "a", function(event) {
    /**************************************************************************
    * User interaction with pagination. Agaign and again just call method of 
    * our instance of TodoApp
    * ************************************************************************/
    var page = $(this).data("page");
    page = parseInt(page);
    if (!_.isNaN(page)) {
      App.gotoPage(page);
    }
  });

  $("#tabs").on("click", ".glyphicon-remove", function(event) {
    /**************************************************************************
    * user interaction with todo entry. Call method of our instance of TodoApp
    * and pass condition to delete: delete by ID. Key should be passed the same
    * as it stores at DB.
    * ************************************************************************/
    var id = $(this).closest("li").data("id");
    App.remove({ _id: id });
  });
  /*****************************************************************************
  * Call method of our instance of TodoApp with a little different conditions:
  * to delete todos only with field "title" equal to "true" (bool) or 
  * without any conditions to delete all.
  * ***************************************************************************/
  $("#remove-checked").on("click", function(event) {
    App.remove({state: true});
  });
  $("#remove-all").on("click", function(event) {
    App.remove();
  });
});

function TodoApp() {
  /*****************************************************************************
  * define new variable, referenced to "this" - scope (visibility area) of app
  * to be able get access from some methods to other methods of TodoApp
  * 
  * Our TodoApp wil have only 2 points of interaction with page / DOM. otherwise
  * it will manipulate / change inner state; or interact with remote server.
  *
  * At current state our app are tough linked to local server and links. it 
  * be moved to several functions and will be one more level of abstraction
  * ***************************************************************************/
  var self = this;


  /*****************************************************************************
  * Define all app variables, we are required to work with:
  * 1. list of todos
  * 2. current tab
  * 3. some vars for pagination
  * ***************************************************************************/
  self.todoList = [];
  self.state = "all";
  self.selectedPage = 1;
  self.perPage = 7;//.42 Some kind of easter egg :)

  /*****************************************************************************
  * First point of interaction with DOM. We hopes (or we declare to outer level)
  * that underscore templates are availeble by thisselectors. We could create
  * templates right here and remove this point of interaction with DOM.
  * ***************************************************************************/
  self.paginationTemplate = _.template($("#todo-pagination-template").text());
  self.linksListTemplate = _.template($("#todo-links-template").text());

  self.sync = function() {
    /***************************************************************************
    * Call "inner" method _get() (thats why it start with underscore), when _get
    * end its execution - call our callback function to check "selectedPage" and
    * render list of todos
    * *************************************************************************/
    self._get(function() {
      if (self.selectedPage < 1 ||
          self.selectedPage > self.todoList.length/self.perPage + 1) {
        self.selectedPage = 1;
      }

      self.render();
    });
  };
  self.render = function() {
    /***************************************************************************
    * Second point of iteraction with DOM. We hopes (or decalre to outer level)
    * that we place result of rendering pagination and list of todos selectors
    * 
    * If we change html of page we will change only this function, and just fix 
    * selectors.
    * *************************************************************************/
    var begin = (self.selectedPage-1) * self.perPage,
        end = self.selectedPage * self.perPage;

    $(".tab-pane#"+ self.state).html(self.linksListTemplate({
      links: self.todoList.slice(begin, end)
    }));

    /***************************************************************************
    * pagination
    * *************************************************************************/
    var pageCount = self.todoList.length / self.perPage;
    $(".pagination").html(self.paginationTemplate({
      selectedPage: self.selectedPage,
      pageCount: pageCount
    }));
  };
  self.addTodo = function(text) {
    text = text || "";
    if (!text.length) {
      alert("Введите текст в поле \"Добавить новое задание\"");
      return void 0;
    }

    $.ajax({
      url: "/todos/",
      type: "POST",
      data: {
        title: text
      },
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        self.todoList.push(data);
        self.render();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("/todos/", textStatus, errorThrown);
        alert(textStatus);
      }
    });
  };
  self.update = function(id, attrs) {
    id = id || "";
    if (_.isObject(attrs) !== true || !id.length) {
      alert("Не могу изменить запись");
      return void 0;
    }
    attrs = _.extend(attrs, {_id: id});

    $.ajax({
      url: "/todos/",
      type: "PUT",
      data: attrs,
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        for(var i=0; i<self.todoList.length; i++) {
          if (self.todoList[i]._id !== data._id)
            continue;

          self.todoList[i] = data;
        }

        self._get(self.render);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("/todos/", textStatus, errorThrown);
        alert(textStatus);
      }
    });
  };
  self.gotoPage = function(page) {
    if (!_.isNumber(page) || _.isNaN(page)) {
      alert("Не могу перейти к странице", page);
      return void 0;
    }

    if (page < 1) {
      page = 1
    }

    self.selectedPage = page;
    self.sync();
  };
  self.remove = function(attrs) {
    if (!_.isObject(attrs)) {
      attrs = {};
    }
    _.each(attrs, function(value, key) {
      if (key === "state") {
        attrs[key] = (value === true || value === "true");
      }
      else {
        attrs[key] = value.toString();
      }
    });

    $.ajax({
      url: "/todos/",
      type: "DELETE",
      data: attrs,
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        self.sync();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("/todos/", textStatus, errorThrown);
      }
    });
  };

  /*****************************************************************************
  * inner functions
  * ***************************************************************************/
  self._get = function(callback) {
    $.ajax({
      url: "/todos/"+self.state,
      type: "GET",
      data: {},
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        self.todoList = data;
        callback();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("/todos/", textStatus, errorThrown);
      }
    });
  };
}
