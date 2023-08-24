const Joi = require("joi");

const AlbumSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

const AlbumCoverSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp"
    )
    .required(),
}).unknown();

module.exports = { AlbumSchema, AlbumCoverSchema };
