// @ts-ignore
import mysql from "mysql2";
import express from "express";

export type tokendata_clear = { user_uid: string; expiration: number}
export type expappwdb = { expressapp: express.Application, mysqldb: mysql.Connection }