const path = require("path");
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");
const config = require("./utils/config");
const ClientError = require("./errors/ClientError");

// Album
const album = require("./api/album");
const AlbumService = require("./services/database/AlbumService");
const AlbumValidator = require("./validators/album");

// Song
const song = require("./api/song");
const SongService = require("./services/database/SongService");
const SongValidator = require("./validators/song");

// User
const user = require("./api/user");
const UserService = require("./services/database/UserService");
const UserValidator = require("./validators/user");

// Authentication
const authentication = require("./api/auth");
const AuthenticationService = require("./services/database/AuthService");
const TokenManager = require("./utils/token");
const AuthenticationValidator = require("./validators/auth");

// Playlist
const playlist = require("./api/playlist");
const PlaylistService = require("./services/database/PlaylistService");
const PlaylistValidator = require("./validators/playlist");

// Collaboration
const Collaboration = require("./api/collaboration");
const CollaborationService = require("./services/database/CollaborationService");
const CollaborationValidator = require("./validators/collaboration");

// Export
const Export = require("./api/export");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportValidator = require("./validators/export");

// Storage
const StorageService = require("./services/storage/StorageService");

// Cache
const CacheService = require("./services/redis/CacheService");

const init = async () => {
  const collaborationService = new CollaborationService();
  const cacheService = new CacheService();
  const albumService = new AlbumService(cacheService);
  const playlistService = new PlaylistService(collaborationService);
  const authenticationService = new AuthenticationService();
  const userService = new UserService();
  const storageService = new StorageService(
    path.resolve(__dirname, "../upload/album-cover")
  );

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Error handling
  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Serve static files
  server.route({
    method: "GET",
    path: "/upload/album-cover/{param*}",
    handler: {
      directory: {
        path: path.join(__dirname, "../upload/album-cover"),
        listing: false,
        index: true,
      },
    },
  });

  server.auth.strategy("music_jwt", "jwt", {
    keys: config.jwt.accessKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
        service: albumService,
        validator: AlbumValidator,
        storageService,
      },
    },
    {
      plugin: user,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentication,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: Collaboration,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: Export,
      options: {
        service: ProducerService,
        validator: ExportValidator,
        playlistService,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
