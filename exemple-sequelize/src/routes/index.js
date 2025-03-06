/**
 * index.js
 * Punt d'entrada principal per a totes les rutes de l'API
 */

const express = require('express');
const router = express.Router();
const rutesYoutuber = require('./rutesYoutuber');
const rutesVideo = require('./rutesVideo');
const rutesCategoria = require('./rutesCategoria');

// Configuració de rutes
router.use('/youtubers', rutesYoutuber);
router.use('/videos', rutesVideo);
router.use('/categories', rutesCategoria);

module.exports = router;