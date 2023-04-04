import {sha256} from "js-sha256";
import cookieParser from "cookie-parser";
import mysql, {ConnectionOptions} from "mysql2";
import express from "express";
import cryptolib from "crypto";
import {HfInference} from '@huggingface/inference';
import {tokendata_clear} from "./types/types";
import {tokendata_encrypted} from "./types/common";

const hf = new HfInference("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")
const TOKEN_PASSWORD = "AstaEParolaFoarteSecreta";

const databasecfg: ConnectionOptions = {
    host: "db-container",
    port: 3306,
    user: "user",
    password: "pass",
    database: "db",
}

const connection = mysql.createConnection(databasecfg)
connection.connect()

const app = express()
app.use(express.json());
app.use(cookieParser());

function encrypt(objectToEncrypt: tokendata_clear, password: string) {
    const iv = cryptolib.randomBytes(16);
    const cipher = cryptolib.createCipheriv('aes-192-cbc', Buffer.from(password, 'utf8'), iv);
    let encrypted = cipher.update(JSON.stringify(objectToEncrypt), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {iv: iv.toString('hex'), encryptedObject: encrypted};
}

function decrypt(encryptedObject: tokendata_encrypted, password: string) {
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const decipher = cryptolib.createDecipheriv('aes-192-cbc', Buffer.from(password, 'utf8'), iv);
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
    const query = 'INSERT INTO users (username,password,email,user_uid) VALUES (?,?,?,0)';
    const query_params = [user.username, user.password, user.email];
    connection.query(query, query_params, (err, result: any) => {
        if (err) res.json({msg: err.message}).status(409)
        else res.json({
            user_uid: result.insertId
        })
    })
})

function makeToken(time_hr: number, user_uid: string) {
    return encrypt({
        user_uid, expiration: Date.now() + (time_hr * 60 * 60 * 1000), integrity: "INTEGRITY_CHECK",
    }, TOKEN_PASSWORD)
}

function parseToken(cookie: tokendata_encrypted) {
    if (!cookie) return null;
    const parsed_cookie = decrypt(cookie, TOKEN_PASSWORD);
    if (parsed_cookie.integrity !== "INTEGRITY_CHECK") return null;
    if (Date.now() > parsed_cookie.expiration) return null;
    return parsed_cookie.user_uid;
}

app.post('/api/login', (req: any, res: any) => {
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [req.body.email, sha256(req.body.password)], (err, result: any) => {
        if (err || result.length === 0) res.code(400).json()
        else res.json({
            user_token: makeToken(3 * 24, result[0].user_uid)
        })
    })
})

app.post('/api/user/data', (req: any, res: any) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    if (!user_uid) res.status(401).json({data: "Unauthorized"});
    else connection.query('SELECT * FROM users WHERE user_uid = ?', [user_uid], (err, result: any) => {
        if (err || result.length === 0) res.status(401).json({data: "Unauthorized"}); else res.json({
            username: result[0].username, email: result[0].email, created_at: result[0].created_at
        })
    })
})

app.post('/api/postarticle', (req: any, res: any) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    const query = 'INSERT INTO posts (post_uid, user_uid, content, category) VALUES (0,?,?,?)';
    if (!user_uid) res.status(401).json({data: "Unauthorized"});
    else connection.query(query, [user_uid, req.body.content, req.body.category], (err, result: any) => {
        if (err) res.json({msg: err.message}).status(500)
        else res.json({
            post_uid: result.insertId
        })
    })
})

app.post('/api/posts', (req: any, res: any) => {
    const user_token = req.cookies.user_token ? JSON.parse(req.cookies.user_token) : null;
    const user_uid = parseToken(user_token);
    const category = req.body.category
    if (!user_uid) res.status(401).json({data: "Unauthorized"}); else connection.query('SELECT posts.created_at, posts.content, users.username\n' + 'FROM posts\n' + 'JOIN users\n' + 'ON posts.user_uid = users.user_uid\n' + 'WHERE posts.category = ?\n' + 'ORDER BY posts.created_at DESC;', [category], (err, result) => {
        res.json(result)
    })
})

app.post('/api/chat/conversation', async (req: any, res: any) => {
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