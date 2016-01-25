var express = require('express');
var app = express();
var request = require('sync-request');
var fs = require('fs')
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var browser = require('browser-sync');

app.set('view engine', 'jade');

var images_cached = {};

app.get('/:rq', function (req, res) {
  var rq =  req.params.rq;
  if (images_cached[rq] == null) {  // https://developers.google.com/apis-explorer/?hl=fr#p/customsearch/v1/search.cse.list
    var google_key = fs.readFileSync("google.key", "utf8");
    var cx_key = fs.readFileSync("cx.key", "utf8");
    var google_request = request('GET', 'https://www.googleapis.com/customsearch/v1?cx=' + cx_key + '&key=' + google_key + '&imgSize=large&searchType=image&q=' + rq);
    var google_result = JSON.parse(google_request.getBody("utf8"));
    images_cached[rq] = google_result.items;
  }
  res.render('index', {images : images_cached[rq]});
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

app.get('/css/*.scss', function (req, res) {
  var file = req.url.split("/css/");
  var scss = fs.readFileSync(__dirname + '/node_modules/' + file[1], {encoding : 'utf8'});

  var css = sass.renderSync({
    data : scss,
    includePaths : ["sass"]
  }).css.toString();

  var autoprefixed = postcss([ autoprefixer ]).process(css).css;

  res.header('Content-Type', 'text/css');
  res.send(autoprefixed);
});

app.get('/js/*.js', function(req, res){
  var file = req.url.split("/js/");
  var js = fs.readFileSync(__dirname + '/node_modules/' + file[1], {encoding : 'utf8'});

  res.header('Content-Type', 'text/javascript');
  res.send(js);
});

var PORT = 3000;
app.listen(PORT, function () {
  browser.init(null, {
    proxy: "http://localhost:"+PORT,
        files: ["sass/**/*", "views/**/*"],
        port: 7000,
    });
});
