const Joi = require("joi");

const PostAuthSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const PutAuthSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthSchema,
  PutAuthSchema,
  DeleteAuthSchema,
};
