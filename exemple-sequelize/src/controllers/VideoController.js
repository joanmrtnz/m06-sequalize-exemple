/**
 * VideoController.js
 * Controlador per gestionar les operacions relacionades amb els vídeos
 */

const { Video, Youtuber, Categoria } = require('../models');
const { logger } = require('../config/logger');

/**
 * Obté tots els vídeos de la base de dades
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirTots = async (req, res, next) => {
  try {
    logger.info('Petició per obtenir tots els vídeos');
    
    const videos = await Video.findAll({
      include: [
        {
          model: Youtuber,
          attributes: ['nom_canal']
        }
      ]
    });
    
    res.status(200).json({
      ok: true,
      missatge: 'Vídeos obtinguts amb èxit',
      resultat: videos
    });
  } catch (error) {
    logger.error('Error obtenint tots els vídeos:', error);
    next(error);
  }
};

/**
 * Obté un vídeo per ID
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirPerId = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Petició per obtenir vídeo amb ID: ${id}`);
    
    const video = await Video.findByPk(id, {
      include: [
        {
          model: Youtuber,
          attributes: ['id', 'nom_canal', 'nom_youtuber']
        }
      ]
    });
    
    if (!video) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap vídeo amb l'ID: ${id}`
      });
    }
    
    res.status(200).json({
      ok: true,
      missatge: 'Vídeo obtingut amb èxit',
      resultat: video
    });
  } catch (error) {
    logger.error(`Error obtenint vídeo amb ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Obté les categories d'un vídeo
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirCategories = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Petició per obtenir categories del vídeo amb ID: ${id}`);
    
    // Verificar primer si el vídeo existeix
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap vídeo amb l'ID: ${id}`
      });
    }
    
    const videoAmbCategories = await Video.findByPk(id, {
      include: [
        {
          model: Categoria,
          through: { attributes: [] } // No incloure dades de la taula de relació
        }
      ]
    });
    
    res.status(200).json({
      ok: true,
      missatge: 'Categories del vídeo obtingudes amb èxit',
      resultat: videoAmbCategories.Categories
    });
  } catch (error) {
    logger.error(`Error obtenint categories del vídeo amb ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Crea un nou vídeo
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const crearVideo = async (req, res, next) => {
  try {
    const { titol, descripcio, url_video, youtuber_id, data_publicacio, categories } = req.body;
    logger.info('Petició per crear un nou vídeo', { titol, youtuber_id });
    
    // Verificar que el youtuber existeix
    const youtuber = await Youtuber.findByPk(youtuber_id);
    if (!youtuber) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap youtuber amb l'ID: ${youtuber_id}`
      });
    }
    
    // Crear el vídeo
    const video = await Video.create({
      titol,
      descripcio,
      url_video,
      youtuber_id,
      data_publicacio,
      visualitzacions: 0,
      likes: 0
    });
    
    // Si s'han proporcionat categories, afegir-les al vídeo
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Verificar que totes les categories existeixen
      const categoriesExistents = await Categoria.findAll({
        where: { id: categories }
      });
      
      if (categoriesExistents.length !== categories.length) {
        logger.warn('Algunes categories no existeixen', {
          proporcionades: categories,
          trobades: categoriesExistents.map(c => c.id)
        });
      }
      
      await video.setCategories(categoriesExistents);
      logger.info(`Categories associades al vídeo amb èxit: ${categoriesExistents.map(c => c.id)}`);
    }
    
    // Retornar el vídeo creat amb les seves categories
    const videoComplet = await Video.findByPk(video.id, {
      include: [
        {
          model: Youtuber,
          attributes: ['nom_canal']
        },
        {
          model: Categoria,
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json({
      ok: true,
      missatge: 'Vídeo creat amb èxit',
      resultat: videoComplet
    });
  } catch (error) {
    logger.error('Error creant nou vídeo:', error);
    next(error);
  }
};

module.exports = {
  obtenirTots,
  obtenirPerId,
  obtenirCategories,
  crearVideo
};