import express from "express";
import usertoken from "./usertoken"

export function mdwBodyisPresent(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body)
        return res.status(400).json({error: 'Missing request body'});
    next();
}

export function mdwGetUserUID(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const user_enctoken = JSON.parse(req.cookies.user_token)
        req.user_uid = usertoken.parseToken(user_enctoken);
    } catch (err) {
        req.user_uid = null;
    }
    next()
}

export function mdwRequestUserUID(req: express.Request, res: express.Response, next: express.NextFunction) {
    mdwGetUserUID(req, res, () => null);
    if (!req.user_uid)
        return res.status(401).json({error: 'Unauthorized'})
    next();
}