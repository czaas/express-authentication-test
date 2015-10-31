var express = require('express'),
	app = require('./app.js'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken'),
	config = require('./config.js'),
	User = require('./models/user'),
	apiRoutes = require('./api-router.js');

var port = process.env.PORT || 8080;

mongoose.connect(config.database);
app.set('superSecret', config.secret); 

app.use(bodyParser({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev')); // logs requests to the console

app.use('/api', apiRoutes);

app.get('/', function(req, res){
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// initial setup
app.get('/setup', function(req, res){
	var userPass = 'password11String';

	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(userPass, salt, function(err, encrypted){
			if(err) { throw err; }
			
			var cameron = new User({
				name: 'Cameron Zaas',
				password: encrypted,
				admin: true
			});

			cameron.save(function(err){
				if(err){ throw err; }

				console.log('user saved!');
				res.json({success: true});
			})
		});
	});
});


app.listen(port);
console.log('Magic happens at http:localhost:' + port); 