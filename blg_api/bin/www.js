const {sha256} = require("js-sha256");
const cookieParser = require("cookie-parser");
const mysql = require('mysql2')
const express = require('express')
const crypto = require("crypto");
const {HfInference} = require('@huggingface/inference')
const hf = new HfInference("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")

const TOKEN_PASSWORD = "AstaEParolaFoarteSecreta";

const databasecfg = {
    host: "db-container", port: "3306", user: "user", password: "pass", database: "db",
}

const connection = mysql.createConnection(databasecfg)
connection.connect()

const app = express()
app.use(express.json());
app.use(cookieParser());

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

app.listen(3010, () => {
    console.log(`API STARTED ON PORT 3010`)
})
app.post('/api/register', (req, res) => {
    const user = {
        username: req.body.name, password: sha256(req.body.password), email: req.body.email
    };
    const query = 'INSERT INTO users (username,password,email,user_uid) VALUES (?,?,?,UUID())';
    const query_params = [user.username, user.password, user.email, user.user_uid];
    connection.query(query, query_params, (err, result) => {
        if (err) res.json({msg: err.message}).status(409)
        else res.json({
            user_uid: result.insertId
        })
    })
})

function makeToken(time_hr, user_uid) {
    return encrypt({
        user_uid, expiration: Date.now() + (time_hr * 60 * 60 * 1000), integrity: "INTEGRITY_CHECK",
    }, TOKEN_PASSWORD)
}

function parseToken(cookie) {
    if (!cookie) return null;
    const parsed_cookie = decrypt(cookie, TOKEN_PASSWORD);
    if (parsed_cookie.integrity !== "INTEGRITY_CHECK") return null;
    if (Date.now() > parsed_cookie.expiration) return null;
    return parsed_cookie.user_uid;
}

app.post('/api/login', (req, res) => {
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [req.body.email, sha256(req.body.password)], (err, result) => {
        if (err || result.length === 0) res.code(400).json()
        else res.json({
            user_token: makeToken(3 * 24, result[0].user_uid)
        })
    })
})

app.post('/api/user/data', (req, res) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    if (!user_uid) res.status(401).json({data: "Unauthorized"});
    else connection.query('SELECT * FROM users WHERE user_uid = ?', [user_uid], (err, result) => {
        if (err || result.length === 0) res.status(401).json({data: "Unauthorized"}); else res.json({
            username: result[0].username, email: result[0].email, created_at: result[0].created_at
        })
    })
})

app.post('/api/postarticle', (req, res) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    const query = 'INSERT INTO posts(user_uid,content,category) VALUES (*,*,*)';
    if (!user_uid) res.status(401).json({data: "Unauthorized"});
    else connection.query(query, [user_uid,req.body.content,req.body.category], (err, result) => {
        if (err) res.json({msg: err.message}).status(500)
        else res.json({
            user_uid: result.insertId
        })
    })


})

app.post('/api/chat/conversation', async (req, res) => {
    try {
        const response = await hf.conversational({
            model: 'microsoft/DialoGPT-large', inputs: {
                past_user_inputs: req.body.past_user_inputs,
                generated_responses: req.body.generated_responses,
                text: req.body.text
            }
        })
        res.json({"data": response.generated_text})
    } catch (err) {
        res.json({"data": "Error getting response from API"})
    }
})