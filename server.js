var express = require('express');
var app = express();
var request = require('sync-request');
var fs = require('fs')
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

app.set('view engine', 'jade');

app.get('/:rq', function (req, res) {
  // https://developers.google.com/apis-explorer/?hl=fr#p/customsearch/v1/search.cse.list
  var google_key = fs.readFileSync("google.key", "utf8");
  var cx_key = fs.readFileSync("cx.key", "utf8");
  var google_request = request('GET', 'https://www.googleapis.com/customsearch/v1?cx=' + cx_key + '&key=' + google_key + '&imgSize=large&searchType=image&q=' + req.params.rq);
  var google_result = JSON.parse(google_request.getBody("utf8"));
  var images = google_result.items;
  res.render('index', {images : images});
});

app.get('/css/site.css', function (req, res) {
  var scss = fs.readFileSync(__dirname + '/sass/site.scss', {encoding : 'utf8'});
  
  var css = sass.renderSync({
    data : scss,
    includePaths : ["sass"]
  }).css.toString();

  var autoprefixed = postcss([ autoprefixer ]).process(css).css;

  res.header('Content-Type', 'text/css');
  res.send(autoprefixed);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
