import {expappwdb} from "./types/types";
import express from "express";
import {sha256} from "js-sha256";
import {mdwBodyisPresent, mdwGetUserUID} from "./middleware";
import usertoken from "./usertoken"

export function setupAccountRoutes(appwdb: expappwdb) {
    console.log("Setting-up Account Routes")

    appwdb.app.post('/api/register', mdwBodyisPresent, async (req: express.Request, res: express.Response) => {
        const user = {
            username: req.body.name, password: sha256(req.body.password), email: req.body.email
        };
        const query = 'INSERT INTO users (username,password,email,user_uid) VALUES (?,?,?,0)';
        const query_params = [user.username, user.password, user.email];
        try {
            const result = await appwdb.dbpool.query(query, query_params) as any;
            res.json({user_uid: result[0].insertId})
        } catch (err) {
            res.status(409).json()
        }
    })


    appwdb.app.post('/api/login', mdwBodyisPresent, async (req: express.Request, res: express.Response) => {
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const query_params = [req.body.email, sha256(req.body.password)]
        try {
            const result = await appwdb.dbpool.query(query, query_params) as any
            if (result[0].length === 0)
                res.status(400).json()
            else res.json({
                user_token: usertoken.makeToken(3 * 24, result[0][0].user_uid)
            })
        } catch (err) {
            res.status(500).json()
        }
    })

    appwdb.app.post('/api/user/data', mdwBodyisPresent, mdwGetUserUID, async (req: express.Request, res: express.Response) => {
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        else {
            const query = 'SELECT * FROM users WHERE user_uid = ?';
            const query_params = [req.user_uid];
            try {
                const result = await appwdb.dbpool.query(query, query_params) as any;
                if (result[0].length === 0)
                    res.status(401).json({data: "Unauthorized"});
                else
                    res.json({username: result[0][0].username, email: result[0][0].email, created_at: result[0][0].created_at})
                return
            } finally {
                res.status(500).json()
            }
        }
    })
}