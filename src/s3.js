require('dotenv').config();
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.BUCKET_NAME_AWS;
const region = process.env.BUCKET_REGION_AWS;
const accessKeyId = process.env.ACCESS_KEY_AWS;
const secretAccessKey = process.env.SECRET_KEY_AWS;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});

//uploads a file to s3
export function upload(file) {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    };

    return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;
