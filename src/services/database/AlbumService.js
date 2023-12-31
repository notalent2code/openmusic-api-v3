const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../errors/InvariantError");
const NotFoundError = require("../../errors/NotFoundError");

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };

    const querySong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN albums ON albums.id=songs."albumId" WHERE albums.id=$1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSong = await this._pool.query(querySong);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    return {
      id: resultAlbum.rows[0].id,
      name: resultAlbum.rows[0].name,
      year: resultAlbum.rows[0].year,
      coverUrl: resultAlbum.rows[0].cover,
      songs: resultSong.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async postAlbumCoverById(id, cover) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2",
      values: [cover, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async postUserAlbumLikeById(userId, albumId) {
    const queryAlbum = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [albumId],
    };

    const { rows: resultAlbum } = await this._pool.query(queryAlbum);

    if (!resultAlbum.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const querySearchLike = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const resultSearchLike = await this._pool.query(querySearchLike);

    if (!resultSearchLike.rows.length) {
      const id = `like-${nanoid(16)}`;

      const queryLike = {
        text: "INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)",
        values: [id, userId, albumId],
      };

      await this._pool.query(queryLike);
      await this._cacheService.delete(`album-likes:${albumId}`);

      return "Berhasil menyukai album";
    }

    throw new InvariantError("Gagal menambahkan like album");
  }

  async getUserAlbumLikesById(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return {
        source: "cache",
        albumLikes: JSON.parse(result),
      };
    } catch (error) {
      const queryAlbum = {
        text: "SELECT * FROM albums WHERE id = $1",
        values: [albumId],
      };

      const resultAlbum = await this._pool.query(queryAlbum);

      if (!resultAlbum.rows.length) {
        throw new NotFoundError("Album tidak ditemukan");
      }

      const queryLikes = {
        text: "SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const resultLikes = await this._pool.query(queryLikes);
      const resultLikesNumber = Number(resultLikes.rows[0].count);

      // Default cache duration is 30 minutes
      await this._cacheService.set(
        `album-likes:${albumId}`,
        JSON.stringify(resultLikesNumber)
      ); 

      return {
        source: "database",
        albumLikes: resultLikesNumber,
      };
    }
  }

  async deleteUserAlbumLikeById(userId, albumId) {
    const querySearchLike = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const resultSearchLike = await this._pool.query(querySearchLike);

    if (!resultSearchLike.rows.length) {
      throw new NotFoundError("Like album tidak ditemukan");
    }

    const queryDeleteLike = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    await this._pool.query(queryDeleteLike);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }
}

module.exports = AlbumService;
