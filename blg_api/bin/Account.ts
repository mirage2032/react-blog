import {expappwdb} from "./types/types";
import express from "express";
import {sha256} from "js-sha256";
import {mdwBodyisPresent, mdwGetUserUID} from "./middleware";
import usertoken from "./usertoken"

export function setupAccountRoutes(appwdb: expappwdb) {
    console.log("Setting-up Account Routes")
    appwdb.expressapp.post('/api/register', mdwBodyisPresent, (req: express.Request, res: express.Response) => {
        const user = {
            username: req.body.name, password: sha256(req.body.password), email: req.body.email
        };
        const query = 'INSERT INTO users (username,password,email,user_uid) VALUES (?,?,?,0)';
        const query_params = [user.username, user.password, user.email];
        appwdb.mysqldb.query(query, query_params, (err, result: any) => {
            if (err) res.status(409).json({msg: err.message})
            else res.json({
                user_uid: result.insertId
            })
        })
    })
    appwdb.expressapp.post('/api/login', mdwBodyisPresent, (req: express.Request, res: express.Response) => {
        appwdb.mysqldb.query('SELECT * FROM users WHERE email = ? AND password = ?', [req.body.email, sha256(req.body.password)], (err, result: any) => {
            if (err || result.length === 0) {
                res.status(400).json()
            } else res.json({
                user_token: usertoken.makeToken(3 * 24, result[0].user_uid)
            })
        })
    })

    appwdb.expressapp.post('/api/user/data', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        else appwdb.mysqldb.query('SELECT * FROM users WHERE user_uid = ?', [req.user_uid], (err, result: any) => {
            if (err || result.length === 0) res.status(401).json({data: "Unauthorized"});
            else res.json({
                username: result[0].username, email: result[0].email, created_at: result[0].created_at
            })
        })
    })


}