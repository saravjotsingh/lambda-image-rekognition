import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { S3Event } from 'aws-lambda';

// Initialize AWS clients
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// Helper function to convert stream to buffer
const streamToBuffer = async (stream: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};

// Lambda Handler
export const handler = async (event: S3Event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    try {
        // Fetch image from S3
        const s3Params = new GetObjectCommand({ Bucket: bucket, Key: key });
        const s3Response = await s3Client.send(s3Params);
        const imageBytes = await streamToBuffer(s3Response.Body);

        // Detect text in the image using Rekognition
        const rekognitionParams = new DetectTextCommand({
            Image: { Bytes: imageBytes }
        });
        const rekognitionResponse = await rekognitionClient.send(rekognitionParams);

        // Log detected text
        console.log('Detected text:', rekognitionResponse.TextDetections);

        // Store the detected text and image metadata in DynamoDB
        const dbParams = {
            TableName: process.env.TABLE_NAME,
            Item: {
                id: { N: '1' },
                ImageKey: { S: key },
                detectedText: { S: JSON.stringify(rekognitionResponse.TextDetections) }
            }
        };

        const dbUpdateResponse = await dbClient.send(new PutItemCommand(dbParams));
        console.log('DynamoDB update successful:', dbUpdateResponse);
    } catch (error) {
        console.error('Error processing image:', error);
    }
};