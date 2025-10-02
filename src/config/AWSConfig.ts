import dotenv from 'dotenv';

dotenv.config();

export interface AWSConfig {
    awsRegion: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    s3Bucket: string;
}

export function loadConfig(): AWSConfig {
    const config: AWSConfig = {
        awsAccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        awsSecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        awsRegion: process.env.S3_REGION || '',
        s3Bucket: process.env.S3_BUCKET_NAME || '',
    };

    if (
        !config.awsAccessKeyId ||
        !config.awsSecretAccessKey ||
        !config.awsRegion ||
        !config.s3Bucket
    ) {
        throw new Error('Missing AWS configuration values in the .env file');
    }

    return config;
}