import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

let s3Client = null;

const getS3Client = () => {
    if (s3Client) return s3Client;

    const {
        R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME,
        R2_ENDPOINT,
        R2_PUBLIC_URL
    } = process.env;

    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT || !R2_PUBLIC_URL) {
        throw new Error('Cloudflare R2 environment variables are missing. Required: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL');
    }

    s3Client = new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });

    return s3Client;
};

export const generatePresignedUrl = async (prefix) => {
    const client = getS3Client();
    
    // Ensure prefix doesn't end with slash and exists
    const safePrefix = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
    const key = `${safePrefix}${uuidv4()}.webp`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: 'image/webp'
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    
    // Construct public URL
    const publicUrlBase = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    const publicUrl = `${publicUrlBase}/${key}`;

    return {
        uploadUrl,
        objectKey: key,
        publicUrl
    };
};

export const deleteObject = async (key) => {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    await client.send(command);
    return true;
};
