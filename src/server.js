require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const ClientError = require("./errors/ClientError");

// Album
const album = require("./api/album");
const AlbumService = require("./services/AlbumService");
const AlbumValidator = require("./validators/album");

// Song
const song = require("./api/song");
const SongService = require("./services/SongService");
const SongValidator = require("./validators/song");

// User
const user = require("./api/user");
const UserService = require("./services/UserService");
const UserValidator = require("./validators/user");

// Authentication
const authentication = require("./api/auth");
const AuthenticationService = require("./services/AuthService");
const TokenManager = require("./utils/token");
const AuthenticationValidator = require("./validators/auth");

// Playlist
const playlist = require("./api/playlist");
const PlaylistService = require("./services/PlaylistService");
const PlaylistValidator = require("./validators/playlist");

// Collaboration
const Collaboration = require("./api/collaboration");
const CollaborationService = require("./services/CollaborationService");
const CollaborationValidator = require("./validators/collaboration");

const init = async () => {
  const collaborationService = new CollaborationService();
  const albumService = new AlbumService();
  const playlistService = new PlaylistService(collaborationService);
  const authenticationService = new AuthenticationService();
  const userService = new UserService();
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // Error handling
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      if (statusCode === 401) {
        return h.response(payload).code(401);
      }
      const newResponse = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      console.log(response);
      newResponse.code(500);
      return newResponse;
    }
    return response.continue || response;
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy("music_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
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
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
