// tests/unit/controllers/VideoController.categories.test.js
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

describe('VideoController - Categories', () => {
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

  describe('crearVideo amb categories', () => {
    it('hauria de crear un vídeo sense categories quan no es proporcionen', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1
        // Sense categories
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
      
      // Simular èxit en cercar el vídeo complet
      Video.findByPk.mockResolvedValue({
        ...mockVideo,
        Youtuber: { nom_canal: 'Canal Test' },
        Categories: []
      });
      
      await VideoController.crearVideo(req, res, next);
      
      // Verificacions
      expect(mockVideo.setCategories).not.toHaveBeenCalled(); // No es crida a setCategories
      expect(Categoria.findAll).not.toHaveBeenCalled(); // No es cerquen categories
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('hauria de crear un vídeo amb categories buides', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1,
        categories: [] // Array buit
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
      
      // Simular èxit en cercar el vídeo complet
      Video.findByPk.mockResolvedValue({
        ...mockVideo,
        Youtuber: { nom_canal: 'Canal Test' },
        Categories: []
      });
      
      await VideoController.crearVideo(req, res, next);
      
      // Verificacions
      expect(mockVideo.setCategories).not.toHaveBeenCalled(); // No es crida a setCategories amb array buit
      expect(Categoria.findAll).not.toHaveBeenCalled(); // No es cerquen categories
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('hauria de crear un vídeo quan categories no és un array', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1,
        categories: "1,2,3" // No és un array
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
      
      // Simular èxit en cercar el vídeo complet
      Video.findByPk.mockResolvedValue({
        ...mockVideo,
        Youtuber: { nom_canal: 'Canal Test' },
        Categories: []
      });
      
      await VideoController.crearVideo(req, res, next);
      
      // Verificacions
      expect(mockVideo.setCategories).not.toHaveBeenCalled(); // No es crida a setCategories
      expect(Categoria.findAll).not.toHaveBeenCalled(); // No es cerquen categories
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('hauria de gestionar categories parcialment trobades', async () => {
      req.body = {
        titol: 'Vídeo Test',
        descripcio: 'Descripció de prova',
        url_video: 'https://example.com/video',
        youtuber_id: 1,
        categories: [1, 2, 3] // Sol·licita 3 categories
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
      
      // Simular que només es troben 2 de 3 categories
      const foundCategories = [
        { id: 1, titol: 'Categoria 1' },
        { id: 2, titol: 'Categoria 2' }
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
      expect(Categoria.findAll).toHaveBeenCalledWith({ where: { id: [1, 2, 3] } });
      expect(logger.warn).toHaveBeenCalledWith('Algunes categories no existeixen', expect.any(Object));
      expect(mockVideo.setCategories).toHaveBeenCalledWith(foundCategories);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });
});