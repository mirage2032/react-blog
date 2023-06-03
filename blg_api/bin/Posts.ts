import express from "express";
import {expappwdb} from "./types/types";
import {mdwBodyisPresent, mdwRequestUserUID} from "./middleware";

export function setupPostsRoute(appwdb: expappwdb) {
    console.log("Setting-up Posts Route")

    // add new post
    appwdb.expressapp.post('/api/post', mdwBodyisPresent, mdwRequestUserUID, (req: express.Request, res: express.Response) => {
        const query = 'INSERT INTO posts (post_uid, user_uid, content, category) VALUES (0,?,?,?)';
        if (!req.body.content) res.status(400).json({msg: "Content can't be empty"});
        else appwdb.mysqldb.query(query, [req.user_uid, req.body.content, req.body.category], (err, result: any) => {
            if (err) res.status(500).json({msg: err.message})
            else res.json({
                post_uid: result.insertId
            })
        })
    })

    // edit existing post
    appwdb.expressapp.post('/api/editpost', mdwBodyisPresent, mdwRequestUserUID, (req: express.Request, res: express.Response) => {
        const query = 'UPDATE posts SET content = ? WHERE post_uid = ? AND user_uid = ?';
        if (!req.body.content) res.status(400).json({msg: "Content can't be empty"});
        if (!req.body.post_uid) res.status(400).json({msg: "Post uid can't be empty"});
        else appwdb.mysqldb.query(query, [req.body.content, req.body.post_uid, req.user_uid], (err) => {
            if (err) res.status(500).json({msg: err.message})
            else res.json({success: true})
        })
    })

    // delete existing post
    appwdb.expressapp.post('/api/deletepost', mdwBodyisPresent, mdwRequestUserUID, (req: express.Request, res: express.Response) => {
        const query = 'DELETE FROM posts WHERE post_uid = ? AND user_uid = ?';
        if (!req.body.post_uid) res.status(400).json({msg: "Post uid can't be empty"});
        else appwdb.mysqldb.query(query, [req.body.post_uid, req.user_uid], (err, result: any) => {
            if (err) res.status(500).json({msg: err.message})
            else if (result.affectedRows === 0) res.status(404).json({msg: "Post not found or user unauthorized"})
            else res.json({msg: "Post deleted"})
        })
    })

    // get posts
    appwdb.expressapp.post('/api/posts', mdwBodyisPresent, mdwRequestUserUID, (req: express.Request, res: express.Response) => {
        const query = 'SELECT posts.created_at, posts.content, posts.post_uid, users.username\n' +
            'FROM posts\n' +
            'JOIN users\n' +
            'ON posts.user_uid = users.user_uid\n' +
            'WHERE posts.category = ? AND posts.content LIKE ?\n' +
            'ORDER BY posts.created_at DESC;'
        appwdb.mysqldb.query(query, [req.body.category, `%${req.body.searchterm}%`],
            (err, result) => {
                res.json(result)
            })
    })
}