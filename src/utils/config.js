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
    rabbitMQ: {
        server: process.env.RABBITMQ_SERVER,
    },
    redis: {
        host: process.env.REDIS_SERVER,
    }
};

module.exports = config;