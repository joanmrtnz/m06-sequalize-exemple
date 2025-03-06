const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcio: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'categories'
});

module.exports = Categoria;