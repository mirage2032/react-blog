export {}
declare global {
    namespace Express {
        export interface Request {
            user_uid?: string | null
        }
    }
    namespace NodeJS {
        export interface ProcessEnv {
            USERTOK_ENC_KEY: string;
        }
    }
}