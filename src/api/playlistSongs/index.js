const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongs',
  version: '1.0.0',
  register: async (server, {
    songsService, playlistSongsService, playlistsService, validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(songsService, playlistSongsService, playlistsService, validator);
    server.route(routes(playlistSongsHandler));
  },
};
