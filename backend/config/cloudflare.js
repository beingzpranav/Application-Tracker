const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

/**
 * Upload a file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @returns {Object} { key, url }
 */
const uploadToR2 = async (fileBuffer, originalName, mimeType) => {
  const ext = path.extname(originalName);
  const key = `resumes/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Construct the public URL — strip trailing slash to avoid double-slash
  const baseUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');
  const publicUrl = baseUrl ? `${baseUrl}/${key}` : key;

  return { key, url: publicUrl };
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} key - The object key to delete
 */
const deleteFromR2 = async (key) => {
  if (!key) return;

  // Extract the key from full URL if needed
  const objectKey = key.includes('/resumes/')
    ? key.substring(key.indexOf('resumes/'))
    : key;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
  });

  await s3Client.send(command);
};

/**
 * Generate a presigned URL for downloading
 * @param {string} key - The object key
 * @returns {string} Presigned URL valid for 1 hour
 */
const getPresignedUrl = async (key) => {
  const objectKey = key.includes('/resumes/')
    ? key.substring(key.indexOf('resumes/'))
    : key;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

module.exports = { uploadToR2, deleteFromR2, getPresignedUrl };
