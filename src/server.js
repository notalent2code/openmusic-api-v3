require("dotenv").config();
const Hapi = require("@hapi/hapi");

// Album
const album = require("./api/album");
const AlbumService = require("./services/AlbumService");
const AlbumValidator = require("./validators/album");

// Song
const song = require("./api/song");
const SongService = require("./services/SongService");
const SongValidator = require("./validators/song");

const bootstrap = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: song,
      options: {
        service: new SongService(),
        validator: SongValidator,
      },
    },
    {
      plugin: album,
      options: {
        service: new AlbumService(),
        validator: AlbumValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

bootstrap();
