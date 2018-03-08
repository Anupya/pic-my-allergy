/* define our application and instantiate Express */
var app = require('express')();

/* pass our app into http */
var http = require('http').Server(app);

/* install Handlebars */
var hbs = require('hbs');

/* define a route to handle form post */
var path = require('path');

var bodyParser = require('body-parser');

/* store responses using FileSystem */
var fs = require('fs');

var multer = require('multer');

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
/* req is undefined */
app.get('/upload', function (req, res) {
	console.log("IN UPLOAD");
	console.log("REQ: " + req.file);

    var tempPath = req.file.path,
        targetPath = path.resolve('./uploads/image.png');
    if (path.extname(req.file.name).toLowerCase() === '.png') {
        upload(req, res, function(err) {
        	if (err) {
        		return res.end("Error uploading files.");
        	}
        	res.end("File is uploaded");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
        });
    }
});

app.use(bodyParser({uploadDir:'./uploads'}));

/* display the image */
app.get('/image.png', function(req, res) {

	res.sendFile(path.resolve('./uploads/image.png'));
	res.redirect('/');
})


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