const express = require('express');
const router=express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//route for signup functionality
router.post('/signup', (req, res, next) => {
	bcrypt.hash(req.body.password, 10, (err, hash) => {
		if (err) {
			res.json({
				message: 'Unable to hash password'
			});
		} else {
			User.findOne({fullName: req.body.fullName}, (err, result) => {
				if (result === null) {
					var user = User({
						fullName: req.body.fullName,
						companyName: req.body.companyName,
						phoneNumber: req.body.phoneNumber,
						email: req.body.email,
						password: hash,
						created_dt: Date.now()
					});
					user.save((err, result) => {
						if (err) {
							console.log(err)
							return res.status(501).json({
								message: 'not implemented'
							});
						} else {
							console.log(result)
							return res.status(200).json({
								message: 'Successful registration'
							});
						}
					});
				} else {
					res.status(501).json({
						message: 'Username or email already exist'
					});
				}
			});
		}
	});
});


//router for login functionality
router.post('/login', (req, res, next) => {
	User.findOne({email: req.body.email}, (err, result) => {
		if (result) {
			const user = {
				id: result._id,
				fullName: result.fullName,
				email: result.email,
				password: result.password
			}
			bcrypt.compare(req.body.password, result.password, (err, result) => {
				if (result === false) {
					res.status(403).json({message: 'Incorrect Password'})
				} else {
					jwt.sign({user}, 'secretKey', (err, token) => {
						res.status(200).json(token)
					})
				}
			});
		} else {
			res.status(501).json({message: 'Not implemented'})
		}
	});
});

router.get('/dashboard', isValidUser, (req, res) => {
	console.log(req.params)
})

//function for checking valid user for authenticated route
function isValidUser(req, res, next) {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		req.token = bearerHeader;
		jwt.verify(req.token, 'secretKey', (err, authData) => {
			if (err) {
				res.status(403).json({message: 'Unauthorized'})
			} else {
				res.status(200).json({
					message: 'Authorized request',
					authData
				})
				req.params = authData
				next();
			}
		})
		next();
	} else {
		res.status(403).json({
			message: 'Unauthorized request'
		})
	}
}

module.exports=router;