const ClientError = require('../../exceptions/ClientError');

class UserAlbumLikesHandler {
  constructor(service) {
    this._service = service;

    this.postUserAlbumLikesHandler = this.postUserAlbumLikesHandler.bind(this);
    this.getUserAlbumLikesHandler = this.getUserAlbumLikesHandler.bind(this);
  }

  async postUserAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._service.validateAlbumId(albumId);
      const isAlbumLiked = await this._service.verifyIsAlbumLiked(userId, albumId);

      if (!isAlbumLiked) {
        await this._service.addUserAlbumLike(userId, albumId);

        const response = h.response({
          status: 'success',
          message: 'Berhasil menyukai album',
        });
        response.code(201);
        return response;
      }
      await this._service.deleteUserAlbumLike(userId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil membatalkan menyukai album',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const data = await this._service.getTotalAlbumLike(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: data.count,
      },
    });
    if (data.source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
