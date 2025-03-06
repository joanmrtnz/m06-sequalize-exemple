const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ListaReproduccion = sequelize.define('Video', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titol: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'listasReproduccion'
});

module.exports = ListaReproduccion;