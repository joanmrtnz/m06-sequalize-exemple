/**
 * gestorErrors.js
 * Middleware per gestionar els errors de forma centralitzada
 */

const { logger } = require('../config/logger');

/**
 * Middleware de gestió d'errors centralitzada
 * Captura i processa diversos tipus d'errors de l'aplicació
 * 
 * @param {Error} err - Objecte d'error
 * @param {Object} req - Objecte de petició
 * @param {Object} res - Objecte de resposta
 * @param {Function} next - Funció middleware següent
 */
const gestorErrors = (err, req, res, next) => {
  // Registre complet de l'error per a depuració
  logger.error('Error detectat en la sol·licitud', { 
    missatge: err.message,
    pila: err.stack,
    ruta: req.path,
    metode: req.method,
    dades_peticio: req.body,
    ip_client: req.ip
  });
  
  // Gestió específica d'errors de Sequelize
  switch (err.name) {
    case 'SequelizeValidationError':
      // Errors de validació (camps obligatoris, restriccions)
      logger.warn('Error de validació de dades', {
        errors: err.errors.map(e => ({
          camp: e.path,
          missatge: e.message
        }))
      });
      return res.status(400).json({
        codi: 'ERROR_VALIDACIO',
        missatge: 'Les dades proporcionades no compleixen els requisits',
        detalls: err.errors.map(e => ({
          camp: e.path,
          error: e.message
        }))
      });
    
    case 'SequelizeUniqueConstraintError':
      // Errors d'unicitat (duplicats)
      logger.warn('Intent de crear registre duplicat', {
        camps_duplicats: err.errors.map(e => e.path)
      });
      return res.status(409).json({
        codi: 'ERROR_DUPLICAT',
        missatge: 'Ja existeix un registre amb aquests valors',
        detalls: err.errors.map(e => ({
          camp: e.path,
          error: 'El valor ha de ser únic'
        }))
      });
    
    case 'SequelizeForeignKeyConstraintError':
      // Errors de clau forana
      logger.warn('Error de restricció de clau forana', {
        taula: err.table,
        clau: err.parent?.detail
      });
      return res.status(400).json({
        codi: 'ERROR_CLAU_FORANA',
        missatge: 'La referència a un altre registre no és vàlida',
        detalls: err.parent?.detail
      });
    
    case 'SequelizeDatabaseError':
      // Errors generals de base de dades
      logger.error('Error de base de dades', {
        codi: err.parent?.code,
        missatge: err.parent?.sqlMessage
      });
      return res.status(500).json({
        codi: 'ERROR_BASE_DADES',
        missatge: 'S\'ha produït un error en la base de dades'
      });
  }

  // Gestió d'errors de validació de dades generals
  if (err.name === 'ValidationError') {
    logger.warn('Error de validació de dades', {
      errors: Object.keys(err.errors).map(key => ({
        camp: key,
        missatge: err.errors[key].message
      }))
    });
    return res.status(400).json({
      codi: 'ERROR_VALIDACIO',
      missatge: 'Les dades proporcionades no compleixen els requisits',
      detalls: Object.keys(err.errors).map(key => ({
        camp: key,
        error: err.errors[key].message
      }))
    });
  }

  // Gestió d'errors de sol·licituds no autoritzades
  if (err.name === 'UnauthorizedError') {
    logger.warn('Intent d\'accés no autoritzat', {
      ruta: req.path,
      missatge: err.message
    });
    return res.status(401).json({
      codi: 'NO_AUTORITZAT',
      missatge: 'No tens permisos per accedir a aquest recurs'
    });
  }

  // Gestió d'errors de sol·licituds prohibides
  if (err.name === 'ForbiddenError') {
    logger.warn('Accés prohibit', {
      ruta: req.path,
      missatge: err.message
    });
    return res.status(403).json({
      codi: 'ACCES_PROHIBIT',
      missatge: 'No tens autorització per realitzar aquesta acció'
    });
  }

  // Gestió d'errors de recurs no trobat
  if (err.name === 'NotFoundError') {
    logger.warn('Recurs no trobat', {
      ruta: req.path,
      missatge: err.message
    });
    return res.status(404).json({
      codi: 'RECURS_NO_TROBAT',
      missatge: 'El recurs sol·licitat no existeix'
    });
  }

  // Gestió d'errors no controlats
  const esModeDesplegament = process.env.NODE_ENV === 'production';
  
  logger.error('Error no controlat', {
    nom: err.name,
    missatge: err.message,
    esProducció: esModeDesplegament
  });

  // Resposta diferent en producció i desenvolupament
  res.status(500).json({
    codi: 'ERROR_INTERN',
    missatge: esModeDesplegament 
      ? 'S\'ha produït un error intern del servidor' 
      : 'Error intern del servidor',
    detalls: !esModeDesplegament ? {
      nom: err.name,
      missatge: err.message,
      pila: err.stack
    } : undefined
  });
};

module.exports = gestorErrors;