/**
 * rutesYoutuber.js
 * Definició de les rutes relacionades amb els youtubers
 */

const express = require('express');
const router = express.Router();
const youtuberController = require('../controllers/YoutuberController');

/**
 * @swagger
 * /api/youtubers:
 *   get:
 *     summary: Obté tots els youtubers
 *     description: Retorna una llista amb tots els youtubers
 *     tags: [Youtubers]
 *     responses:
 *       200:
 *         description: Llista de youtubers obtinguda amb èxit
 *       500:
 *         description: Error intern del servidor
 */
router.get('/', youtuberController.obtenirTots);

/**
 * @swagger
 * /api/youtubers/{id}:
 *   get:
 *     summary: Obté un youtuber per ID
 *     description: Retorna la informació detallada d'un youtuber específic
 *     tags: [Youtubers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del youtuber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Youtuber obtingut amb èxit
 *       404:
 *         description: Youtuber no trobat
 *       500:
 *         description: Error intern del servidor
 */
router.get('/:id', youtuberController.obtenirPerId);

/**
 * @swagger
 * /api/youtubers/{id}/perfil:
 *   get:
 *     summary: Obté el perfil d'un youtuber
 *     description: Retorna la informació del perfil d'un youtuber específic
 *     tags: [Youtubers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del youtuber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil obtingut amb èxit
 *       404:
 *         description: Perfil no trobat
 *       500:
 *         description: Error intern del servidor
 */
router.get('/:id/perfil', youtuberController.obtenirPerfil);

/**
 * @swagger
 * /api/youtubers/{id}/videos:
 *   get:
 *     summary: Obté els vídeos d'un youtuber
 *     description: Retorna la llista de vídeos d'un youtuber específic
 *     tags: [Youtubers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del youtuber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeos obtinguts amb èxit
 *       404:
 *         description: Youtuber no trobat
 *       500:
 *         description: Error intern del servidor
 */
router.get('/:id/videos', youtuberController.obtenirVideos);

module.exports = router;