let aws = require('aws-sdk')
require('dotenv').config();
let crypto = require('crypto')
let { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)

const region = "us-east-1"
const bucketName = "marketplace-image-upload"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
})

exports.generateUploadURL = async () => {
    const rawBytes = await randomBytes(16)
    const imageName = rawBytes.toString('hex')

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60
    })

    return await s3.getSignedUrlPromise('putObject', params)
}