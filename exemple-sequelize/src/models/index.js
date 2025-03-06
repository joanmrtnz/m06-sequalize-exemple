/**
 * index.js de models
 * Configuració de les relacions entre els models
 */

const Youtuber = require('./Youtuber');
const PerfilYoutuber = require('./PerfilYoutuber');
const Video = require('./Video');
const Categoria = require('./Categoria');
const LlistaReproduccio = require('./LlistaReproduccio');

// Relació 1:1 entre Youtuber i PerfilYoutuber
Youtuber.hasOne(PerfilYoutuber, { foreignKey: 'youtuber_id' });
PerfilYoutuber.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació 1:N entre Youtuber i Video
Youtuber.hasMany(Video, { foreignKey: 'youtuber_id' });
Video.belongsTo(Youtuber, { foreignKey: 'youtuber_id' });

// Relació N:M entre Video i Categoria
Video.belongsToMany(Categoria, { through: 'videos_categories', foreignKey: 'video_id' });
Categoria.belongsToMany(Video, { through: 'videos_categories', foreignKey: 'categoria_id' });

// Relació N:M entre Video i LlistaReproduccio
Video.belongsToMany(LlistaReproduccio, { through: 'videos_llistes_reproduccio', foreignKey: 'video_id' });
LlistaReproduccio.belongsToMany(Video, { through: 'videos_llistes_reproduccio', foreign_key: 'llista_reproduccio_id' });

module.exports = {
  Youtuber,
  PerfilYoutuber,
  Video,
  Categoria,
  LlistaReproduccio
};