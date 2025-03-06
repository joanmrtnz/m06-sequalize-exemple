  // tests/unit/models/Youtuber.test.js - Test unitari de model
  const { sequelize } = require('../../../src/config/database');
  const Youtuber = require('../../../src/models/Youtuber');
  
  describe('Model Youtuber', () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
  
    it('hauria de crear un youtuber', async () => {
      const youtuber = await Youtuber.create({
        nom_canal: 'Canal Test',
        nom_youtuber: 'Youtuber Test',
        descripcio: 'Canal de prova',
        url_canal: 'https://youtube.com/test'
      });
  
      expect(youtuber.id).toBeDefined();
      expect(youtuber.nom_canal).toBe('Canal Test');
      expect(youtuber.nom_youtuber).toBe('Youtuber Test');
    });
  
    it('no hauria de crear un youtuber sense nom_canal', async () => {
      try {
        await Youtuber.create({
          nom_youtuber: 'Youtuber Test',
          descripcio: 'Canal de prova',
          url_canal: 'https://youtube.com/test'
        });
        // Si arribem aquí, la prova ha de fallar
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('SequelizeValidationError');
      }
    });
    
    afterAll(async () => {
      await sequelize.close();
    });
  });
    
  