/* search */

/*
<h2> I am allergic to... </h2>
<input type="text" id="search" class="search"></input>
<ul id="searchFoods">
</ul>
*/

var foods = [ 
"potato",
"tomatoes",
"spinach",
"teriyaki",
"chicken"
];

function listFood() {
	var search = $('#search').val();
	console.log("Search: " + search);

	var options = {
		pre: "<b>",
		post: "</b>"
	}
	var filtered = fuzzy.filter(search, foods, options);

	// process the results to extract the strings
	var newFood = filtered.map(function(el) {
		return '<li>' + el.string + '</li>';
	});

	$('#foods').html(newFood.join(''));
}

$(function() {
  // List the initial characters
  listFood();

  // Filter the characters on each change of the textbox
  $('#search').keyup(function() {
  	listFood();
  	console.log("TYPING...");

  });

});

/*
<style>
	b {
		color: blue;
	}
</style>
*/

/* MIGHT NOT NEED TO RUN THIS CODE AGAIN
MLApp.models.initModel('bd367be194cf45149e75f01d59f77ba7').then(
	getModelOutputInfo
);

function getModelOutputInfo(model) {
	model.getOutputInfo().then(
		function(response) {

			console.log("IN REPONSE getModelOutputInfo");
			
			/* store all food concepts in a json file */

			/*
			var numConcepts = response.modelVersion.rawData.active_concept_count;
			var foods = JSON.parse(fs.readFileSync('foods.json', 'utf-8'));
			fs.writeFile('foods.json', '[]', function() {})

			for (var i = 0; i < numConcepts; i++) {
				foods.push({foods: response.outputInfo.data.concepts[i].name});
			}

			fs.writeFileSync('foods.json', JSON.stringify(foods));
			res.redirect('/');
			console.log(response);
		},

		function (err) {
			console.log(err);
		}
	);
}
*/