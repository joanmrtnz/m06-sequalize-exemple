const path = require('path');
const fs = require('fs').promises;
const Papa = require('papaparse');
const _ = require('lodash');

/**
 * Rutes base del projecte
 * Nota: __dirname és src/utils, necessitem pujar tres nivells per arribar a l'arrel del projecte
 */
const PROJECT_PATHS = {
    DATA_DIR: path.join(__dirname, '..', '..', '..', 'data', 'youtubers_programacio'),
    OUTPUT_DIR: path.join(__dirname, '..', '..', '..', 'data', 'logs')
};

/**
 * Noms dels arxius CSV
 */
const CSV_FILES = {
    YOUTUBERS: 'youtubers.csv',
    PROFILES: 'youtuber_profiles.csv',
    CATEGORIES: 'categories.csv',
    VIDEOS: 'videos.csv',
    VIDEO_CATEGORIES: 'video_categories.csv'
};

/**
 * Estructura esperada de les taules
 * Defineix les columnes que ha de tenir cada arxiu CSV
 */
const TABLE_STRUCTURE = {
    youtubers: ['id', 'channel_name', 'youtuber_name', 'description', 'channel_url'],
    profiles: ['id', 'youtuber_id', 'twitter_url', 'instagram_url', 'website_url', 'contact_info'],
    categories: ['id', 'name', 'description'],
    videos: ['id', 'youtuber_id', 'title', 'description', 'video_url', 'publication_date', 'views', 'likes'],
    video_categories: ['video_id', 'category_id']
};

/**
 * Llegeix tots els arxius CSV
 * @returns {Promise<Object>} Objecte amb les dades de tots els CSV
 */
async function readAllCSVFiles() {
    const datasets = {};
    
    for (const [key, filename] of Object.entries(CSV_FILES)) {
        const filePath = path.join(PROJECT_PATHS.DATA_DIR, filename);
        
        try {
            // Verificar si l'arxiu existeix
            await fs.access(filePath);
            console.log(`Llegint arxiu: ${filePath}`);
            
            const fileContent = await fs.readFile(filePath, 'utf8');
            
            // Parsing amb gestió d'errors
            const parseResult = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                error: (error) => {
                    console.error(`Error parsejant ${filename}:`, error);
                },
                complete: (results, file) => {
                    if (results.errors.length > 0) {
                        console.warn(`Advertències al parsejar ${filename}:`, results.errors);
                    }
                }
            });

            // Verificar que el parsing ha estat exitós
            if (!parseResult || !parseResult.data || !parseResult.meta) {
                throw new Error(`Error parsejant ${filename}: Resultat invàlid`);
            }

            // Emmagatzemar resultat
            const tableName = key.toLowerCase();
            datasets[tableName] = parseResult;
            
            // Log d'informació
            console.log(`${filename} llegit correctament:`, {
                files: parseResult.data.length,
                columnes: parseResult.meta.fields?.length || 0
            });

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`Arxiu no trobat: ${filePath}`);
                console.error('Directori actual:', __dirname);
                console.error('Ruta completa cercada:', path.resolve(filePath));
            } else {
                console.error(`Error processant ${filename}:`, error);
            }
            throw error;
        }
    }
    
    return datasets;
}

/**
 * Valida l'estructura de les taules
 * @param {Object} datasets Les dades de tots els CSV
 * @returns {Object} Resultat de la validació d'estructura
 */
function validateStructure(datasets) {
    const results = {};
    
    for (const [name, dataset] of Object.entries(datasets)) {
        // Convertir el nom a minúscules per la comparació
        const tableName = name.toLowerCase();
        
        // Verificar que la taula existeix en l'estructura esperada
        if (!TABLE_STRUCTURE[tableName]) {
            console.warn(`Advertència: No s'ha trobat estructura definida per la taula ${name}`);
            continue;
        }

        // Verificar que el dataset té els camps meta i fields
        if (!dataset || !dataset.meta || !dataset.meta.fields) {
            console.error(`Error: Dades invàlides per la taula ${name}`);
            results[name] = {
                columnsMatch: false,
                missingColumns: TABLE_STRUCTURE[tableName],
                extraColumns: [],
                rowCount: dataset?.data?.length || 0,
                error: 'Estructura de dades invàlida'
            };
            continue;
        }

        const expectedColumns = TABLE_STRUCTURE[tableName];
        const actualColumns = dataset.meta.fields;

        try {
            results[name] = {
                columnsMatch: _.isEqual(
                    expectedColumns.map(c => c.toLowerCase()).sort(),
                    actualColumns.map(c => c.toLowerCase()).sort()
                ),
                missingColumns: _.difference(
                    expectedColumns.map(c => c.toLowerCase()),
                    actualColumns.map(c => c.toLowerCase())
                ),
                extraColumns: _.difference(
                    actualColumns.map(c => c.toLowerCase()),
                    expectedColumns.map(c => c.toLowerCase())
                ),
                rowCount: dataset.data.length
            };
        } catch (error) {
            console.error(`Error validant estructura de ${name}:`, error);
            results[name] = {
                columnsMatch: false,
                missingColumns: [],
                extraColumns: [],
                rowCount: 0,
                error: error.message
            };
        }
    }
    
    return results;
}

