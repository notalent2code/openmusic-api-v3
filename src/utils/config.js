require("dotenv").config();

const config = {
    app: {
        host: process.env.HOST,
        port: process.env.PORT,
    },
    jwt: {
        accessKey: process.env.ACCESS_TOKEN_KEY,
        accessAge: process.env.ACCESS_TOKEN_AGE,
        refreshKey: process.env.REFRESH_TOKEN_KEY,
    },
    s3: {
        bucketName: process.env.AWS_BUCKET_NAME,
    },
    rabbitMQ: {
        server: process.env.RABBITMQ_SERVER,
    },
    redis: {
        host: process.env.REDIS_HOST,
    }
};

module.exports = config;