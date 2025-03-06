// tests/unit/controllers/VideoController.error.test.js
const VideoController = require('../../../src/controllers/VideoController');
const { logger } = require('../../../src/config/logger');

// Mock dels models
jest.mock('../../../src/models', () => {
  return {
    Video: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Youtuber: {
      findByPk: jest.fn(),
    },
    Categoria: {
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

describe('VideoController Gestió d\'Errors', () => {
  let req, res, next;
  const { Video, Youtuber, Categoria } = require('../../../src/models');

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
      // Simular error en cercar els vídeos
      const error = new Error('Error de connexió a la base de dades');
      Video.findAll.mockRejectedValue(error);
      
      await VideoController.obtenirTots(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirPerId - gestió d\'errors', () => {
    it('hauria de gestionar errors en cercar un vídeo', async () => {
      req.params = { id: 1 };
      
      // Simular error en cercar un vídeo per id
      const error = new Error('Error en consultar la base de dades');
      Video.findByPk.mockRejectedValue(error);
      
      await VideoController.obtenirPerId(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirCategories - gestió d\'errors', () => {
    it('hauria de gestionar errors en cercar categories', async () => {
      req.params = { id: 1 };
      
      // Simular error en cercar el vídeo
      const error = new Error('Error en obtenir categories');
      Video.findByPk.mockRejectedValue(error);
      
      await VideoController.obtenirCategories(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('crearVideo - gestió d\'errors', () => {
    it('hauria de gestionar errors en crear un vídeo', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1,
        categories: [1, 2]
      };
      
      // Simular èxit en cercar el youtuber
      Youtuber.findByPk.mockResolvedValue({ id: 1, nom_canal: 'Canal Test' });
      
      // Simular error en crear el vídeo
      const error = new Error('Error en crear el vídeo');
      Video.create.mockRejectedValue(error);
      
      await VideoController.crearVideo(req, res, next);
      
      // Verificacions
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });

    it('hauria de gestionar error quan algunes categories no existeixen', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1,
        categories: [1, 2, 3]
      };
      
      // Simular èxit en cercar el youtuber
      Youtuber.findByPk.mockResolvedValue({ id: 1, nom_canal: 'Canal Test' });
      
      // Simular que el vídeo es crea correctament
      const mockVideo = {
        id: 1,
        titol: 'Vídeo Test',
        setCategories: jest.fn().mockResolvedValue(true)
      };
      Video.create.mockResolvedValue(mockVideo);
      
      // Simular que només es troben algunes de les categories sol·licitades
      const foundCategories = [
        { id: 1, titol: 'Categoria 1' }
      ];
      Categoria.findAll.mockResolvedValue(foundCategories);
      
      // Simular èxit en cercar el vídeo complet
      Video.findByPk.mockResolvedValue({
        ...mockVideo,
        Youtuber: { nom_canal: 'Canal Test' },
        Categories: foundCategories
      });
      
      await VideoController.crearVideo(req, res, next);
      
      // Verificacions
      expect(logger.warn).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201); // El vídeo es crea encara que faltin categories
      expect(res.json).toHaveBeenCalled();
    });
  });
});