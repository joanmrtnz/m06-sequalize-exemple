// tests/setup.js
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

// Mock de la base de dades ABANS d'importar-la
jest.mock('../src/config/database', () => {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  return { sequelize };
});

// Importar l'instància mockejada
const { sequelize } = require('../src/config/database');

// Importar els models individualment
const Youtuber = require('../src/models/Youtuber');
const PerfilYoutuber = require('../src/models/PerfilYoutuber');
const Video = require('../src/models/Video');
const Categoria = require('../src/models/Categoria');

// Definir la taula intermèdia per a la relació N:M
const VideosCategories = sequelize.define('videos_categories', {
  video_id: {
    type: sequelize.Sequelize.INTEGER,
    primaryKey: true
  },
  categoria_id: {
    type: sequelize.Sequelize.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'videos_categories',
  timestamps: false
});

// Configurar les relacions entre els models igual que al fitxer models/index.js
// Relació 1:1 entre Youtuber i PerfilYoutuber
Youtuber.hasOne(PerfilYoutuber, { foreignKey: 'youtuber_id' });
PerfilYoutuber.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació 1:N entre Youtuber i Video
Youtuber.hasMany(Video, { foreignKey: 'youtuber_id' });
Video.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació N:M entre Video i Categoria
Video.belongsToMany(Categoria, { through: VideosCategories, foreignKey: 'video_id' });
Categoria.belongsToMany(Video, { through: VideosCategories, foreignKey: 'categoria_id' });

// Mock del server per evitar que s'iniciï automàticament
jest.mock('../server', () => {
  const express = require('express');
  const app = express();
  
  // Configuració de middleware
  app.use(express.json());
  
  // Importar rutes
  const rutesYoutuber = require('../src/routes/rutesYoutuber');
  const rutesVideo = require('../src/routes/rutesVideo');
  const rutesCategoria = require('../src/routes/rutesCategoria');
  
  // Afegir les rutes
  app.use('/api/youtubers', rutesYoutuber);
  app.use('/api/videos', rutesVideo);
  app.use('/api/categories', rutesCategoria);
  
  // Afegir un middleware per al gestor d'errors
  const gestorErrors = require('../src/middleware/gestorErrors');
  app.use(gestorErrors);
  
  // Mock del mètode listen per evitar que s'iniciï el servidor
  app.listen = jest.fn(() => ({ close: jest.fn() }));
  
  return app;
});

// Desactivar logs durant els tests
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  expressLogger: jest.fn((req, res, next) => next()),
}));

// Configuració per tots els tests
beforeAll(async () => {
  // Inicialitzar els models i la base de dades en memòria
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.log('Info: Error al tancar la base de dades, pot ser que ja estigui tancada');
  }
});

// Configuració global de Jest
jest.setTimeout(30000); // 30 segons

// Exportar l'instància per utilitzar-la en altres tests
module.exports = { sequelize, Youtuber, Video, Categoria, PerfilYoutuber, VideosCategories };