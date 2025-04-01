import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import { accountId, accessKeyId, secretAccessKey } from "./config.js";

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFile(filePath, Bucket, Key) {
  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body: fs.createReadStream(filePath),
    // ContentType: 'application/json', // json  application/json   mp4  application/octet-stream
  });

  try {
    const response = await client.send(command);
    console.log('File uploaded successfully:', filePath, Bucket, Key, response);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

async function demo(data) {
  // import data from './sda/index.json' assert { type: 'json' };

  const executing = new Set()

  for (let book of data) {
    const { id } = book
    console.log({ id })
    const key = `sda/${id}.json`

    const promise = uploadFile(`./${key}`, 'holy', key).then(async result => {
      console.log(key, 'upload successfully')
      executing.delete(promise);
    });

    executing.add(promise);

    if (executing.size >= 6) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}




// async function listFiles() {
//   const command = new ListObjectsCommand({
//       Bucket: 'holy',
//       Prefix: 'bible',
//       key: 'index.json'
//   });

//   try {
//       const response = await client.send(command);
//       console.log('Files in bucket:', response.Contents);
//   } catch (error) {
//       console.error('Error listing files:', error);
//   }
// }

// async function getFiles() {
//   // const command = new GetObjectCommand({
//   const command = new ListObjectsCommand({
//       Bucket: 'holy',
//       Prefix: 'media',
//       Key: 'index.json'
//   });

//   try {
//       const response = await client.send(command);
//       console.log('Files in bucket:', response.Contents);
//   } catch (error) {
//       console.error('Error listing files:', error);
//   }
// }

// getFiles()