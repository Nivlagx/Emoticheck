var currentMood;
// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0];
// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
var refreshbtn = $("#refreshbtn")[0]; //You dont have to use [0], however this just means whenever you use the object you need to refer to it with [0].
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse your mood...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) {
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores);
            totalMood = getTotalMood(emotionScores);
            changeUI(); //time to update the web app, with their emotion!
        });
    });
});
function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}
function changeUI() {
    //Show detected mood
    pageheader.innerHTML = "Your mood is: " + currentMood.name; //Remember currentMood is a Mood object, which has a name and emoji linked to it. 
    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
}
// Refer to http://stackoverflow.com/questions/35565732/implementing-microsofts-project-oxford-emotion-api-and-file-upload
// and code snippet in emotion API documentation
function sendEmotionRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "648c5e251eaf41a6ad9d95de4ad9b781");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            // Get the emotion scores
            var scores = data[0].scores;
            callback(scores);
        }
        else {
            pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Try another?";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
        console.log(error.getAllResponseHeaders());
    });
}
// Section of code that handles the mood
//A Mood class which has the mood as a string and its corresponding emoji
var Mood = (function () {
    function Mood(mood) {
        this.mood = mood;
        this.name = mood;
    }
    return Mood;
}());
var happy = new Mood("happy");
var sad = new Mood("sad");
var angry = new Mood("angry");
var neutral = new Mood("neutral");
// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores) {
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    }
    else if (scores.sadness > 0.4) {
        currentMood = sad;
    }
    else if (scores.anger > 0.4) {
        currentMood = angry;
    }
    else {
        currentMood = neutral;
    }
    return currentMood;
}
//Mood Percent
var totalMood;
function getTotalMood(scores) {
    totalMood = scores.anger + scores.contempt + scores.disgust + scores.fear + scores.happiness + scores.neutral + scores.sadness + scores.surprise;
    document.getElementById("anger").innerHTML = "Anger Level: " + ((scores.anger / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("contempt").innerHTML = "Contempt Level: " + ((scores.contempt / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("disgust").innerHTML = "Disgust Level: " + ((scores.disgust / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("fear").innerHTML = "Fear Level: " + ((scores.fear / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("happiness").innerHTML = "Happiness Level: " + ((scores.happiness / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("neutral").innerHTML = "Neutral Level: " + ((scores.neutral / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("sadness").innerHTML = "Sadness Level: " + ((scores.sadness / +totalMood) * 100).toFixed(2) + "%";
    document.getElementById("surprise").innerHTML = "Surprise Level: " + ((scores.surprise / +totalMood) * 100).toFixed(2) + "%";
    return totalMood;
}
