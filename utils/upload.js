const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { nanoid } = require("nanoid");
const path = require("path");

aws.config.update({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    region: "eu-central-1",
    AWS_SDK_LOAD_CONFIG: process.env.AWS_SDK_LOAD_CONFIG,
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'yarmarok-bucket',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${nanoid()}${ext}`);
        }
    })
});

module.exports = upload;

