import express from "express";
import {expappwdb} from "./types/types";
import {mdwBodyisPresent, mdwGetUserUID} from "./middleware";

export function setupPostsRoute(appwdb: expappwdb) {
    console.log("Setting-up Posts Route")

    appwdb.app.post('/api/postarticle', mdwBodyisPresent, mdwGetUserUID, async (req: express.Request, res: express.Response) => {
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        else if (!req.body.content) res.status(400).json({data: "Request body can't be empty"});
        else {
            const query = 'INSERT INTO posts (post_uid, user_uid, content, category) VALUES (0,?,?,?)';
            const query_params = [req.user_uid, req.body.content, req.body.category];
            try {
                const result = await appwdb.dbpool.execute(query, query_params) as any;
                res.json({post_uid: result[0].insertId})
            } catch (err) {
                res.status(500).json()
            }
        }
    })

    appwdb.app.post('/api/posts', mdwBodyisPresent, mdwGetUserUID, async (req: express.Request, res: express.Response) => {
        if (!req.user_uid)
            res.status(401).json({data: "Unauthorized"});
        else {
            const query =
                'SELECT posts.created_at, posts.content, users.username\n' +
                'FROM posts\n' +
                'JOIN users\n' +
                'ON posts.user_uid = users.user_uid\n' +
                'WHERE posts.category = ?\n' +
                'ORDER BY posts.created_at DESC;'
            const query_params = [req.body.category]
            try {
                const result = await appwdb.dbpool.query(query, query_params) as any;
                res.json(result[0])
            }
            catch (err){
                res.status(500).json()
            }
        }
    })
}