/* define our application and instantiate Express */
var app = require('express')();

/* pass our app into http */
var http = require('http').Server(app);

/* install Handlebars */
var hbs = require('hbs');

/* store responses using FileSystem */
var fs = require('fs');

app.set('view engine', 'html');
app.engine('html', hbs.__express);

/* default local host */
app.get('/', function(req, res) {

	/* SHOW THE MESSAGES */
	var allergies = JSON.parse(
		fs.readFileSync('allergies.json', 'utf-8')
		);

	res.render(__dirname + '/index.html', {
		/* going to display the messages */
		'allergies': allergies
	});
})

/* prints any submitted messages on the web app to the terminal */
app.get('/allergies', function(req, res) {

	/* read from json file */
	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	/* change to javascript */
	var commaSeparatedAllergies = req.query.allergies.toString();
	var allergies_arr = commaSeparatedAllergies.split(',');

	for (i = 0; i < allergies_arr.length; i++) {
		console.log(allergies_arr[i]);
		allergies.push(allergies_arr[i])
	}

	console.log("THESE ARE ALLERGIES SO FAR: " + allergies);
	console.log("STRINGIFIED VERSION OF ALLERGIES SO FAR: " + JSON.stringify(allergies));

	/* updates the webpage */
	fs.writeFileSync('allergies.json', JSON.stringify(allergies));
	
	/* actually refreshes the webpage to show the updated one */
	res.redirect('/');
})

/* reset */
app.get('/reset', function(req, res) {
	console.log("YOU ARE IN RESET");
	fs.writeFile('allergies.json', 0, function() {console.log('done')})
	allergies.push(req.query);
	fs.writeFileSync('allergies.json', JSON.stringify(allergies));
	res.redirect('/');
})


/* host the website */
http.listen(3000, function() {
	console.log("listening on port 3000");
})
