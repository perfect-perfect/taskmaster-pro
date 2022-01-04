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


  // check due date
  auditTask(taskLi);


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

  // enable jQuery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    //  By adding the onClose method, we can instruct the dateInput element to trigger its own change event and execute the callback function tied to it.
    onClose: function() {
      // when calendar is closed, force a change event on the 'dateInput'. this is so when we click away from the datepicker the form will revert to the date we had previously, since we didn't make any cahnges. before we added it, if you clicked away from the datepicker the date would remain an input field for us to alter.
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// one they click outside of the date after editing, this will run.
// value of due date has changed. we use change instead of blur here. We need it to know when we are done editing (see 5.4.4 if you need to develop this idea)
$(".list-group").on("change", "input[type='text']", function() {
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

  // pass task's <li> element into auditTask() to check new due date and apply color if necessary
  auditTask($(taskSpan).closest(".list-group-item"));

});

// jQuery UI that allows tasks to be dragged winthin the same column and across other columns
// sortable() turned every element with the class list-group into a sortable list
// the connectWith property then linked these sortable lists with any other lists that have the same class
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerence: "pointer",
  // helper tells jQuery to create a copy of the dragged element and move the copy instead of the original. This is necessary to prevent click events from accidently triggering on the original element (i think i understand what this says.)
  helper: "clone",

  // lessons says these below are even listener
  // activate and deactive trigger once for all connected lists as soon as dragging starts or stops. Lesson also notes that these would be greate for styling.
  activate: function(event) {
    console.log("activate", this);
  },
  // triggered once dragging stops
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  // triggered when a dragged item enters a connected list
  over: function(event) {
    console.log("over", event.target);
  },
  // triggered when a dragged item leaves a connected list
  out: function(event) {
    console.log("out", event.target);
  },
  // triggers when contents of a list have changed (e.g., the items were reordered, an item was removed, or an item was added)
  update: function(event) {

    // array to store the task data in
    var tempArr = [];


    // loop over current set of children in sortable list
    // the "this" here is a jQuery this
    // the children method returns an array of the list element's children (the <li> elements, labeled as li.list-group-item)
    // each method will run a callback function for every item/element in the array, it's another form of looping, except that function is now called on each loop iteration.
    $(this).children().each(function() {


      // $(this) here refers to the child element at the index. This is another example fo scoped variables. the $(this) here is different then the one above
      // strips out the task's description and due date, these ultiamtely need to go to an array
      var text = $(this)
        .find("p")
        .text()
        .trim();
      

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // the next step is to use the tempArr array to overwrite what's currently saved in the tasks object
    // we are dealing with multiple lists (toDo, inProgress,..)

    // trim down list's ID to match object property
    var arrName = $(this)
      // what does attr do with only one variale. When there are two it sets t
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;

    saveTasks();
  }
});

// begin task audit due to date. changes color of the task based on current date anf time.
// set it up to accept the task's <li> element as a parameter
var auditTask = function(taskEl) {
  // get date from task element. we use jQuery to select the taskEl element and find the <span> element inside it, then retrieve the text value using .text().  we chained on the javascript .trim() as well.
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  // with moment(date,"L") we use the date variable we created to make a new moment object, for the uses local time.
  // with .set("hour", 17)  we  convert the day ending from 12:00 am to 5:00pm of that day, since work doesn;t end at midnight.
  var time = moment(date, "L").set("hour", 17);


  // remove any old classes from the element that may have been added. for example if a task turned red due to the date passing, and then we changed the due date to a week in the future. this would make sure that old red color wouldn't stick around
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");


  // apply new class if task is near/over due date
  // we're checking if the current date and time are later than the date and time we pulled from taskEl. if so, the date and time from taskEl are in the past, and we add the list-group-item-danger
  // the JavaScript math object's .abs() get;s the absolute value of a number. the difference between days turns out to be a negatice number and that can cause some confusion in conceptualizing certain things. so we use this method to make it an abolute value, aka a positive number.
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }

  // if the date is within two days the task will turn yellow
  // when we use moment() to get right now and use .diff() afterwards to get the difference of right now to a day in the future
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};

// begin trash
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // ui is a second function parameter. This variable is an object that contains a property called draggable. 
    // draggable is a jQuery object representing the draggable element. Therefore we can can call DOM methods on it
    // jQuery's remove() is the same as JavaScript. It will remove the element entirely from the DOM.
    ui.draggable.remove();

    // after deting the task we don't have to run saveTask() because remoivng a task from any of the lists triggers the update() on the sortable function. anytime one is moed that function is called and that function has saveTask at the bottom

  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

 

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// this adds the datepicker when we go to input the due date for the task in the modal. The #moalDueDate refers to the id on the input element for the date.
$("#modalDueDate").datepicker({
  // makes it so you cannot pick a due date in the past. a value of 1 for minDate  indicates how many days after the current date we want the limit to kick in. we set it for a min of one day away from today.
  minDate: 1
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


