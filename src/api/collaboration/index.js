const CollaborationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "Collaboration API",
  version: "1.0.0",
  register: async (
    server,
    { collaborationService, playlistService, validator }
  ) => {
    const collaborationHandler = new CollaborationHandler(
      collaborationService,
      playlistService,
      validator
    );
    server.route(routes(collaborationHandler));
  },
};