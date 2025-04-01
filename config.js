import dotenv from 'dotenv'
import path from 'path';


// console.log(process.cwd());

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const [e1, e2, e3,] = process.env.R2.split(',')


export const accountId = e1;
export const accessKeyId = e2;
export const secretAccessKey = e3;

console.log({ accountId, accessKeyId, secretAccessKey });