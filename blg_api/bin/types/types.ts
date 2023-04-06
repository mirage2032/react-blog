// @ts-ignore
import mysql from "mysql2";
import express from "express";
import {PromisePoolConnection} from "mysql2/promise";

export type tokendata_clear = { user_uid: string; expiration: number}
export type expappwdb = { app: express.Application, dbpool: PromisePoolConnection }