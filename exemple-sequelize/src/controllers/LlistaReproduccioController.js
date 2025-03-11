const { LlistaReproduccio, Video } = require('../models');
const { logger } = require('../config/logger');

/**
 * Obté totes les llistes de reproducció
 */
const obtenirTotes = async (req, res, next) => {
  try {
    logger.info('Petició per obtenir totes les llistes de reproducció');
    const llistes = await LlistaReproduccio.findAll();
    res.status(200).json({ ok: true, resultat: llistes });
  } catch (error) {
    logger.error('Error obtenint llistes:', error);
    next(error);
  }
};

/**
 * Obté una llista per ID
 */
const obtenirPerId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const llista = await LlistaReproduccio.findByPk(id, { include: Video });
    if (!llista) return res.status(404).json({ ok: false, missatge: 'Llista no trobada' });
    res.status(200).json({ ok: true, resultat: llista });
  } catch (error) {
    logger.error('Error obtenint llista:', error);
    next(error);
  }
};

/**
 * Crea una nova llista
 */
const crearLlista = async (req, res, next) => {
  try {
    const { titol } = req.body;
    const llista = await LlistaReproduccio.create({ titol });
    res.status(201).json({ ok: true, resultat: llista });
  } catch (error) {
    logger.error('Error creant la llista:', error);
    next(error);
  }
};

/**
 * Actualitza una llista
 */
const actualitzarLlista = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titol } = req.body;
    const llista = await LlistaReproduccio.findByPk(id);
    if (!llista) return res.status(404).json({ ok: false, missatge: 'Llista no trobada' });
    await llista.update({ titol });
    res.status(200).json({ ok: true, resultat: llista });
  } catch (error) {
    logger.error('Error actualitzant la llista:', error);
    next(error);
  }
};

/**
 * Elimina una llista
 */
const eliminarLlista = async (req, res, next) => {
  try {
    const { id } = req.params;
    const llista = await LlistaReproduccio.findByPk(id);
    if (!llista) return res.status(404).json({ ok: false, missatge: 'Llista no trobada' });
    await llista.destroy();
    res.status(200).json({ ok: true, missatge: 'Llista eliminada' });
  } catch (error) {
    logger.error('Error eliminant la llista:', error);
    next(error);
  }
};

/**
 * Afegir un vídeo a una llista de reproducció
 */
const afegirVideoALlista = async (req, res) => {
  try {
      const { id } = req.params; // ID de la llista de reproducció
      const { video_id } = req.body; // ID del vídeo a afegir

      const llista = await LlistaReproduccio.findByPk(id, { include: Video });
      if (!llista) {
          return res.status(404).json({ missatge: "Llista de reproducció no trobada" });
      }

      const video = await Video.findByPk(video_id);
      if (!video) {
          return res.status(404).json({ missatge: "Vídeo no trobat" });
      }

      // // Comprovar si el vídeo ja està a la llista
      // const videos = await llista.getVideos({ where: { id: video_id } });
      // if (videos.length > 0) {
      //     return res.status(409).json({ missatge: "El vídeo ja està a la llista" });
      // }

      console.log('afegirVideoALlista', video);

      // Afegir el vídeo a la llista
      await llista.addVideo(video);
      res.status(201).json({ missatge: "Vídeo afegit correctament a la llista" });

  } catch (error) {
      console.error(error);
      res.status(500).json({ missatge: "Error en afegir vídeo a la llista", error });
  }
};


/**
 * Obtenir tots els vídeos d'una llista de reproducció
 */
const obtenirVideosDeLlista = async (req, res, next) => {
  try {
    const { id } = req.params; // ID de la llista
    const llista = await LlistaReproduccio.findByPk(id, { include: Video });

    if (!llista) {
      return res.status(404).json({ ok: false, missatge: 'Llista no trobada' });
    }

    res.status(200).json({ ok: true, resultat: llista.Videos });
  } catch (error) {
    logger.error('Error obtenint vídeos de la llista:', error);
    next(error);
  }
};

module.exports = {
  obtenirTotes,
  obtenirPerId,
  crearLlista,
  actualitzarLlista,
  eliminarLlista,
  afegirVideoALlista,
  obtenirVideosDeLlista
};