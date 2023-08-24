const InvariantError = require("../../errors/InvariantError");
const { AlbumSchema, AlbumCoverSchema } = require("./schema");

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumCoverPayload: (payload) => {
    const validationResult = AlbumCoverSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
