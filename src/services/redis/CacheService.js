const redis = require("redis");
const config = require("../../utils/config");

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on("error", (error) => {
      console.log(error);
    });

    this._client.on("connect", () => {
      console.log("Redis successfully connected");
    });

    this._client.connect();
  }

  // Set expiration time to 30 minutes
  async set(key, value, expirationInSeconds = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSeconds,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (!result) {
      throw new Error("Cache tidak ditemukan");
    }

    return result;
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;