/**
 * Valida la integritat referencial entre taules
 * @param {Object} datasets Les dades de tots els CSV
 * @returns {Object} Resultat de la validació referencial
 */
function validateReferentialIntegrity(datasets) {
    const { youtubers, videos, categories, video_categories, profiles } = datasets;
    
    // Sets per validació ràpida
    const youtuberIds = new Set(youtubers.data.map(y => y.id));
    const videoIds = new Set(videos.data.map(v => v.id));
    const categoryIds = new Set(categories.data.map(c => c.id));
    
    return {
        invalidProfiles: profiles.data.filter(p => !youtuberIds.has(p.youtuber_id)),
        invalidVideos: videos.data.filter(v => !youtuberIds.has(v.youtuber_id)),
        invalidVideoCategories: video_categories.data.filter(vc => 
            !videoIds.has(vc.video_id) || !categoryIds.has(vc.category_id)
        )
    };
}

/**
 * Verifica duplicats en les dades
 * @param {Object} datasets Les dades de tots els CSV
 * @returns {Object} Resultat de la verificació de duplicats
 */
function checkDuplicates(datasets) {
    const { youtubers, video_categories } = datasets;
    
    return {
        duplicateChannels: _(youtubers.data)
            .groupBy('channel_name')
            .pickBy(x => x.length > 1)
            .value(),
        duplicateVideoCategories: _(video_categories.data)
            .groupBy(vc => `${vc.video_id}-${vc.category_id}`)
            .pickBy(x => x.length > 1)
            .value()
    };
}

/**
 * Verifica dades que falten
 * @param {Object} datasets Les dades de tots els CSV
 * @returns {Object} Resultat de la verificació de dades faltants
 */
function checkMissingData(datasets) {
    const { youtubers, profiles, videos, video_categories } = datasets;
    
    return {
        youtubersWithoutProfile: youtubers.data.filter(y =>
            !profiles.data.some(p => p.youtuber_id === y.id)
        ),
        videosWithoutCategories: videos.data.filter(v =>
            !video_categories.data.some(vc => vc.video_id === v.id)
        )
    };
}

/**
 * Valida els valors dels camps
 * @param {Object} datasets Les dades de tots els CSV
 * @returns {Object} Resultat de la validació de valors
 */
function validateValues(datasets) {
    const { videos } = datasets;
    const currentDate = new Date();
    
    return {
        videosWithFutureDates: videos.data.filter(v => 
            new Date(v.fecha_publicacion) > currentDate
        ),
        videosWithInvalidMetrics: videos.data.filter(v =>
            v.vistas < 0 || v.likes < 0 || v.likes > v.vistas
        )
    };
}

/**
 * Genera informe de validació
 * @param {Object} results Resultats de totes les validacions
 * @returns {Object} Informe complet de validació
 */
function generateValidationReport(results) {
    return {
        timestamp: new Date().toISOString(),
        results: results,
        summary: {
            structureValid: Object.values(results.structure)
                .every(r => r.columnsMatch),
            referentialIntegrityValid: Object.values(results.referential)
                .every(v => v.length === 0),
            hasDuplicates: Object.values(results.duplicates)
                .some(d => Object.keys(d).length > 0),
            hasMissingData: Object.values(results.missing)
                .some(m => m.length > 0)
        }
    };
}

/**
 * Guarda l'informe de validació
 * @param {Object} report Informe a guardar
 */
async function saveValidationReport(report) {
    const reportPath = path.join(PROJECT_PATHS.OUTPUT_DIR, 
        `validation_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    
    await fs.mkdir(PROJECT_PATHS.OUTPUT_DIR, { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`Informe guardat a: ${reportPath}`);
}

/**
 * Verifica les rutes del sistema
 */
async function verifyPaths() {
    console.log('Verificant rutes:');
    console.log('Directori actual:', __dirname);
    console.log('DATA_DIR:', path.resolve(PROJECT_PATHS.DATA_DIR));
    console.log('OUTPUT_DIR:', path.resolve(PROJECT_PATHS.OUTPUT_DIR));
    
    try {
        const dataExists = await fs.access(PROJECT_PATHS.DATA_DIR)
            .then(() => true)
            .catch(() => false);
        console.log('DATA_DIR existeix:', dataExists);
        
        if (dataExists) {
            const files = await fs.readdir(PROJECT_PATHS.DATA_DIR);
            console.log('Arxius trobats:', files);
        }
        
        await fs.mkdir(PROJECT_PATHS.OUTPUT_DIR, { recursive: true });
        
    } catch (error) {
        console.error('Error verificant rutes:', error);
    }
}

/**
 * Funció principal de validació
 * @returns {Promise<Object>} Informe complet de validació
 */
async function validateYoutuberData() {
    try {
        const datasets = await readAllCSVFiles();
        
        const validationResults = {
            structure: validateStructure(datasets),
            referential: validateReferentialIntegrity(datasets),
            duplicates: checkDuplicates(datasets),
            missing: checkMissingData(datasets),
            values: validateValues(datasets)
        };

        const report = generateValidationReport(validationResults);
        await saveValidationReport(report);

        return report;
    } catch (error) {
        console.error('Error en la validació:', error);
        throw error;
    }
}

module.exports = {
    validateYoutuberData,
    verifyPaths
};