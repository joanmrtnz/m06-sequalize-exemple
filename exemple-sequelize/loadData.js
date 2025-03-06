/**
 * Script per carregar dades CSV a la base de dades
 * 
 * Aquest script llegeix els arxius CSV i carrega les dades a la base de dades utilitzant Sequelize
 * Executa amb: node loadData.js
 */

require('dotenv').config();
console.log("Ruta BD:", process.env.DB_PATH); // Per verificar que s'ha carregat

const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');
const { sequelize } = require('./src/config/database');
const { logger } = require('./src/config/logger');

// Importar models
const Youtuber = require('./src/models/Youtuber');
const PerfilYoutuber = require('./src/models/PerfilYoutuber');
const Video = require('./src/models/Video');
const Categoria = require('./src/models/Categoria');
const { DataTypes } = require('sequelize');
const { ListaReproduccion } = require('./src/models');

// Definir el model VideosCategories que servirà com a taula d'unió
const VideosCategories = sequelize.define('VideosCategories', {
  video_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Video,
      key: 'id'
    }
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Categoria,
      key: 'id'
    }
  }
}, {
  tableName: 'videos_categories',
  timestamps: false
});

// Definir el model VideosListaReproduccion que servirà com a taula d'unió *****
const VideosListaReproduccion = sequelize.define('VideosListasReproduccion', {
  video_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Video,
      key: 'id'
    }
  },
  listareproduccion_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: ListaReproduccion,
      key: 'id'
    }
  }
}, {
  tableName: 'videos_listareproduccion',
  timestamps: false
});


// Configurar relacions
Youtuber.hasOne(PerfilYoutuber, { foreignKey: 'youtuber_id' });
PerfilYoutuber.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

Youtuber.hasMany(Video, { foreignKey: 'youtuber_id' });
Video.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

Video.belongsToMany(Categoria, { through: VideosCategories, foreignKey: 'video_id' });
Categoria.belongsToMany(Video, { through: VideosCategories, foreignKey: 'categoria_id' });

// ******
Video.belongsToMany(ListaReproduccion, { through: VideosListaReproduccion, foreignKey: 'video_id' });
ListaReproduccion.belongsToMany(Video, { through: VideosListaReproduccion, foreignKey: 'listareproduccion_id' });

// Rutes als arxius CSV
const BASE_PATH = path.join(__dirname, process.env.DATA_DIR_PATH, 'youtubers_programacio');
const CSV_FILES = {
  YOUTUBERS: path.join(BASE_PATH, 'youtubers.csv'),
  PERFILS: path.join(BASE_PATH, 'youtuber_profiles.csv'),
  CATEGORIES: path.join(BASE_PATH, 'categories.csv'),
  LISTAS_REPRODUCCION: path.join(BASE_PATH, 'listas_reproduccion.csv'),
  VIDEOS: path.join(BASE_PATH, 'videos.csv'),
  VIDEOS_CATEGORIES: path.join(BASE_PATH, 'video_categories.csv'),
  VIDEOS_LISTAS: path.join(BASE_PATH, 'video_listas.csv')
};

/**
 * Llegeix i parseja un arxiu CSV
 * @param {string} ruta_fitxer Ruta al fitxer CSV
 * @returns {Promise<Array>} Array amb les dades parseades
 */
async function llegirFitxerCsv(ruta_fitxer) {
  try {
    const contingut_fitxer = await fs.readFile(ruta_fitxer, 'utf8');
    return new Promise((resol, rebutja) => {
      Papa.parse(contingut_fitxer, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(resultats) {
          if (resultats.errors.length > 0) {
            logger.warn(`Avisos en parsejar ${ruta_fitxer}:`, resultats.errors);
          }
          resol(resultats.data);
        },
        error: function(error) {
          rebutja(error);
        }
      });
    });
  } catch (error) {
    logger.error(`Error llegint ${ruta_fitxer}:`, error);
    throw error;
  }
}

/**
 * Carrega les dades dels Youtubers
 * @param {Array} youtubers Dades de youtubers
 */
async function carregarYoutubers(youtubers) {
  try {
    logger.info(`Carregant ${youtubers.length} youtubers...`);
    
    for (const youtuber of youtubers) {
      await Youtuber.create({
        id: youtuber.id,
        nom_canal: youtuber.channel_name,
        nom_youtuber: youtuber.youtuber_name,
        descripcio: youtuber.description,
        url_canal: youtuber.channel_url
      });
    }
    
    logger.info("Youtubers carregats correctament");
  } catch (error) {
    logger.error("Error carregant youtubers:", error);
    throw error;
  }
}

/**
 * Carrega els perfils dels Youtubers
 * @param {Array} perfils Dades de perfils
 */
async function carregarPerfils(perfils) {
  try {
    logger.info(`Carregant ${perfils.length} perfils...`);
    
    for (const perfil of perfils) {
      await PerfilYoutuber.create({
        id: perfil.id,
        youtuber_id: perfil.youtuber_id,
        url_twitter: perfil.twitter_url,
        url_instagram: perfil.instagram_url,
        url_web: perfil.website_url,
        informacio_contacte: perfil.contact_info
      });
    }
    
    logger.info("Perfils carregats correctament");
  } catch (error) {
    logger.error("Error carregant perfils:", error);
    throw error;
  }
}

