# AWS Rekognition Text Detection - Lambda Function

This AWS Lambda function detects text in images stored in an S3 bucket using AWS Rekognition and stores the detected information in a DynamoDB table.

## Project Overview

- **AWS Services Used**: 
  - S3 (for image storage)
  - Rekognition (for text detection)
  - DynamoDB (for metadata storage)
  - Lambda (for serverless function execution)

### Flow:

1. The Lambda function fetches an image from an S3 bucket.
2. AWS Rekognition is used to detect text within the image.
3. The detected text and metadata are stored in DynamoDB.

## Requirements

- AWS account with permissions for Lambda, S3, Rekognition, and DynamoDB.
- Node.js v14+ installed for local development.

### AWS Setup:

1. **S3 Bucket**:
   - Create an S3 bucket and upload the image you want to process (e.g., `city.png`).

2. **DynamoDB Table**:
   - Create a DynamoDB table for storing detected text.

3. **IAM Permissions**:
   - Ensure your Lambda function has the necessary IAM role with these permissions:
     - `s3:GetObject`
     - `rekognition:DetectText`
     - `dynamodb:PutItem`
