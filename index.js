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

/*
$("#the-file-input").change(function() {
	console.log("photo file has been chosen");
	//grab the first image in the fileList
	//in this example we are only loading one file.
	console.log(this.files[0].size);
	console.log(this.files[0]);
	renderImage(this.files[0]);
});
*/

/* req is undefined */
app.post('/upload', function(req, res){
	console.log("IN UPLOADS");
	// clear the uploads directory
	rimraf('./uploads/*', function() {});

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    // form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {

  	  if ((file.name.split('.').pop() == 'jpg') || 
  		  (file.name.split('.').pop() == 'png')) {
  			  var ext = "png";
  			  fs.rename(file.path, path.join(form.uploadDir, ("image." + ext)));
  	  }
  	  else {
  		  res.end("Sorry, we only accept JPGs and PNGs");
  	  }
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occurred: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
    	console.log("SUCCESS");
    	// renderImage(req.file);
    });

    // parse the incoming request containing the form data
    form.parse(req);
    console.log("ABOUT TO DISPLAY IMAGE FILE ");

    // display image file to browser 
    //renderImage('./uploads/image.png');
    //console.log("RENDER IMAGE HAS RUN");
    //res.redirect('/');
});

function renderImage (file) {
	var reader = new FileReader();

	reader.onload = function(event) {
		the_url = event.target.result;
		console.log("the_url: " + the_url);
		$('#frmUploader').html("<img src='" + the_url + "' />");
	}

	reader.readAsDataURL(file);

	$('#the-file-input').change(function() {
		console.log(this.files);
		renderImage(this.files[0]);
	});
}

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