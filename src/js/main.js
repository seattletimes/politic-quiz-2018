require("./lib/social");
require("./lib/ads");
var track = require("./lib/tracking");
require("component-responsive-frame/child");

var $ = require("jquery");
var ich = require("icanhaz");
var Share = require("share");

var questionTemplate = require("./_questionTemplate.html");
var overviewTemplate = require("./_overviewTemplate.html");

// Set up templates
ich.addTemplate("questionTemplate", questionTemplate);
ich.addTemplate("overviewTemplate", overviewTemplate);


var resultTemplate = require("./_resultTemplate.html");
ich.addTemplate("resultTemplate", resultTemplate);


new Share(".share-button", {
  ui: {
    flyout: "top center"
  },
  networks: {
    email: {
      description: [document.querySelector(`meta[property="og:description"]`).innerHTML, window.location.href].join("\n")
    }
  }
});

//create new question from template
var showQuestion = function(id) {
  $(".question-box").html(ich.questionTemplate(quizData[id]));
  $(".index").html(id + " of " + Object.keys(quizData).length);
};

// show next button when answer is selected
var watchInput = function() {
  $(".quiz-box").on("click", "input", (function(){
    $(".submit").addClass("active");
    $(".submit").attr("disabled", false);
  }));
};

var id = 1;

var score = 0;

$(".quiz-container").on("click", ".submit", function() {
  // score answer
  var answerData = {};
  answerData.question = quizData[id].question;
  var correct = $("input:checked").val();
  if (correct) { 
    score += 1;
    answerData.hooray = true;
  }

  // keep track of selected answer
  quizData[id].answers.forEach(function(a) {
    if (a.correct) {
      answerData.answer = a.answer;
      answerData.link = quizData[id].link;
      answerData.caption = quizData[id].caption;
      answerData.description = a.correct == "x" ? "" : a.correct;
    }
  });

  $(".question-box").html(ich.resultTemplate(answerData));
  $(".index").html(id + " of " + Object.keys(quizData).length);

  // Change button text on last question
  if (id == Object.keys(quizData).length) {
    $(".next").html("Finish");
  }
  watchNext();
});

var watchNext = function() {
  $(".next").click(function() {
    if (id < Object.keys(quizData).length) {
      // move on to next question
      id += 1;
      showQuestion(id);
      $(".next").removeClass("active");
      $(".next").attr("disabled", true);
    } else {
      calculateResult();
    }
  });
};

var calculateResult = function() {
  for (var i = 0; i < resultsData.length; i++) {
    var result = resultsData[i];
    if (score >= result.min && score <= result.max) {
      // display result
      result.score = score;
      if (result.score > 5) { 
        result.color = "#589040";
      } else if (result.score > 2) { 
        result.color = "#F5AE3F";
      } else {
        result.color = "#e12329";
      }
      result.total = Object.keys(quizData).length;

      result.outcomes = resultsData.filter(r => r.description).map(r => ({
        description: `${r.min} - ${r.max}: ${r.description}`,
        match: r == result
      }));

      $(".question-box").html(ich.overviewTemplate(result));
      
      new Share(".share-results", {
        description: "I scored " + result.score + "/" + result.total + "! " + document.querySelector(`meta[property="og:description"]`).content,
        ui: {
          flyout: "bottom right",
          button_text: "Share results"
        },
        networks: {
          email: {
            description: "I scored " + result.score + "/" + result.total + "! " + [document.querySelector(`meta[property="og:description"]`).content, window.location.href].join("\n")
          }
        }
      });

      return;
    }
  }
};



showQuestion(id);
watchInput();
