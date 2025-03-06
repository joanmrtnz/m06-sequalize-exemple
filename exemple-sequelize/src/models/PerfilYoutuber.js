const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PerfilYoutuber = sequelize.define('PerfilYoutuber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url_twitter: {
        type: DataTypes.STRING
    },
    url_instagram: {
        type: DataTypes.STRING
    },
    url_web: {
        type: DataTypes.STRING
    },
    informacio_contacte: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'perfils_youtuber'
});

module.exports = PerfilYoutuber;