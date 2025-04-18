const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function togetmail(username) {
    const sql = `SELECT user_email FROM authentication WHERE user_name = $1;`;
    
    return new Promise((resolve, reject) => {
        pool.query(sql, [username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.rows[0].user_email);
            }
        });
    });
}


async function hashPassword(password) {
	const hashedPassword = await bcrypt.hash(password, 10);
	return hashedPassword;
}

async function checkHashPassword(password, hash) {
	const isValid = await bcrypt.compare(password, hash);
	return isValid;
}

async function create_table() {
    pool.query(`
    CREATE TABLE IF NOT EXISTS authentication (
        user_name VARCHAR(50) PRIMARY KEY,
        user_email VARCHAR(50),
        user_password VARCHAR(200)
    );
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    }
});

}

async function tocheckusername(username) {
    try {
        const sql = `SELECT user_name FROM authentication WHERE user_name = $1;`;
        const result = await pool.query(sql, [username]);

        if (result.rows.length > 0) {
            return true; 
        } else {
            return false; 
        }
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}

async function tocheckpassword(username, password) {
    try {
        const sql = `SELECT user_password FROM authentication WHERE user_name = $1;`;
        const result = await pool.query(sql, [username]);

        if (result.rows.length > 0) {
            const check = checkHashPassword(password, result.rows[0].user_password);
            return check;
        } else {
            return false;
        }
    } catch (err) {
        console.error('Error checking password:', err);
        throw err; 
    }
}

async function datatosql(signup_Data, callback) {
    try {
        let hashedPassword = await hashPassword(signup_Data.password_signup);

        let check = await tocheckusername(signup_Data.username_signup);
        if (check === false) {
            if (signup_Data.password_signup === signup_Data.confirm_password) {
                const sql = `INSERT INTO authentication(user_name, user_email, user_password) 
                             VALUES($1, $2, $3);`;

                const result = await pool.query(sql, [
                    signup_Data.username_signup, 
                    signup_Data.email, 
                    hashedPassword
                ]);

                console.log('Data inserted successfully');
                callback(null, result); 
            } else {
                callback('Password does not match!', null); 
            }
        } else {
            callback('Username already exists!', null); 
        }
    } catch (err) {
        console.log(err);
        callback(err, null); 
    }
}

async function checkDataForLogin(login_Data, callback) {
	let checkUsername = await tocheckusername(login_Data.username_login);
	let checkPassword = await tocheckpassword(
		login_Data.username_login,
		login_Data.password_login
	);
	if (checkUsername === true) {
		if (checkPassword === true) {
			callback(null, 'Login successful');
		} else {
			callback('Password is incorrect!', null);
		}
	} else {
		callback('Username does not exist!', null);
	}
}

function add_data_for_signup(signup_Data) {
	return new Promise((resolve, reject) => {
		datatosql(signup_Data, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

function add_data_for_login(login_Data) {
	return new Promise((resolve, reject) => {
		checkDataForLogin(login_Data, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

module.exports = {
	create_table,
	add_data_for_signup,
	add_data_for_login,
	tocheckusername,
	datatosql,
	togetmail,
};