/**
 * Carrega les categories
 * @param {Array} categories Dades de categories
 */
async function carregarCategories(categories) {
  try {
    logger.info(`Carregant ${categories.length} categories...`);
    
    for (const categoria of categories) {
      await Categoria.create({
        id: categoria.id,
        titol: categoria.name,
        descripcio: categoria.description
      });
    }
    
    logger.info("Categories carregades correctament");
  } catch (error) {
    logger.error("Error carregant categories:", error);
    throw error;
  }
}

/**
 * Carrega els vídeos
 * @param {Array} videos Dades de vídeos
 */
async function carregarVideos(videos) {
  try {
    logger.info(`Carregant ${videos.length} vídeos...`);
    
    for (const video of videos) {
      await Video.create({
        id: video.id,
        youtuber_id: video.youtuber_id,
        titol: video.title,
        descripcio: video.description,
        url_video: video.video_url,
        data_publicacio: video.publication_date,
        visualitzacions: video.views,
        likes: video.likes
      });
    }
    
    logger.info("Vídeos carregats correctament");
  } catch (error) {
    logger.error("Error carregant vídeos:", error);
    throw error;
  }
}

/**
 * Carrega les relacions entre vídeos i categories
 * @param {Array} videos_categories Dades de relacions
 */
async function carregarVideosCategories(videos_categories) {
  try {
    logger.info(`Carregant ${videos_categories.length} relacions de vídeo-categoria...`);
    
    for (const relacio of videos_categories) {
      await VideosCategories.create({
        video_id: relacio.video_id,
        categoria_id: relacio.category_id
      });
    }
    
    logger.info("Relacions vídeo-categoria carregades correctament");
  } catch (error) {
    logger.error("Error carregant relacions vídeo-categoria:", error);
    throw error;
  }
}


// ***********************

/**
 * Carrega els vídeos
 * @param {Array} videos Dades de vídeos
 */
async function carregarListasReproduccion(listas) {
  try {
    logger.info(`Carregant ${listas.length} llistes de reporducció...`);
    
    for (const lista of listas) {
      await ListaReproduccion.create({
        id: lista.id,
        titol: lista.name
      });
    }
    
    logger.info("Llistes de reproducció carregats correctament");
  } catch (error) {
    logger.error("Error carregant les llistes de reporducció:", error);
    throw error;
  }
}

/**
 * Carrega les relacions entre vídeos i categories
 * @param {Array} videos_categories Dades de relacions
 */
async function carregarVideosLlistesReproduccio(videos_listareproduccion) {
  try {
    logger.info(`Carregant ${videos_listareproduccion.length} relacions de vídeo-listareproduccion...`);
    
    for (const relacio of videos_listareproduccion) {
      await VideosListaReproduccion.create({
        video_id: relacio.video_id,
        listareproduccion_id: relacio.listareproduccion_id
      });
    }
    
    logger.info("Relacions vídeo-listareproduccion carregades correctament");
  } catch (error) {
    logger.error("Error carregant relacions vídeo-listareproduccion:", error);
    throw error;
  }
}


// ***********************

/**
 * Funció principal que coordina tot el procés de càrrega
 */
async function carregarTotesDades() {
  try {
    logger.info("Iniciant càrrega de dades...");
    
    // Sincronitzar models amb la base de dades
    await sequelize.authenticate();
    logger.info("Connexió a la base de dades establerta");
    
    await sequelize.sync({ force: true });
    logger.info("Taules creades a la base de dades");
    
    // Llegir dades dels arxius CSV
    const youtubers = await llegirFitxerCsv(CSV_FILES.YOUTUBERS);
    const perfils = await llegirFitxerCsv(CSV_FILES.PERFILS);
    const categories = await llegirFitxerCsv(CSV_FILES.CATEGORIES);
    console.log("PATH:", CSV_FILES)
    const videos = await llegirFitxerCsv(CSV_FILES.VIDEOS);
    const videos_categories = await llegirFitxerCsv(CSV_FILES.VIDEOS_CATEGORIES);
    const listas_reproduccion = await llegirFitxerCsv(CSV_FILES.LISTAS_REPRODUCCION);
    const videos_listareproduccion = await llegirFitxerCsv(CSV_FILES.VIDEOS_LISTAS); // ****

    
    // Carregar les dades en ordre per respectar dependències ****
    await carregarYoutubers(youtubers);
    await carregarPerfils(perfils);
    await carregarCategories(categories);
  
    await carregarVideos(videos);
    await carregarVideosCategories(videos_categories);
    await carregarListasReproduccion(listas_reproduccion);
    await carregarVideosLlistesReproduccio(videos_listareproduccion);

    
    logger.info("Totes les dades han estat carregades correctament a la base de dades!");
    
  } catch (error) {
    logger.error("Error durant el procés de càrrega:", error);
  } finally {
    // Tancar connexió a la base de dades quan acabem
    // await sequelize.close();
    // logger.info("Connexió a la base de dades tancada");
  }
}

// Executar el procés de càrrega
carregarTotesDades()
  .then(() => {
    console.log("Procés de càrrega complet");
  })
  .catch(error => {
    console.error("Error en el procés principal:", error);
    process.exit(1);
  });