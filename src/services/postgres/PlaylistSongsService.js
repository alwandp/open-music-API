const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongs(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongs(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlist_songs
            INNER JOIN playlists ON playlists.id = playlist_id
            INNER JOIN users ON users.id = playlists.owner
            WHERE playlist_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlistSongs = result.rows[0];

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
            INNER JOIN songs ON songs.id = song_id
            WHERE playlist_id = $1`,
      values: [id],
    };

    const songResult = await this._pool.query(querySong);
    playlistSongs.songs = songResult.rows;

    return playlistSongs;
  }

  async deletePlaylistSongs(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist lagu gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal diverifikasi');
    }
  }
}

module.exports = PlaylistSongsService;
