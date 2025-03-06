/**
 * YoutuberController.js
 * Controlador per gestionar les operacions relacionades amb els youtubers
 */

const { Youtuber, PerfilYoutuber, Video } = require('../models');
const { logger } = require('../config/logger');

/**
 * Obté tots els youtubers de la base de dades
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirTots = async (req, res, next) => {
  try {
    logger.info('Petició per obtenir tots els youtubers');
    
    const youtubers = await Youtuber.findAll({
      attributes: ['id', 'nom_canal', 'nom_youtuber', 'descripcio', 'url_canal']
    });
    
    res.status(200).json({
      ok: true,
      missatge: 'Youtubers obtinguts amb èxit',
      resultat: youtubers
    });
  } catch (error) {
    logger.error('Error obtenint tots els youtubers:', error);
    next(error);
  }
};

/**
 * Obté un youtuber per ID
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirPerId = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Petició per obtenir youtuber amb ID: ${id}`);
    
    const youtuber = await Youtuber.findByPk(id);
    
    if (!youtuber) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap youtuber amb l'ID: ${id}`
      });
    }
    
    res.status(200).json({
      ok: true,
      missatge: 'Youtuber obtingut amb èxit',
      resultat: youtuber
    });
  } catch (error) {
    logger.error(`Error obtenint youtuber amb ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Obté el perfil d'un youtuber
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirPerfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Petició per obtenir perfil del youtuber amb ID: ${id}`);
    
    const perfil = await PerfilYoutuber.findOne({
      where: { youtuber_id: id },
      include: [
        {
          model: Youtuber,
          attributes: ['nom_canal', 'nom_youtuber']
        }
      ]
    });
    
    if (!perfil) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap perfil pel youtuber amb ID: ${id}`
      });
    }
    
    res.status(200).json({
      ok: true,
      missatge: 'Perfil obtingut amb èxit',
      resultat: perfil
    });
  } catch (error) {
    logger.error(`Error obtenint perfil del youtuber amb ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Obté els vídeos d'un youtuber
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció següent del middleware
 */
const obtenirVideos = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Petició per obtenir vídeos del youtuber amb ID: ${id}`);
    
    // Verificar primer si el youtuber existeix
    const youtuber = await Youtuber.findByPk(id);
    
    if (!youtuber) {
      return res.status(404).json({
        ok: false,
        missatge: `No s'ha trobat cap youtuber amb l'ID: ${id}`
      });
    }
    
    const videos = await Video.findAll({
      where: { youtuber_id: id },
      attributes: ['id', 'titol', 'url_video', 'data_publicacio', 'visualitzacions', 'likes']
    });
    
    res.status(200).json({
      ok: true,
      missatge: `Vídeos del youtuber ${youtuber.nom_canal} obtinguts amb èxit`,
      resultat: videos
    });
  } catch (error) {
    logger.error(`Error obtenint vídeos del youtuber amb ID ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  obtenirTots,
  obtenirPerId,
  obtenirPerfil,
  obtenirVideos
};