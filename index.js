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

app.post('/upload', function(req, res){
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
	res.redirect('/');

	/* MACHINE LEARNING */
});

/* host the website */
http.listen(3000, function() {
	console.log("Running on localhost:3000");
})

/* FOOD MODEL 
app.models.predict("bd367be194cf45149e75f01d59f77ba7", "https://samples.clarifai.com/food.jpg").then(
    function(response) {
      console.log("MACHINE LEARNING IS GREAT");
    },
    function(err) {
      console.log("MACHINE LEARNING DIDN'T WORK");
    }
  );
*/