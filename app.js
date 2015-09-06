var express = require('express');
var app = express();
var postgress = require('pg');
var url = require('url');

app.set('port', (process.env.PORT || 8081));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.status(403).send('403 - access denied');
});

app.get('/about', function(request, response) {
  response.status(403).send('403 - access denied');
  //response.render('pages/about');
});

app.get('/db', function(request, response) {
  postgress.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT * FROM urls', function(err, result) {
        done();
        if (err)
         { console.error('an error occured while loading the database' + err); response.send("Error " + err); }
        else
         { response.render('pages/db', {urls: result.rows} ); }
      });
    });
});

app.get('/shorten', function(request, response) {
  postgress.connect(process.env.DATABASE_URL, function(error, client, done) {
    client.query('SELECT * FROM urls', function(error, result) {
      if (error) {
        console.error('an error occured while loading the database' + err); response.send("Error " + err);
      }

      var newID = result.rows.length++;
      var longURL = url.parse(request.url, true).query.url;
      var queryString = 'INSERT INTO urls VALUES (' + newID + ', \'' + longURL + '\');'
      client.query(queryString, function(error, result) {
        if (error) {
          console.error('an error occured while saving the link to the database' + err); response.send("Error " + err);
        } else {
          var shortLink = 'linkbreaker.herokuapp.com/open?ID=' + newID;
          response.render('pages/newLinkAdded', {shortUrl: shortLink});
        }
      });
    });
  });
});

app.get('/open', function(request, response) {
  var urlID = url.parse(request.url, true).query.ID;
  postgress.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT * FROM urls', function(err, result) {
        done();
        result.forEach(function(entry) {
          if (entry.ID.stringify() == urlID) {
            response.render('pages/newLinkAdded', {shortUrl: entry.ID.stringify()});
          }
        });
        if (err) {
          console.error('an error occured while loading the database' + err); response.send("Error " + err);
        }
      });
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));

  if (process.env.IS_HEROKU = 'true') {
  }
});
