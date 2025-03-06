// tests/unit/controllers/YoutuberController.error.test.js
const YoutuberController = require('../../../src/controllers/YoutuberController');
const { logger } = require('../../../src/config/logger');

// Mock dels models
jest.mock('../../../src/models', () => {
  return {
    Youtuber: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    PerfilYoutuber: {
      findOne: jest.fn(),
    },
    Video: {
      findAll: jest.fn(),
    }
  };
});

// Mock del logger
jest.mock('../../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }
}));

describe('YoutuberController Gestió d\'Errors', () => {
  let req, res, next;
  const { Youtuber, PerfilYoutuber, Video } = require('../../../src/models');

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('obtenirTots - gestió d\'errors', () => {
    it('hauria de gestionar errors de base de dades', async () => {
      // Simular error en cercar tots els youtubers
      const error = new Error('Error de connexió a la base de dades');
      Youtuber.findAll.mockRejectedValue(error);
      
      await YoutuberController.obtenirTots(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirPerId - gestió d\'errors', () => {
    it('hauria de gestionar errors en cercar un youtuber', async () => {
      req.params = { id: 1 };
      
      // Simular error en cercar un youtuber per id
      const error = new Error('Error en consultar la base de dades');
      Youtuber.findByPk.mockRejectedValue(error);
      
      await YoutuberController.obtenirPerId(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirPerfil - gestió d\'errors', () => {
    it('hauria de gestionar errors en cercar el perfil', async () => {
      req.params = { id: 1 };
      
      // Simular error en cercar el perfil
      const error = new Error('Error en obtenir el perfil');
      PerfilYoutuber.findOne.mockRejectedValue(error);
      
      await YoutuberController.obtenirPerfil(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirVideos - gestió d\'errors', () => {
    it('hauria de gestionar errors en cercar vídeos del youtuber', async () => {
      req.params = { id: 1 };
      
      // Simular error en cercar si el youtuber existeix
      const error = new Error('Error en consultar els vídeos');
      Youtuber.findByPk.mockRejectedValue(error);
      
      await YoutuberController.obtenirVideos(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});