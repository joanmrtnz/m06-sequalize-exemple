const express = require('express');
const router = express.Router();
const llistaReproduccioController = require('../controllers/LlistaReproduccioController');

// Obtenir totes les llistes
router.get('/', llistaReproduccioController.obtenirTotes);

// Obtenir una llista per ID
router.get('/:id', llistaReproduccioController.obtenirPerId);

// Crear una nova llista
router.post('/', llistaReproduccioController.crearLlista);

// Actualitzar una llista
router.put('/:id', llistaReproduccioController.actualitzarLlista);

// Eliminar una llista
router.delete('/:id', llistaReproduccioController.eliminarLlista);

// Afegir un vídeo a una llista de reproducció
router.post('/:id/afegir-video', llistaReproduccioController.afegirVideoALlista);

// Obtenir tots els vídeos d'una llista de reproducció
router.get('/:id/videos', llistaReproduccioController.obtenirVideosDeLlista);

module.exports = router;