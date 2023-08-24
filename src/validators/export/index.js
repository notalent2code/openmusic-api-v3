const ExportSchema = require("./schema");
const InvariantError = require("../../errors/InvariantError");

const ExportValidator = {
  validateExportPayload: (payload) => {
    const validationResult = ExportSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportValidator;
