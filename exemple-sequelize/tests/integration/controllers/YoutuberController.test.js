// tests/integration/controllers/YoutuberController.test.js - Test d'integració de controlador
const { sequelize, Youtuber, PerfilYoutuber } = require('../../setup');
const YoutuberController = require('../../../src/controllers/YoutuberController');
const { youtuberFixtures, perfilFixtures } = require('../../fixtures/youtubers');

describe('YoutuberController', () => {
  // Mock per req, res i next
  let req, res, next;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Carregar dades de prova
    await Youtuber.bulkCreate(youtuberFixtures);
    await PerfilYoutuber.bulkCreate(perfilFixtures);
  });

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('obtenirTots', () => {
    it('hauria de retornar tots els youtubers', async () => {
      req = {};
      
      await YoutuberController.obtenirTots(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(true);
      expect(responseData.resultat.length).toBe(2);
      expect(responseData.resultat[0].nom_canal).toBe('Canal Test');
    });
  });

  describe('obtenirPerId', () => {
    it('hauria de retornar un youtuber per id', async () => {
      req = { params: { id: 1 } };
      
      await YoutuberController.obtenirPerId(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(true);
      expect(responseData.resultat.id).toBe(1);
      expect(responseData.resultat.nom_canal).toBe('Canal Test');
    });

    it('hauria de retornar 404 per youtuber inexistent', async () => {
      req = { params: { id: 999 } };
      
      await YoutuberController.obtenirPerId(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(false);
    });
  });
  
  describe('obtenirPerfil', () => {
    it('hauria de retornar el perfil d\'un youtuber', async () => {
      req = { params: { id: 1 } };
      
      await YoutuberController.obtenirPerfil(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(true);
      expect(responseData.resultat.youtuber_id).toBe(1);
      expect(responseData.resultat.Youtuber).toBeDefined();
    });
    
    it('hauria de retornar 404 si el perfil no existeix', async () => {
      req = { params: { id: 999 } };
      
      await YoutuberController.obtenirPerfil(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(false);
    });
  });
  
  describe('obtenirVideos', () => {
    beforeAll(async () => {
      // Afegir alguns vídeos per a les proves si és necessari
      const Video = require('../../../src/models/Video');
      await Video.create({
        id: 1,
        youtuber_id: 1,
        titol: 'Vídeo Test 1',
        url_video: 'https://youtube.com/test1',
        visualitzacions: 1000,
        likes: 100
      });
      
      await Video.create({
        id: 2,
        youtuber_id: 1,
        titol: 'Vídeo Test 2',
        url_video: 'https://youtube.com/test2',
        visualitzacions: 2000,
        likes: 200
      });
    });
    
    it('hauria de retornar els vídeos d\'un youtuber', async () => {
      req = { params: { id: 1 } };
      
      await YoutuberController.obtenirVideos(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(true);
      expect(responseData.resultat.length).toBeGreaterThan(0);
    });
    
    it('hauria de retornar 404 si el youtuber no existeix', async () => {
      req = { params: { id: 999 } };
      
      await YoutuberController.obtenirVideos(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.ok).toBe(false);
    });
  });
});
