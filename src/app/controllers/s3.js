require('dotenv').config();
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

const bucketName = 'vanlanggifts-web';
const region = 'us-west-2';
const accessKeyId = 'AKIA2P3DKJENLSYKS447';
const secretAccessKey = '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';

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});
exports.uploadFile = async (files) => {
    const params = files.map((file) => {
        const fileStream = fs.createReadStream(file.path);

        return {
            Bucket: bucketName,
            Body: fileStream,
            Key: file.filename,
        };
    });

    return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

exports.getFileStream = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.getObject(downloadParams).createReadStream();
};
