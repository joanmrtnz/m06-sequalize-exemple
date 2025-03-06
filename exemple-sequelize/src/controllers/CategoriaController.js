/**
 * CategoriaController.js
 * Controlador per gestionar les operacions relacionades amb les categories
 */

const { Categoria } = require('../models');
const { logger } = require('../config/logger');

/**
 * Obté totes les categories de la base de dades
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirTotes = async (req, res, next) => {
  try {
    logger.info('Petició per obtenir totes les categories');
    
    const categories = await Categoria.findAll();
    
    res.status(200).json({
      ok: true,
      missatge: 'Categories obtingudes amb èxit',
      resultat: categories
    });
  } catch (error) {
    logger.error('Error obtenint totes les categories:', error);
    next(error);
  }
};

module.exports = {
  obtenirTotes
};