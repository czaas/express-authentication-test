var express = require('express'),
	apiRoutes = express.Router(),
	User = require('./models/user.js'),
	bcrypt = require('bcrypt'),
	jwt = require('jsonwebtoken'),
	app = require('./app.js');

// my custom middleware on apiRoutes
apiRoutes.use('/users',function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token){
		jwt.verify(token, app.get('superSecret'), function(err, decoded){
			if(err){
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if token is good, save the request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

apiRoutes.get('/', function(req, res){
	res.json({ message: 'Welcome to my api!' });
});

apiRoutes.get('/users', function(req, res){
	User.find({}, function(err, users){
		res.json(users);
	});
});

apiRoutes.post('/authenticate', function(req, res){

	User.findOne({
		name:req.body.name
	}, function(err, user){
		if(err){ throw err; }

		// check to make sure user exists
		if(!user){
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user){
			// check to make sure its the right password

			if(!bcrypt.compareSync(req.body.password, user.password)){
				res.json({ success: false, message: 'Authentication failed. Wrong password.'  });
			} else {
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinutes: 1440
				});

				res.send({
					success: true,
					message: 'Enjoy the token!',
					token: token
				});
			}
		} 
	});
});

module.exports = apiRoutes;