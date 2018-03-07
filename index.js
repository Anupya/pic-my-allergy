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
		/* specialized content for each person like in Facebook */
		'welcomeMessage': 'Hello StarterHacks',

		/* going to display the messages */
		'allergies': allergies
	});
})

/* prints any submitted messages on the web app to the terminal */
app.get('/allergies', function(req, res) {
	console.log(req.query.allergies);

	/* read from json file */
	var allergies = JSON.parse(fs.readFileSync('allergies.json', 'utf-8'));

	/* change to javascript */
	if (req.query.allergies != '') {
		allergies.push(req.query);
	}
	
	/* update it */
	fs.writeFileSync('allergies.json', JSON.stringify(allergies));

	/* actually refreshes the webpage to show the updated one */
	res.redirect('/');
})

/* reset
app.get('/reset', function(req, res) {
	fs.writeFile('allergies.json', 0, function() {console.log('done')})
	allergies.push(req.query);
	fs.writeFileSync('allergies.json', JSON.stringify(allergies));
	res.redirect('/');
})
*/


/* host the website */
http.listen(3000, function() {
	console.log("listening on port 3000");
})
