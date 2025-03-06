// tests/unit/controllers/VideoController.test.js
const VideoController = require('../../../src/controllers/VideoController');
const { mockRequest, mockResponse } = require('../../mocks/mockFactory');

// Mock dels models
jest.mock('../../../src/models', () => {
  const mockModels = {
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

  // Afegir mètode setCategories als mocks de Video
  mockModels.Video.findByPk.mockImplementation(() => ({
    setCategories: jest.fn().mockResolvedValue(true),
    Categories: [{ id: 1, titol: 'Categoria de Test' }]
  }));

  mockModels.Video.create.mockImplementation(() => ({
    id: 1,
    titol: 'Vídeo Test',
    setCategories: jest.fn().mockResolvedValue(true)
  }));

  return mockModels;
});

describe('VideoController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('obtenirTots', () => {
    it('hauria de retornar tots els vídeos', async () => {
      const mockVideos = [
        { id: 1, titol: 'Vídeo 1', Youtuber: { nom_canal: 'Canal 1' } },
        { id: 2, titol: 'Vídeo 2', Youtuber: { nom_canal: 'Canal 2' } },
      ];
      
      const { Video } = require('../../../src/models');
      Video.findAll.mockResolvedValue(mockVideos);
      
      await VideoController.obtenirTots(req, res, next);
      
      expect(Video.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        missatge: 'Vídeos obtinguts amb èxit',
        resultat: mockVideos
      });
    });
    
    it('hauria de gestionar errors', async () => {
      const error = new Error('Error de base de dades');
      const { Video } = require('../../../src/models');
      Video.findAll.mockRejectedValue(error);
      
      await VideoController.obtenirTots(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obtenirPerId', () => {
    it('hauria de retornar un vídeo per id', async () => {
      const mockVideo = {
        id: 1,
        titol: 'Vídeo Test',
        Youtuber: { id: 1, nom_canal: 'Canal Test', nom_youtuber: 'Youtuber Test' }
      };
      
      req.params = { id: 1 };
      const { Video } = require('../../../src/models');
      Video.findByPk.mockResolvedValue(mockVideo);
      
      await VideoController.obtenirPerId(req, res, next);
      
      expect(Video.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        missatge: 'Vídeo obtingut amb èxit',
        resultat: mockVideo
      });
    });
    
    it('hauria de retornar 404 per vídeo inexistent', async () => {
      req.params = { id: 999 };
      const { Video } = require('../../../src/models');
      Video.findByPk.mockResolvedValue(null);
      
      await VideoController.obtenirPerId(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        missatge: `No s'ha trobat cap vídeo amb l'ID: 999`
      });
    });
  });

  describe('obtenirCategories', () => {
    it('hauria de retornar categories d\'un vídeo', async () => {
      req.params = { id: 1 };
      
      const mockVideo = {
        id: 1,
        titol: 'Vídeo Test',
        Categories: [
          { id: 1, titol: 'JavaScript' },
          { id: 2, titol: 'Desenvolupament Web' }
        ]
      };
      
      const { Video } = require('../../../src/models');
      Video.findByPk
        .mockResolvedValueOnce(mockVideo) // Primera crida (verificació)
        .mockResolvedValueOnce(mockVideo); // Segona crida (amb includes)
      
      await VideoController.obtenirCategories(req, res, next);
      
      expect(Video.findByPk).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        missatge: 'Categories del vídeo obtingudes amb èxit',
        resultat: mockVideo.Categories
      });
    });
    
    it('hauria de retornar 404 per vídeo inexistent', async () => {
      req.params = { id: 999 };
      const { Video } = require('../../../src/models');
      Video.findByPk.mockResolvedValue(null);
      
      await VideoController.obtenirCategories(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('crearVideo', () => {
    it('hauria de crear un nou vídeo amb categories', async () => {
      req.body = {
        titol: 'Nou Vídeo Test',
        descripcio: 'Descripció del vídeo',
        url_video: 'https://youtube.com/test',
        youtuber_id: 1,
        data_publicacio: '2023-01-01',
        categories: [1, 2]
      };
      
      const mockYoutuber = { id: 1, nom_canal: 'Canal Test' };
      const mockCategories = [
        { id: 1, titol: 'JavaScript' },
        { id: 2, titol: 'Desenvolupament Web' }
      ];
      
      const { Youtuber, Video, Categoria } = require('../../../src/models');
      Youtuber.findByPk.mockResolvedValue(mockYoutuber);
      Categoria.findAll.mockResolvedValue(mockCategories);
      
      const mockVideo = {
        id: 1,
        titol: 'Nou Vídeo Test',
        setCategories: jest.fn().mockResolvedValue(true)
      };
      Video.create.mockResolvedValue(mockVideo);
      
      const mockVideoWithDetails = {
        id: 1,
        titol: 'Nou Vídeo Test',
        Youtuber: { nom_canal: 'Canal Test' },
        Categories: mockCategories
      };
      Video.findByPk.mockResolvedValue(mockVideoWithDetails);
      
      await VideoController.crearVideo(req, res, next);
      
      expect(Youtuber.findByPk).toHaveBeenCalledWith(1);
      expect(Video.create).toHaveBeenCalledWith({
        titol: 'Nou Vídeo Test',
        descripcio: 'Descripció del vídeo',
        url_video: 'https://youtube.com/test',
        youtuber_id: 1,
        data_publicacio: '2023-01-01',
        visualitzacions: 0,
        likes: 0
      });
      expect(Categoria.findAll).toHaveBeenCalled();
      expect(mockVideo.setCategories).toHaveBeenCalledWith(mockCategories);
      expect(Video.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        missatge: 'Vídeo creat amb èxit',
        resultat: mockVideoWithDetails
      });
    });
    
    it('hauria de retornar 404 si el youtuber no existeix', async () => {
      req.body = {
        titol: 'Nou Vídeo Test',
        youtuber_id: 999,
        url_video: 'https://youtube.com/test'
      };
      
      const { Youtuber } = require('../../../src/models');
      Youtuber.findByPk.mockResolvedValue(null);
      
      await VideoController.crearVideo(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        missatge: `No s'ha trobat cap youtuber amb l'ID: 999`
      });
      expect(require('../../../src/models').Video.create).not.toHaveBeenCalled();
    });
  });
});