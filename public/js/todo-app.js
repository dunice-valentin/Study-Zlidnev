/**
 * Created by dunice on 10.12.14.
 */
$(document).ready(function() {
  var App = new TodoApp();
  App.sync();

  $("#tabs").on("show.bs.tab", function(event) {
    var newState = $(event.target).attr("href").slice(1);
    App.state = newState;
    App.sync();
  });

  $("form#todo-form").on("submit", function(event) {
    event.preventDefault();

    var text = $("#new-todo").val();
    App.addTodo(text);
  });

  $("#tabs").on("click", "input:checkbox", function() {
    var id = $(this).closest("li").data("id");
    var newState = this.checked;
    App.update(id, {state: newState});
  });
});

function TodoApp() {
  var self = this;

  self.todoList = [];
  self.state = "all";
  self.selectedPage = 1;
  self.perPage = 7;//.42

  self.paginationTemplate = _.template($("#todo-pagination-template").text());
  self.linksListTemplate = _.template($("#todo-links-template").text());

  self.sync = function() {
    self._get(self.render);
  };
  self.render = function() {
    var begin = (self.selectedPag-1) * self.perPage,
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

        self.render();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("/todos/", textStatus, errorThrown);
        alert(textStatus);
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
