const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require("path");

router.get('/', (req, res) => {
	const is_auth = req.session.is_auth;
	if (req.session.is_auth) {
		const UserName = req.session.UserName;
		const email = req.session.email;
		res.render(path.join(__dirname, "..", "views", "index.ejs"), {
            userName: UserName,
            email: email,
            isAuth: is_auth,
            style1: path.join("public", "assets", "index", "css", "style.css"),
            style2: path.join("public", "assets", "index", "css", "mediaqueries.css"),
            font1: path.join("public", "assets", "fontawesome", "css", "fontawesome.css"),
            font2: path.join("public", "assets", "fontawesome", "css", "solid.css"),
            image: path.join("public", "assets", "images", "noobs.jpeg"),
            js: path.join("public", "assets", "index", "js", "script.js")
        });
	} else {
		res.render(path.join(__dirname, "..", "views", "index.ejs"), {
            isAuth: is_auth,
            style1: path.join("public", "assets", "index", "css", "style.css"),
            style2: path.join("public", "assets", "index", "css", "mediaqueries.css"),
            font1: path.join("public", "assets", "fontawesome", "css", "fontawesome.css"),
            font2: path.join("public", "assets", "fontawesome", "css", "solid.css"),
            image: path.join("public", "assets", "images", "noobs.jpeg"),
            js: path.join("public", "assets", "index", "js", "script.js")
        });
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
