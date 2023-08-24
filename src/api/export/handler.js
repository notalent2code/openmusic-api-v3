const autoBind = require("auto-bind");

class ExportHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPayload(request.payload);
    const { playlistId } = request.params;
    const userId = request.auth.credentials.id;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);

    const { targetEmail } = request.payload;
    const message = { playlistId, targetEmail };

    await this._service.sendMessage("export:playlist", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Permintaan Anda dalam antrean",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;
