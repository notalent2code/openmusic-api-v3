const Joi = require("Joi");

const ExportSchema = Joi.object({
  targetEmail: Joi.string()
    .email({
      tlds: true,
    })
    .required(),
});

module.exports = ExportSchema;
