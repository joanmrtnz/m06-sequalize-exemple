const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Youtuber = sequelize.define('Youtuber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom_canal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nom_youtuber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcio: {
        type: DataTypes.TEXT
    },
    url_canal: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'youtubers' // Opcional: per assegurar que la taula es diu 'youtubers'
});

module.exports = Youtuber;