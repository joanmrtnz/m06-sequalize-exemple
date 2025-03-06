/**
 * rutesVideo.js
 * Definició de les rutes relacionades amb els vídeos
 */

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/VideoController');

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Obté tots els vídeos
 *     description: Retorna una llista amb tots els vídeos
 *     tags: [Vídeos]
 *     responses:
 *       200:
 *         description: Llista de vídeos obtinguda amb èxit
 *       500:
 *         description: Error intern del servidor
 */
router.get('/', videoController.obtenirTots);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Obté un vídeo per ID
 *     description: Retorna la informació detallada d'un vídeo específic
 *     tags: [Vídeos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del vídeo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo obtingut amb èxit
 *       404:
 *         description: Vídeo no trobat
 *       500:
 *         description: Error intern del servidor
 */
router.get('/:id', videoController.obtenirPerId);

/**
 * @swagger
 * /api/videos/{id}/categories:
 *   get:
 *     summary: Obté les categories d'un vídeo
 *     description: Retorna la llista de categories d'un vídeo específic
 *     tags: [Vídeos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del vídeo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categories obtingudes amb èxit
 *       404:
 *         description: Vídeo no trobat
 *       500:
 *         description: Error intern del servidor
 */
router.get('/:id/categories', videoController.obtenirCategories);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Crea un nou vídeo
 *     description: Crea un nou vídeo amb les dades proporcionades
 *     tags: [Vídeos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titol
 *               - url_video
 *               - youtuber_id
 *             properties:
 *               titol:
 *                 type: string
 *                 description: Títol del vídeo
 *               descripcio:
 *                 type: string
 *                 description: Descripció del vídeo
 *               url_video:
 *                 type: string
 *                 description: URL del vídeo a YouTube
 *               youtuber_id:
 *                 type: integer
 *                 description: ID del youtuber que ha pujat el vídeo
 *               data_publicacio:
 *                 type: string
 *                 format: date
 *                 description: Data de publicació del vídeo (format ISO)
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array amb els IDs de les categories del vídeo
 *     responses:
 *       201:
 *         description: Vídeo creat amb èxit
 *       400:
 *         description: Dades invàlides
 *       404:
 *         description: Youtuber o categoria no trobada
 *       500:
 *         description: Error intern del servidor
 */
router.post('/', videoController.crearVideo);

module.exports = router;