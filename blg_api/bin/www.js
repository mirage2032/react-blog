const {sha256} = require("js-sha256");
const cookieParser = require("cookie-parser");
const mysql = require('mysql2')
const express = require('express')
const crypto = require("crypto");

const TOKEN_PASSWORD = "AstaEParolaFoarteSecreta";

function encrypt(objectToEncrypt, password) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-192-cbc', Buffer.from(password, 'utf8'), iv);
    let encrypted = cipher.update(JSON.stringify(objectToEncrypt), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {iv: iv.toString('hex'), encryptedObject: encrypted};
}

function decrypt(encryptedObject, password) {
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-192-cbc', Buffer.from(password, 'utf8'), iv);
    let decrypted = decipher.update(encryptedObject.encryptedObject, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

const databasecfg = {
    host: "db-container",
    port: "3306",
    user: "user",
    password: "pass",
    database: "db",
    connectTimeout: 60000,
}

const connection = mysql.createConnection(databasecfg)
connection.connect()

const app = express()
app.use(express.json());
app.use(cookieParser());
app.listen(3010, () => {
    console.log(`API STARTED ON PORT 3010`)
})
app.post('/api/register', (req, res) => {
    const user = {
        username: req.body.name,
        password: sha256(req.body.password),
        email: req.body.email
    };
    const query = 'INSERT INTO users (username,password,email,user_uid) VALUES (?,?,?,UUID())';
    const query_params = [user.username, user.password, user.email, user.user_uid];
    connection.query(query, query_params, (err, result) => {
        if (err) res.json({error: true, msg: err.message}).status(409)
        else res.json({error: false, user_uid: result.insertId})
    })
})

function makeToken(time_hr, user_uid) {
    return encrypt(
        {
            user_uid,
            expiration: Date.now() + (time_hr * 60 * 60 * 1000),
            integrity: "INTEGRITY_CHECK",
        },
        TOKEN_PASSWORD
    )
}

function parseToken(cookie) {
    if (!cookie)
        return null;
    const parsed_cookie = decrypt(cookie, TOKEN_PASSWORD);
    if (parsed_cookie.integrity !== "INTEGRITY_CHECK")
        return null;
    if (Date.now() > parsed_cookie.expiration)
        return null;
    return parsed_cookie.user_uid;
}

app.post('/api/login', (req, res) => {
    const sha256 = require('js-sha256');
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [req.body.email, sha256(req.body.password)], (err, result) => {
        if (err || result.length === 0) res.json({error: true})
        else res.json({error: false, user_token: makeToken(3 * 24, result[0].user_uid)})
    })
})

app.post('/api/user/data', (req, res) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    if (!user_uid)
        res.status(401).json({data: "Unauthorized"});
    else
        connection.query('SELECT * FROM users WHERE user_uid = ?', [user_uid], (err, result) => {
            if (err || result.length === 0) res.status(401).json({data: "Unauthorized"});
            else res.json({
                username: result[0].username,
                email: result[0].email,
                created_at: result[0].created_at
            })
        })
})

app.post('/api/posts', (req, res) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    const category = req.body.category
    if (!user_uid)
        res.status(401).json({data: "Unauthorized"});
    else
        connection.query('SELECT posts.created_at, posts.content, users.username\n' +
            'FROM posts\n' +
            'JOIN users\n' +
            'ON posts.user_uid = users.user_uid\n' +
            'WHERE posts.category = ?\n' +
            'ORDER BY posts.created_at DESC;',[category],(err,result) =>{
            res.json(result)
        })
})