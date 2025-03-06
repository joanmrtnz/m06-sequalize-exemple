/**
 * swagger.js
 * Configuració de Swagger per la documentació de l'API
 */

const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de YouTubers de Programació',
      version: '1.0.0',
      description: 'API per gestionar informació de youtubers relacionats amb la programació'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolupament'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Fitxers on es troben les definicions de les rutes
};

module.exports = swaggerJsDoc(swaggerOptions);