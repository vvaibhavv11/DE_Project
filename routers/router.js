const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require("path");

router.get('/', (req, res) => {
	const is_auth = req.session.is_auth;
	if (req.session.is_auth) {
		const UserName = req.session.UserName;
		const email = req.session.email;
		res.render(path.join(__dirname, "..", "views", "index.ejs"), { userName: UserName, email: email, isAuth: is_auth });
	} else {
		res.render(path.join(__dirname, "..", "views", "index.ejs"), { isAuth: is_auth });
	}
});

function verify(req, res, next) {
	if (req.session.is_auth) {
		res.redirect('/');
	} else {
		next();
	}
}
router.get('/login', verify, (req, res) => {
	console.log('Request for login page recieved');
	res.render(path.join(__dirname, "..", "views", "login.ejs"));
});

module.exports = router;
