import express from "express";
import {expappwdb} from "./types/types";
import {mdwBodyisPresent, mdwGetUserUID} from "./middleware";
export function setupPostsRoute(appwdb: expappwdb) {
    console.log("Setting-up Posts Route")
    appwdb.expressapp.post('/api/postarticle', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        const query = 'INSERT INTO posts (post_uid, user_uid, content, category) VALUES (0,?,?,?)';
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        if (!req.body.content) res.status(400).json({data: "Unauthorized"});
        else appwdb.mysqldb.query(query, [req.user_uid, req.body.content, req.body.category], (err, result: any) => {
            if (err) res.json({msg: err.message}).status(500)
            else res.json({
                post_uid: result.insertId
            })
        })
    })

    appwdb.expressapp.post('/api/posts', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        if (!req.user_uid)
            res.status(401).json({data: "Unauthorized"});
        else {
            appwdb.mysqldb.query(
                'SELECT posts.created_at, posts.content, users.username\n' +
                'FROM posts\n' +
                'JOIN users\n' +
                'ON posts.user_uid = users.user_uid\n' +
                'WHERE posts.category = ?\n' +
                'ORDER BY posts.created_at DESC;',
                [req.body.category], (err, result) => {
                    res.json(result)
                })
        }
    })
}