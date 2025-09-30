import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export type MediaType = "IMAGE" | "VIDEO";
export type MediaSize = "THUMBNAIL" | "MEDIUM" | "FULL";
export interface MediaURLResponse {
    DocumentURL?: string;
    DocumentKey?: string;
}

export interface OperationResponse {
    message: string;
    status: number;
    data?: MediaURLResponse;
}

interface AwsConfig {
    AWSAccessKeyID: string;
    AWSSecretAccessKey: string;
    AWSRegion: string;
    S3Bucket: string;
}

function getAwsConfig(): AwsConfig {
    // Replace with your config loader
    return {
        AWSAccessKeyID: process.env.AWS_ACCESS_KEY_ID!,
        AWSSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        AWSRegion: process.env.AWS_REGION!,
        S3Bucket: process.env.S3_BUCKET!,
    };
}

function setResponse( message: string, status: number, data?: MediaURLResponse): OperationResponse {
    return { message, status, data };
}

function getS3Client(config: AwsConfig) {
    return new S3Client({
        region: config.AWSRegion,
        credentials: {
            accessKeyId: config.AWSAccessKeyID,
            secretAccessKey: config.AWSSecretAccessKey,
        },
        endpoint: `https://${config.AWSRegion}.digitaloceanspaces.com`,
        forcePathStyle: false,
    });
}

export async function uploadMedia(userId: string, fileExtension: string, fileBuffer: Buffer): Promise<OperationResponse> {
    const awsConfig = getAwsConfig();
    const client = getS3Client(awsConfig);
    const currentTime = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14);

    const uploadedURLs: Record<string, string> = {};
    const uploadedKeys: Record<string, string> = {};

    const key = `${userId}/${currentTime}${fileExtension}`;
    try {
        await client.send(
            new PutObjectCommand({
                Bucket: awsConfig.S3Bucket,
                Key: key,
                Body: fileBuffer,
                ACL: "public-read",
            })
        );
    } catch (err) {
        return setResponse(
            `Failed to upload document: ${err}`,
            1
        );
    }

    const s3URL = `https://${awsConfig.S3Bucket}.digitaloceanspaces.com/${key}`;
    
    const urlRes: MediaURLResponse = {
        DocumentURL: s3URL,
        DocumentKey: `${currentTime}${fileExtension}`,
    };

    return setResponse("File uploaded successfully.", 0, urlRes);
}