const SongHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "Song API",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const songHandler = new SongHandler(service, validator);
    server.route(routes(songHandler));
  },
};
