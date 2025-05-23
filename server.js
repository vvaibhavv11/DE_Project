// APP
const express = require('express');
const path = require("path");
const session = require('express-session');
const { Pool } = require('pg');
const connectPgSimple = require('connect-pg-simple')(session);
const app = express();
const routers = require(path.join(__dirname, ".", "routers", "router.js"));
const dbconnect = require(path.join(__dirname, ".", "database", "db.js"));
const sendEmail = require(path.join(__dirname, ".", "email", "send_email.js"));

app.use("/public", express.static(path.join(__dirname, ".", "public")));

(async () => {
	await dbconnect.create_table();
})();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    },
});

const sessionStore = new connectPgSimple({
    pool: pool, 
    tableName: 'session',
    createTableIfMissing: true
});

app.set('view engine', 'ejs');

app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
	})
);

app.use(express.urlencoded({ extended: true }));
app.use('/', routers);

app.post('/sendForSignup', async (req, res) => {
	let signup_Data = req.body;
	try {
		let result = await dbconnect.add_data_for_signup(signup_Data);
		let email = await dbconnect.togetmail(signup_Data.username_signup);
		console.log(result);
		req.session.email = email;
		req.session.UserName = signup_Data.username_signup;
		req.session.is_auth = true;
		res.json({ success: true });
	} catch (error) {
		console.error(error);
		res.json({ success: false, error: error });
	}
});

app.post('/sendForLogin', async (req, res) => {
	let login_Data = req.body;
	try {
		let result = await dbconnect.add_data_for_login(login_Data);
		let email = await dbconnect.togetmail(login_Data.username_login);
		console.log(result);
		req.session.email = email;
		req.session.UserName = login_Data.username_login;
		req.session.is_auth = true;
		res.json({ success: true });
	} catch (error) {
		console.error(error);
		res.json({ success: false, error: error });
	}
});

app.post('/logout', (req, res) => {
	if (req.session.is_auth) {
		req.session.is_auth = false;
		res.json({ success: true });
		console.log('Logged out Successfully!!!');
	} else {
		res.json({ success: false });
	}
});

app.post('/send-email', async (req, res) => {
	const message = req.body;
	try {
		await sendEmail(message.email, message.message);
		res.json({ success: true });
	} catch (err) {
		console.log(err);
		res.json({ success: false });
	}
});

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;
