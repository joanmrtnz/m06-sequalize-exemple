// tests/integration/routes/youtuberRoutes.test.js - Test d'integració de rutes
const request = require('supertest');
const app = require('../../../server'); // Importa l'app mockejada
const { sequelize, Youtuber, PerfilYoutuber } = require('../../setup');
const { youtuberFixtures, perfilFixtures } = require('../../fixtures/youtubers');

describe('Rutes Youtuber', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Carregar dades de prova
    await Youtuber.bulkCreate(youtuberFixtures);
    await PerfilYoutuber.bulkCreate(perfilFixtures);
  });

  describe('GET /api/youtubers', () => {
    it('hauria de retornar tots els youtubers', async () => {
      const response = await request(app)
        .get('/api/youtubers')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.ok).toBe(true);
      expect(response.body.resultat.length).toBe(2);
      expect(response.body.resultat[0].nom_canal).toBe('Canal Test');
    });
  });

  describe('GET /api/youtubers/:id', () => {
    it('hauria de retornar un youtuber per id', async () => {
      const response = await request(app)
        .get('/api/youtubers/1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.ok).toBe(true);
      expect(response.body.resultat.id).toBe(1);
      expect(response.body.resultat.nom_canal).toBe('Canal Test');
    });

    it('hauria de retornar 404 per youtuber inexistent', async () => {
      const response = await request(app)
        .get('/api/youtubers/999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.ok).toBe(false);
    });
  });

  describe('GET /api/youtubers/:id/perfil', () => {
    it('hauria de retornar el perfil d\'un youtuber', async () => {
      const response = await request(app)
        .get('/api/youtubers/1/perfil')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.ok).toBe(true);
      expect(response.body.resultat.youtuber_id).toBe(1);
      expect(response.body.resultat.url_twitter).toBe('https://twitter.com/test');
    });

    it('hauria de retornar 404 per perfil inexistent', async () => {
      const response = await request(app)
        .get('/api/youtubers/2/perfil')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.ok).toBe(false);
    });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
});
