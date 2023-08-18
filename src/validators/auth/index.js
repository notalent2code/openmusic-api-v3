const { PostAuthSchema, PutAuthSchema, DeleteAuthSchema } = require("./schema");
const InvariantError = require("../../errors/InvariantError");

const AuthValidator = {
  validatePostAuthPayload: (payload) => {
    const validationResult = PostAuthSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutAuthPayload: (payload) => {
    const validationResult = PutAuthSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteAuthPayload: (payload) => {
    const validationResult = DeleteAuthSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;
