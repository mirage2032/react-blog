import cookieParser from "cookie-parser";
import mysql, {ConnectionOptions} from "mysql2";
import express from "express";
import {HfInference} from '@huggingface/inference';
import {expappwdb} from "./types/types";
import {setupAccountRoutes} from "./Account";
import {setupPostsRoute} from "./Posts";

const hf = new HfInference("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")

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
app.listen(3010, () => {
    console.log(`API STARTED ON PORT 3010`)
})
const appwdb: expappwdb = {expressapp: app, mysqldb: connection}

setupAccountRoutes(appwdb)
setupPostsRoute(appwdb)
app.post('/api/chat/conversation', async (req: express.Request, res: express.Response) => {
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