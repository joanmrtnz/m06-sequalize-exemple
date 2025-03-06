const { Sequelize } = require('sequelize');
const { logger } = require('./logger');
const path = require('path');

// Construïm la ruta absoluta al fitxer SQLite
const dbPath = path.join(__dirname, process.env.DB_PATH);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: msg => logger.debug(msg),
    // Opcions addicionals de SQLite
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Logging de la configuració
logger.info('Configuració de base de dades carregada', {
    dialect: 'sqlite',
    path: dbPath,
    nodeEnv: process.env.NODE_ENV
});

module.exports = { sequelize };