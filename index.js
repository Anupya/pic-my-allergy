const Clarifai = require('clarifai');

const MLApp = new Clarifai.App({
 apiKey: 'bcdc87e24b314c9d9d4dae72d641b65b'
});

/* define our application and instantiate Express */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);

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

var JSAlert = require("js-alert");

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'html');
app.engine('html', hbs.__express);

/* default local host */
app.get('/', function(req, res) {

	var foods = JSON.parse(fs.readFileSync('foods.json', 'utf-8'));

	/* SHOW THE ALLERGIES */
	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	if (allergies.length == 0) {
		allergies = [ {allergies: 'You have selected no allergies'} ];
	}

	res.render(__dirname + '/index.html', {
		/* going to display the messages */
		'allergies': allergies,
		'foods': foods
	});

	//res.sendFile(__dirname + "/index.html");
})

/* Update JSON file with allergy list */
app.get ('/allergy', function(req, res) {

	// empty the file + store file contents in allergies
	fs.writeFileSync('allergies.json', '[]', function() {})
	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));
	var foods = JSON.parse(fs.readFileSync('foods.json', 'utf-8'));

	for (var i = 0; i < req.query.sel.length; i++) {
		allergies.push({allergies: req.query.sel[i]});
	}

	// write to JSON file
	fs.writeFileSync('allergies.json', JSON.stringify(allergies));

	res.redirect('/');
})


/* reset */
app.get('/reset', function(req, res) {

	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));
	fs.writeFile('allergies.json', '[]', function() {})
	res.redirect('/');
})

app.get('/amIAllergic', function(req, res) {

	var allergiesJSON = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));
	var foods = JSON.parse(fs.readFileSync('foods.json', 'utf-8'));

	/* if anything in allergies list, matches tag array, output it to screen */
	var atleast1 = "Please enter atleast 1 allergy.";

	if (allergiesJSON.length == 0) {
		res.render(__dirname + '/index.html', {
			/* going to display the messages */
			'allergies': allergiesJSON,
			'foods': foods,
			'atleast1': atleast1
		});
	}

	var canteatbecause = {};
	var dangerArr = [];
	var message;

	/* MACHINE LEARNING */
	MLApp.models.predict ("bd367be194cf45149e75f01d59f77ba7", req.query.url).then(
	    function(response) {
	    	// get the data from API response and do something here

	    	if (response.rawData.outputs[0].data.hasOwnProperty("concepts")) {
	    		
	    		dataArray = response.rawData.outputs[0].data.concepts;

	    		var tagArray = new Array(dataArray.length);
	    		var probabilityArray = new Array(dataArray.length);

	    		for (var num = 0; num < dataArray.length; num++) {
	    			tagArray[num] = dataArray[num].name;
	    			probabilityArray[num] = dataArray[num].value;
	    			//console.log("tagArray[" + num + "] = " + tagArray[num]);
	    			//console.log("probabilityArray[" + num + "] = " + probabilityArray[num]);
	    		}

	    		// if anything in allergies list, matches tag array, output it to screen 

	    		var allergies = new Array(allergiesJSON.length);
	    		for (var i = 0; i < allergiesJSON.length; i++) {
	    			allergies[i] = allergiesJSON[i].allergies;
	    		}

	    		var edible = true;

	    		/* I am storing this information in 3 places because I will work on keeping the best 
	    		implementation, a JSON object later */

	    		/* 1. DANGER.JSON */
	    		fs.writeFileSync('danger.json', '[]', function() {})
				var danger = JSON.parse(fs.readFileSync('danger.json', 'utf-8'));

				for (var a = 0; a < tagArray.length; a++) {
					for (var b = 0; b < allergies.length; b++) {
						if (tagArray[a] == allergies[b]) {
							danger.push({food: tagArray[a], probability: probabilityArray[a]*100});
							edible = false;
						}
					}

				}

				fs.writeFileSync('danger.json', JSON.stringify(danger));

	    		if (edible) {
	    			message = "This food is good to eat!";
	    			console.log("IT IS EDIBLE");
	    		}
	    		else {
	    			message = "Uh oh. You may be allergic to something in this picture.";
	    			console.log("IT IS NOT EDIBLE");
	    			console.log("# reasons you cant eat this: " + danger.length);

	    			for (var i = 0; i < danger.length; i++) {
	    				console.log("Your food has a " + Math.round(danger[i].probability) + 
	    					"% chance of having " + danger[i].food);
	    			}
	    		}

				res.render(__dirname + '/index.html', {
					/* going to display the messages */
					'foods': foods,
					'allergies': allergiesJSON,
					'message': message,
					'danger': danger
				});
	    	}
	      
	    },

	   	// there was an error
	    function(err) {
	    	console.log(err);

	    }

	);
	
});

module.exports = app;

/* host the website */
http.listen(process.env.PORT || 3000, function() {
	console.log("Running on", http.address().port);
});
