/**
 * CategoriaController.js
 * Controlador per gestionar les operacions relacionades amb les categories
 */

const { LlistaReproduccio } = require('../models');
const { logger } = require('../config/logger');

/**
 * Obté totes les categories de la base de dades
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirTotes = async (req, res, next) => {
  try {
    logger.info('Petició per obtenir totes les llistes de reproduccio');
    
    const llistes = await LlistaReproduccio.findAll();
    
    res.status(200).json({
      ok: true,
      missatge: 'Listes de reproduccio obtingudes amb èxit',
      resultat: llistes
    });
  } catch (error) {
    logger.error('Error obtenint totes les llistes de reproduccio:', error);
    next(error);
  }
};

/**
 * Crea un nou vídeo
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
// const crearLlista = async (req, res, next) => {
//   try {
//     const { titol } = req.body;
//     logger.info('Petició per crear un nova llista de reproduccio', { titol });
    
    
    
//     // Crear la llista
//     const llista = await LlistaReproduccio.create({
//       titol
//     });
    
     
//      ogger.info(`Categories associades al vídeo amb èxit: ${categoriesExistents.map(c => c.id)}`);
//     }
    
//     // Retornar el vídeo creat amb les seves categories
//     const videoComplet = await Video.findByPk(video.id, {
//       include: [
//         {
//           model: Youtuber,
//           attributes: ['nom_canal']
//         },
//         {
//           model: Categoria,
//           through: { attributes: [] }
//         }
//       ]
//     });
    
//     res.status(201).json({
//       ok: true,
//       missatge: 'Vídeo creat amb èxit',
//       resultat: videoComplet
//     });
//   } catch (error) {
//     logger.error('Error creant nou vídeo:', error);
//     next(error);
//   }
// };


module.exports = {
  obtenirTotes
  // crearLlista
};