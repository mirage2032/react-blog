import {tokendata_clear} from "./types/types";
import * as crypto from "crypto";
import {tokendata_encrypted} from "./types/common";
import * as dotenv from 'dotenv'

dotenv.config({path: '/.env'});

function makeToken(time_hr: number, user_uid: string) {
    const user_clrtoken: tokendata_clear = {
        user_uid,
        expiration: Date.now() + (time_hr * 60 * 60 * 1000),
    }
    const iv = Buffer.from(crypto.randomBytes(12).toString(), 'utf8');
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.USERTOK_ENC_KEY, 'utf8'), iv);
    let encryptedObject = cipher.update(JSON.stringify(user_clrtoken), 'utf8', 'base64');
    encryptedObject += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return {iv: iv.toString('base64'), encryptedObject, authTag: authTag.toString('base64')} as tokendata_encrypted;
}

function parseToken(user_enctoken: tokendata_encrypted) {
    try {
        if (!user_enctoken) return null;
        if (!user_enctoken.iv || !user_enctoken.encryptedObject || !user_enctoken.authTag) return null;
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(process.env.USERTOK_ENC_KEY, 'utf8'), Buffer.from(user_enctoken.iv, "base64"));
        decipher.setAuthTag(Buffer.from(user_enctoken.authTag, 'base64'));
        let user_clrtoken_raw = decipher.update(user_enctoken.encryptedObject, 'base64', 'utf8');
        user_clrtoken_raw += decipher.final('utf8');
        const user_clrtoken: tokendata_clear = JSON.parse(user_clrtoken_raw);
        if (Date.now() > user_clrtoken.expiration) return null;
        return user_clrtoken.user_uid;
    } catch (err) {
        console.log(err)
        return null
    }
}

export default {makeToken, parseToken};