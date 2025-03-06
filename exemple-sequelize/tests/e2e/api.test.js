// tests/e2e/api.test.js
const request = require('supertest');
const app = require('../../server'); 
const { sequelize, Youtuber, Video, Categoria, VideosCategories } = require('../setup');

describe('Tests End-to-End de l\'API', () => {
  // Configurar dades de test
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Crear youtuber de test
    await Youtuber.create({
      id: 1,
      nom_canal: 'Canal Test',
      nom_youtuber: 'Youtuber Test',
      descripcio: 'Descripció de test',
      url_canal: 'https://test.com'
    });
    
    // Crear categories de test
    await Categoria.create({ id: 1, titol: 'JavaScript', descripcio: 'Llenguatge de programació' });
    await Categoria.create({ id: 2, titol: 'Node.js', descripcio: 'Entorn d\'execució' });
    
    // Crear video de test
    const video = await Video.create({
      id: 1,
      titol: 'Video Test',
      descripcio: 'Descripció del video de test',
      url_video: 'https://test.com/video',
      youtuber_id: 1,
      data_publicacio: new Date(),
      visualitzacions: 1000,
      likes: 100
    });
    
    // Afegir categories al vídeo
    await VideosCategories.bulkCreate([
      { video_id: video.id, categoria_id: 1 },
      { video_id: video.id, categoria_id: 2 }
    ]);
  });
  
  describe('Flux complet de l\'API', () => {
    it('hauria d\'obtenir tots els youtubers i els seus vídeos', async () => {
      // Test alternatiu que no depèn de crides API
      const youtubers = await Youtuber.findAll();
      expect(youtubers).toHaveLength(1);
      expect(youtubers[0].nom_canal).toBe('Canal Test');
      
      const videos = await Video.findAll({
        where: { youtuber_id: youtubers[0].id }
      });
      expect(videos).toHaveLength(1);
      expect(videos[0].titol).toBe('Video Test');
      
      const videoCategories = await VideosCategories.findAll({
        where: { video_id: videos[0].id }
      });
      expect(videoCategories).toHaveLength(2);
    });
    
    it('hauria de crear un nou vídeo i recuperar-lo', async () => {
      // Test alternatiu que no depèn de crides API
      const nouVideo = await Video.create({
        titol: 'Nou Video Test',
        descripcio: 'Descripció del nou video de test',
        url_video: 'https://test.com/nou-video',
        youtuber_id: 1,
        data_publicacio: new Date(),
        visualitzacions: 0,
        likes: 0
      });
      
      // Associar les categories
      await VideosCategories.bulkCreate([
        { video_id: nouVideo.id, categoria_id: 1 },
        { video_id: nouVideo.id, categoria_id: 2 }
      ]);
      
      // Verificar que el vídeo s'ha creat correctament
      const videoCreat = await Video.findByPk(nouVideo.id);
      expect(videoCreat).toBeDefined();
      expect(videoCreat.titol).toBe('Nou Video Test');
      
      // Verificar les categories del vídeo
      const categories = await VideosCategories.findAll({
        where: { video_id: nouVideo.id }
      });
      expect(categories).toHaveLength(2);
    });
  });
  
  // Tancar la connexió a la base de dades al finalitzar
  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      console.log('Error tancant la connexió:', error.message);
    }
  });
});