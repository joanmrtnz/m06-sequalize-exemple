/**
 * rutesCategoria.js
 * Definició de les rutes relacionades amb les categories
 */

const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/CategoriaController');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obté totes les categories
 *     description: Retorna una llista amb totes les categories disponibles
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Llista de categories obtinguda amb èxit
 *       500:
 *         description: Error intern del servidor
 */
router.get('/', categoriaController.obtenirTotes);

module.exports = router;