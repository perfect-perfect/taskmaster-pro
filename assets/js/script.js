var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// this and the folliwng function are to edit and update task text
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
    

  //  using <> here makes jQuery create an element
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  
  $(this).replaceWith(textInput);

  textInput.trigger("focus");
  


});

// the blur event will trigger as soon as the user interacts with anything other then the <textarea> elememt. so, after you are done editing you just clcik away from the text area and it will run this
$(".list-group").on("blur", "textarea", function(){
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")

    // returns the ID, which will be "list-" followed by a catagory. 
    // we are chaining this operator to replace() to remove "list-" from the text, which will give us the catagory name (e.g., "To Do") that will match one of the arrays on the tasks object(e.g., tasks.toDo)
    .attr("id")

    // js operator to find and replace text in a string
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // returns the text property of th object at a given index
  tasks[status][index].text = text;

  // updating this tasks object was necesarry for localStorage, so we call saveTasks()
  saveTasks();

  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);

});

// this and the next function update dates in the tasks
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // crea new input element
  var dateInput = $("<input>")
    // with two attributes listed the attri() operator creates and sets and attribute
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// one they click outside of the date after editing, this will run.
// value of due date has changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "")

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update tas in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  //reacreate span element with bootstap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

});

 

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


