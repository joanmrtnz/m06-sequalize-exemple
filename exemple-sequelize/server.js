/**
 * Configuració principal del servidor Express
 * Aquest fitxer inicialitza tots els components necessaris per l'API
 */

// Carregar variables d'entorn
const dotenv = require('dotenv');
dotenv.config();

// Importacions principals
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const { sequelize } = require('./src/config/database');
const gestorErrors = require('./src/middleware/gestorErrors');
const { logger, expressLogger } = require('./src/config/logger');

// Importació de les rutes
const rutesYoutuber = require('./src/routes/rutesYoutuber');
const rutesVideo = require('./src/routes/rutesVideo');
const rutesCategoria = require('./src/routes/rutesCategoria');

// Crear instància d'Express
const app = express();

/**
 * Configuració dels middlewares principals
 * - CORS per permetre peticions des d'altres dominis
 * - Parser de JSON per processar el cos de les peticions
 */
app.use(cors());
app.use(express.json());

// Configuració de Swagger per la documentació de l'API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * Middleware de logging personalitzat
 * Registra totes les peticions HTTP amb timestamp
 */
app.use((req, res, next) => {
    logger.info('Petició HTTP rebuda', {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Configuració del logger d'Express per més detalls
app.use(expressLogger);

// Configuració de les rutes de l'API
app.use('/api/youtubers', rutesYoutuber);
app.use('/api/videos', rutesVideo);
app.use('/api/categories', rutesCategoria);

// Gestió centralitzada d'errors (importada del mòdul gestorErrors)
app.use(gestorErrors);

// Port per defecte 3000 si no està definit a les variables d'entorn
const PORT = process.env.PORT || 3000;

/**
 * Funció d'inicialització del servidor
 * - Connecta amb la base de dades
 * - Sincronitza els models
 * - Inicia el servidor HTTP
 */
async function iniciarServidor() {
    try {
        // Verificar connexió amb la base de dades
        await sequelize.authenticate();
        logger.info('Base de dades connectada', {
            dialect: 'sqlite',
            storage: process.env.DB_PATH
        });
        
        // Sincronitzar models amb la base de dades
        await sequelize.sync({
            force: false,  // Valor per defecte, segur per producció
        });

        logger.info('Models sincronitzats', {
            force: false,
            timestamp: new Date().toISOString()
        });
        
        // Iniciar el servidor HTTP
        app.listen(PORT, () => {
            logger.info('Servidor iniciat correctament', {
                port: PORT,
                mode: process.env.NODE_ENV,
                docs: `http://127.0.0.1:${PORT}/api-docs`
            });
            logger.info('Rutes disponibles:', {
                youtubers: '/api/youtubers',
                videos: '/api/videos',
                categories: '/api/categories'
            });
        });
    } catch (error) {
        logger.error('Error fatal en iniciar el servidor', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
}

/**
 * Gestió d'errors no controlats
 * Registra l'error i tanca l'aplicació de forma segura
 */
process.on('unhandledRejection', (error) => {
    logger.error('Error no controlat detectat', {
        error: error.message,
        stack: error.stack,
        type: 'UnhandledRejection',
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});

// Gestió del senyal SIGTERM per tancament graciós
process.on('SIGTERM', () => {
    logger.info('Senyal SIGTERM rebut. Tancant el servidor...');
    process.exit(0);
});

// Iniciar el servidor
iniciarServidor();

// Exportar l'app per tests
module.exports = app;