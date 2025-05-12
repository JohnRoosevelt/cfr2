import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

async function deleteFolderContents(bucketName, folderPath) {
  try {
      const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: folderPath,
      });

      const listResponse = await client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
          console.log(`No files found in ${folderPath}`);
          return;
      }

      for (const obj of listResponse.Contents) {
          const deleteCommand = new DeleteObjectCommand({
              Bucket: bucketName,
              Key: obj.Key,
          });

          await client.send(deleteCommand);
          console.log(`Deleted ${obj.Key}`);
      }

      console.log(`All files in ${folderPath} have been deleted.`);
  } catch (error) {
      console.error('Error deleting folder contents:', error);
  }
}


// const bucketName = 'holy'; 
// const folderPath = 'sda/'; 

// deleteFolderContents(bucketName, folderPath);




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