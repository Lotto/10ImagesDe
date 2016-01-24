var express = require('express');
var app = express();
var request = require('sync-request');
var fs = require('fs')

app.set('view engine', 'jade');

app.get('/:rq', function (req, res) {
	// http://developers.gettyimages.com/api/docs/v3/search/images/get/
  var getty_key = fs.readFileSync("getty.key", "utf8");
  console.log(getty_key);
	var getty_request = request('GET', 'https://api.gettyimages.com/v3/search/images?page_size=10&phrase=' + req.params.rq, { 'headers': { "Api-Key" : getty_key }});
	var getty = JSON.parse(getty_request.getBody("utf8"));
	var images = getty.images;
	var ret = "";
	for(var i = 0; i < images.length; i++) {
		ret += images[i].display_sizes[0]["uri"] + "\n";
	}
  res.render('index', {images : images});
});


app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
