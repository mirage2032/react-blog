import express from "express";
import {expappwdb} from "./types/types";
import {mdwBodyisPresent, mdwGetUserUID} from "./middleware";

export function setupPostsRoute(appwdb: expappwdb) {
    console.log("Setting-up Posts Route")

    // add new post
    appwdb.expressapp.post('/api/post', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        const query = 'INSERT INTO posts (post_uid, user_uid, content, category) VALUES (0,?,?,?)';
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        if (!req.body.content) res.status(400).json({data: "Unauthorized"});
        else appwdb.mysqldb.query(query, [req.user_uid, req.body.content, req.body.category], (err, result: any) => {
            if (err) res.status(500).json({msg: err.message})
            else res.json({
                post_uid: result.insertId
            })
        })
    })

    // delete existing post
    appwdb.expressapp.post('/api/deletepost', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        const query = 'DELETE FROM posts WHERE post_uid = ? AND user_uid = ?';
        if (!req.user_uid) res.status(401).json({data: "Unauthorized"});
        if (!req.body.post_uid) res.status(400).json({data: "Unauthorized"});
        else appwdb.mysqldb.query(query, [req.body.post_uid, req.user_uid], (err, result: any) => {
            if (err) res.status(500).json({msg: err.message})
            else if (result.affectedRows === 0) res.status(404).json({msg: "Post not found or user unauthorized"})
            else res.json({msg: "Post deleted"})
        })
    })

    appwdb.expressapp.post('/api/posts', mdwBodyisPresent, mdwGetUserUID, (req: express.Request, res: express.Response) => {
        if (!req.user_uid)
            res.status(401).json({data: "Unauthorized"});
        else {
            appwdb.mysqldb.query(
                'SELECT posts.created_at, posts.content, posts.post_uid, users.username\n' +
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