const Clarifai = require('clarifai');

const MLApp = new Clarifai.App({
 apiKey: 'bcdc87e24b314c9d9d4dae72d641b65b'
});

/* define our application and instantiate Express */
var express = require('express');
var app = express();

/* pass our app into http */
var http = require('http').Server(app);

/* install Handlebars */
var hbs = require('hbs');

/* define a route to handle form post */
var path = require('path');

/* store responses using FileSystem */
var fs = require('fs');

var formidable = require('formidable');
var rimraf = require('rimraf');
var FileAPI = require('file-api');
var File = FileAPI.file;
var FileList = FileAPI.FileList;
var FileReader = FileAPI.FileReader;

app.set('view engine', 'html');
app.engine('html', hbs.__express);

/* default local host */
app.get('/', function(req, res) {

	/* SHOW THE ALLERGIES */
	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	res.render(__dirname + '/index.html', {
		/* going to display the messages */
		'allergies': allergies
	});
})

/* prints any submitted messages on the web app to the terminal */
app.get('/allergy', function(req, res) {

	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	var commaSeparatedAllergies = req.query.allergies.toString();
	var allergies_arr = commaSeparatedAllergies.split(',');

	for (i = 0; i < allergies_arr.length; i++) {
		if (allergies_arr[i]) { // if string is not empty
			allergies.push({allergies: allergies_arr[i]});
		}
	}

	fs.writeFileSync('allergies.json', JSON.stringify(allergies));
	res.redirect('/');
})

/* reset */
app.get('/reset', function(req, res) {

	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));
	fs.writeFile('allergies.json', '[]', function() {})
	res.redirect('/');
})

/* upload */
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/upload', function(req, res){ /* use https://github.com/mattyork/fuzzy to get user input */

	console.log("IN app.post('/upload', ...)");
	
	// clear the uploads directory before uploading this new photo
	rimraf('./uploads/*', function() {});

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // DO NOT COMMENT THIS OUT
    form.uploadDir = path.join(__dirname, '/uploads');
    form.keepExtensions = false;

    form.on('progress', function(bytesReceived, bytesExpected) {
    	// write your own progress bar here later
    	console.log("IN PROGRESS");

    	if (bytesReceived > 100000) {
    		console.log("TOO BIG!");
    		return false;
    	}
    	
    });

    // rename the file to its original name after it has been uploaded
    form.on('file', function(field, file) {
    	console.log("file.size: " + file.size);
    	if (file.size > 2000000) {
    		console.log("exceeded file size: " + file.size);

    		// inform html code
    		res.redirect('/');
    	}

        console.log("INSIDE FORM.ON");

  	    if ((file.name.split('.').pop() != 'jpg') && 
  		         (file.name.split('.').pop() != 'png'))  {
  	    	res.end("Sorry, we only accept JPGs and PNGs");
  	    }

  	    else {
  		    var ext = "png";
  			console.log("FILE IS VALID");
			fs.rename(file.path, path.join(form.uploadDir, ("image." + ext)));
  	    }
    });

    form.on('error', function(err) {
        console.log('An error has occurred: \n' + err);
    });

    form.on('end', function() {
    	console.log("SUCCESS");
    	// print success message on screen
    });

    // parse the incoming request containing the form data
    form.parse(req);

    res.redirect('/');
});

app.post('/amIAllergic', function(req, res) {
	console.log("INSIDE AMIALLERGIC");

	/* MACHINE LEARNING */
	MLApp.models.predict ("bd367be194cf45149e75f01d59f77ba7", "http://www.coca-colacompany.com/content/dam/journey/us/en/private/2017/04/BravesFood1.rendition.940.456.jpg").then(
	    function(response) {
	    	// get the data from API response and do something here
	    	console.log("Model Name: " + response.rawData.outputs[0].model.name);

	    	if (response.rawData.outputs[0].data.hasOwnProperty("concepts")) {
	    		console.log("CONCEPTS TAG EXISTS");
	    		dataArray = response.rawData.outputs[0].data.concepts;
	    		console.log("DATAARRAY.LENGTH: " + dataArray.length);

	    		var tagArray = new Array(dataArray.length);
	    		var probabilityArray = new Array(dataArray.length);

	    		for (var num = 0; num < dataArray.length; num++) {
	    			tagArray[num] = dataArray[num].name;
	    			probabilityArray[num] = dataArray[num].value;
	    			console.log("tagArray[" + num + "] = " + tagArray[num]);
	    			console.log("probabilityArray[" + num + "] = " + probabilityArray[num]);
	    		}

	    		var allergiesJSON = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	    		/* if anything in allergies list, matches tag array, output it to screen */

	    		var allergies = new Array(allergiesJSON.length);
	    		for (var i = 0; i < allergiesJSON.length; i++) {
	    			allergies[i] = allergiesJSON[i].allergies;
	    			allergies[i].trim();
	    			console.log("allergies[" + i + "]: " + allergies[i]);
	    		}

	    		var edible = true;
	    		var canteatbecause = {};

	    		/* compare allergies and tagArray */

	    		// ERROR: does not work because JSON.parse creates a leading whitespace so it
	    		// does not match the string and does not give an allergy alert

	    		for (var a = 0; a < tagArray.length; a++) {
	    			console.log("-----------------------");
	    			console.log("a = " + a);
	    			for (var b = 0; b < allergies.length; b++) {
	    				if (tagArray[a] == allergies[b]) {
	    					console.log("YOU ARE ALLERGIC TO: " + tagArray[a]);
	    					canteatbecause[tagArray[a]] = probabilityArray[a];
	    					console.log("# reasons you cant eat this: " + Object.keys(canteatbecause).length);
	    					edible = false;
	    				}
	    				console.log("TAG: " + tagArray[a] + " & ALLERGY: " + allergies[b]);
	    			}
	    		}

	    		if (edible) {
	    			console.log("IT IS EDIBLE");
	    		}
	    		else {
	    			console.log("IT IS NOT EDIBLE BECAUSE");
	    			console.log("# reasons you cant eat this: " + Object.keys(canteatbecause).length);
	    			
	    			for (var i = 0; i < Object.keys(canteatbecause).length; i++) {
	    				console.log("Your food has a " + Math.round(Object.values(canteatbecause)[i]*100) + 
	    					"% chance of having " + Object.keys(canteatbecause)[i]);
	    			}
	    		}
	    	}
	    	res.redirect('/');
	      
	    },

	   	// there was an error
	    function(err) {
	    	console.log(err);

	    }
	);

});

/* host the website */
http.listen(3000, function() {
	console.log("Running on localhost:3000");
})
