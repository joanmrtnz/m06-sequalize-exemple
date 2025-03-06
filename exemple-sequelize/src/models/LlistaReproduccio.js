const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LlistaReproduccio = sequelize.define('LlistaReproduccio', {
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
    tableName: 'llistes_reproduccio'
});

module.exports = LlistaReproduccio;