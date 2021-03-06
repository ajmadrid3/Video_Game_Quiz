'use strict';
const Alexa = require('alexa-sdk');
var APP_ID = undefined;

//=========================================================================================================================================
// Data:   
//=========================================================================================================================================

var data = [
                {VideoGameName: "Punch-Out",                                  VideoGameGenre: "Fighting",                     VideoGameDev: "Nintendo",                       VideoGamePub: "Nintendo",                               ReleaseYear: 1984,  Platform: "Arcade"},
                {VideoGameName: "Punch-Out",                                  VideoGameGenre: "Sports",                       VideoGameDev: "Nintendo",                       VideoGamePub: "Nintendo",                               ReleaseYear: 1987,  Platform: "Nintendo Entertainment System"}
            ];

//=========================================================================================================================================
// Messages: 
//=========================================================================================================================================


var speechConsCorrect = ["Booya", "All righty", "Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cha Ching", "Cheers", "Dynomite", 
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Oh dear.  Just kidding.  Hurray", "Kaboom", "Kaching", "Oh snap", "Phew", 
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "You got it", "Yowsa"];

var speechConsWrong = ["Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun", "Eek", "Honk", "Le sigh",
"Mamma mia", "Oh boy", "Oh dear", "Oof", "Ouch", "Ruh roh", "Shucks", "Uh oh", "Wah wah", "Whoops a daisy", "Yikes"];

var WELCOME_MESSAGE = "Welcome to Video Game Quiz!  You can ask me for information about a video game, or you can ask me to start a quiz.  What would you like to do?";  

var START_QUIZ_MESSAGE = "OK.  I will ask you 10 questions about video games.";

var EXIT_SKILL_MESSAGE = "Thank you for playing the Video Game Quiz!  Let's play again soon!";

var REPROMPT_SPEECH = "Which other video game would you like to know about?";

var HELP_MESSAGE = "I hold a collection of video game knowledge.  You can ask me about a game and I'll tell you information about it.  You can also test your knowledge by asking me to start a quiz.  What would you like to do?";

function getBadAnswer(item) { return "I'm sorry. " + item + " is not something I know very much about in this skill. " + HELP_MESSAGE; }

function getCurrentScore(score, counter) { return "Your current score is " + score + " out of " + counter + ". "; }

function getFinalScore(score, counter) { return "Your final score is " + score + " out of " + counter + ". "; }

function getSpeechDescription(item)
{
    var sentence = item.VideoGameName + " is a " + item.VideoGameGenre + ".  It was developed by <say-as interpret-as='digits'>" + item.VideoGameDev + "</say-as> and published by " + item.VideoGamePub + ".  It was released in " + item.ReleaseYear + " for " + item.Platform + ".  Which other video game would you like to know about?";
    return sentence;
}

function getQuestion(counter, property, item)
{
    //return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of "  + item.StateName + "?";

    
    switch(property)
    {
        case "Name":
            return "Here is your " + counter + "th question.  Which video game was developed by " + item.VideoGameDev + " and released in " + item.ReleaseYear + "?";
        break;
        case "Year":
            return "Here is your " + counter + "th question.  What year was " + item.VideoGameName + " released in?";
        break;
        case "Genre":
            return "Here is your " + counter + "th question.  Who developed " + item.VideoGameName + "?";
        break;
        default:
            return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of "  + item.VideoGameName + "?";
        break;
    }
    
}

function getAnswer(property, item)
{
    switch(property)
    {
        case "Name":
            return "The " + formatCasing(property) + " of " + item.VideoGameName + " is <say-as interpret-as='spell-out'>" + item[property] + "</say-as>. "
        break;
        default:
            return "The " + formatCasing(property) + " of " + item.VideoGameName + " is " + item[property] + ". "
        break;
    }
}

//=========================================================================================================================================
// States and Handlers: 
//=========================================================================================================================================

var counter = 0;

var states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

const handlers = {
     "LaunchRequest": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
     },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AnswerIntent": function() {
        this.handler.state = states.START;
        this.emitWithState("AnswerIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
    },
    "Unhandled": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
    }
};

var startHandlers = Alexa.CreateStateHandler(states.START,{
    "Start": function() {
        this.emit(":ask", WELCOME_MESSAGE, HELP_MESSAGE);
    },
    "AnswerIntent": function() {
        var item = getItem(this.event.request.intent.slots);

        if (item == null) 
        {
            this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
        }
        else 
        {
            if (item[Object.getOwnPropertyNames(data[0])[0]] != undefined)
            {
                this.emit(":ask", getSpeechDescription(item), REPROMPT_SPEECH);
            }
            else
            {
                this.emit(":ask", getBadAnswer(item), getBadAnswer(item));
            
            }
        }
    },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
    },
    "Unhandled": function() {
        this.emitWithState("Start");
    }
});


var quizHandlers = Alexa.CreateStateHandler(states.QUIZ,{
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }

        var random = getRandom(0, data.length-1);
        var item = data[random];

        var propertyArray = Object.getOwnPropertyNames(item);
        var property = propertyArray[getRandom(1, propertyArray.length-1)];

        this.attributes["quizitem"] = item;
        this.attributes["quizproperty"] = property;
        this.attributes["counter"]++;

        var question = getQuestion(this.attributes["counter"], property, item);
        var speech = this.attributes["response"] + question;

        this.emit(":ask", speech, question);
    },
    "AnswerIntent": function() {
        var response = "";
        var item = this.attributes["quizitem"];
        var property = this.attributes["quizproperty"]

        var correct = compareSlots(this.event.request.intent.slots, item[property]);

        if (correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(property, item);

        if (this.attributes["counter"] < 10)
        {
            response += getCurrentScore(this.attributes["quizscore"], this.attributes["counter"]);
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else
        {
            response += getFinalScore(this.attributes["quizscore"], this.attributes["counter"]);
            this.emit(":tell", response + " " + EXIT_SKILL_MESSAGE);
        }
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.CancelIntent": function() {
        this.emit(":tell", EXIT_SKILL_MESSAGE);
    },
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", HELP_MESSAGE, HELP_MESSAGE);
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
});

//=========================================================================================================================================
// Helper Methods:
//=========================================================================================================================================


function compareSlots(slots, value)
{
    for (var slot in slots)
    {
        if (slots[slot].value != undefined)
        {
            if (slots[slot].value.toString().toLowerCase() == value.toString().toLowerCase())
            {
                return true;
            }
        }
    }
    return false;
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getRandomSymbolSpeech(symbol)
{
    return "<say-as interpret-as='spell-out'>" + symbol + "</say-as>";
}

function getItem(slots)
{
    var propertyArray = Object.getOwnPropertyNames(data[0]);
    var value;
    var first, second;
    
    for (var slot in slots)
    {
        if (slots[slot].value !== undefined)
        {
            value = slots[slot].value;
            for (var property in propertyArray)
            {
                var item = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
                if (item.length > 0 && first == null)
                {
                    first = item[0];
                }
                else if (item.length > 0 && first !== null)
                {
                    second = item[0];
                }
            }
            if (second == null)
            {
                return first;
            }
        }
    }
    return value;
}

function getSpeechCon(type)
{
    var speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length-1)] + " </say-as><break strength='strong'/>";    
}

function formatCasing(key)
{
    key = key.split(/(?=[A-Z])/).join(" ");
    return key;
}

function getTextDescription(item)
{
    var text = "";
    
    for (var key in item)
    {
        text += formatCasing(key) + ": " + item[key] + "\n";
    }
    return text;
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};
