import {tokendata_clear} from "./types/types";
import * as crypto from "crypto";
import {tokendata_encrypted} from "./types/common";

const TOKEN_PASSWORD = "AstaEParolaFoarteSecreta"; //TODO: Use .env
function makeToken(time_hr: number, user_uid: string) {
    const user_clrtoken: tokendata_clear = {
        user_uid,
        expiration: Date.now() + (time_hr * 60 * 60 * 1000),
        integrity: "INTEGRITY_CHECK",
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-192-cbc', Buffer.from(TOKEN_PASSWORD, 'utf8'), iv);
    let encrypted = cipher.update(JSON.stringify(user_clrtoken), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {iv: iv.toString('hex'), encryptedObject: encrypted} as tokendata_encrypted;
}

function parseToken(user_enctoken: tokendata_encrypted) {
    try {
        if (!user_enctoken) return null;
        const iv = Buffer.from(user_enctoken.iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-192-cbc', Buffer.from(TOKEN_PASSWORD, 'utf8'), iv);
        let decrypted = decipher.update(user_enctoken.encryptedObject, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const user_clrtoken: tokendata_clear = JSON.parse(decrypted);
        if (user_clrtoken.integrity !== "INTEGRITY_CHECK") return null;
        if (Date.now() > user_clrtoken.expiration) return null;
        return user_clrtoken.user_uid;
    }
    catch (err)
    {
        console.log(err)
        return null
    }
}

export default {makeToken, parseToken};