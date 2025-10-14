import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { AWSConfig } from "../config/AWSConfig";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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

function getAwsConfig(): AwsConfig {
    const awsAccessKeyId = process.env.S3_ACCESS_KEY_ID || "";
    const awsSecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
    const awsRegion = process.env.S3_REGION || "";
    const s3Bucket = process.env.S3_BUCKET_NAME || "";

    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !s3Bucket) {
        throw new Error("Missing AWS configuration values in environment variables");
    }

    return {
        AWSAccessKeyID: awsAccessKeyId,
        AWSSecretAccessKey: awsSecretAccessKey,
        AWSRegion: awsRegion,
        S3Bucket: s3Bucket,
    };
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

    const key = `${userId}/${currentTime}.${fileExtension}`;
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
        DocumentKey: `${currentTime}.${fileExtension}`,
    };

    return setResponse("File uploaded successfully.", 0, urlRes);
}

export async function deleteMedia(userId: string, type: string, imageUrl: string): Promise<OperationResponse> {
    const awsConfig = getAwsConfig();
    const client = getS3Client(awsConfig);

    const key = `${userId}/${type}/${imageUrl}`;

    try {
        await client.send(
            new DeleteObjectCommand({
                Bucket: awsConfig.S3Bucket,
                Key: key,
            })
        );
    } catch (err) {
        return setResponse(
            `Failed to delete document: ${err}`,
            1
        );
    }
    return setResponse("File deleted successfully.", 0);
}

export async function getPreSignedURL(userId: string, fileExtension: string, type: string): Promise<OperationResponse> {
    const awsConfig = getAwsConfig();
    const client = getS3Client(awsConfig);
    const currentTime = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14);

    const fileName = `${currentTime}.${fileExtension}`;
    const key = `${userId}/${type}/${fileName}`;
    console.log("Generated key:", key);
    const command = new PutObjectCommand({
        Bucket: awsConfig.S3Bucket,
        Key: key,
        ACL: "public-read", // Grant public access
    });
    const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 }); // 5 minutes
    console.log("Generated pre-signed URL:", url);
    return setResponse("Pre-signed URL generated successfully.", 0, { DocumentURL: url, DocumentKey: fileName });
}