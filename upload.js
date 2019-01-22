/* wanted to allow uploading files, but let's get URL working first */

/* HTML CODE

<form id='frmUploader' action='upload' method='post' enctype="multipart/form-data">
    <h3> Upload your image here </h3>

    <input id="the-file-input" type='file' name="imgUploader" onchange="renderImage(this.files[0])"> 
    <p id="preview"></p>
    <script>
        function renderImage (file) { // using HTML5 File API which reduces load on the server
            var reader = new FileReader();

            reader.onload = function(event) {
                the_url = event.target.result;
                console.log("the_url: " + the_url);
                $('#preview').html("Preview: <br><br><img src='" + the_url + "'" + "style='max-width:175px;max-length:175px' />");
            }

            console.log("file: " + file);

            reader.readAsDataURL(file);
        }
    </script>
    <br><br>
    <input id="upload" type='submit' value='Upload' onchange="renderImage(this.files[0])">
</form>

*/

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
    });

    // parse the incoming request containing the form data
    form.parse(req);

    res.redirect('/');
});