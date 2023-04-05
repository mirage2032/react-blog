import cookieParser from "cookie-parser";
import mysql, {ConnectionOptions} from "mysql2";
import express from "express";
import {expappwdb} from "./types/types";
import {setupAccountRoutes} from "./Account";
import {setupPostsRoute} from "./Posts";

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