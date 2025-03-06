const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
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
    },
    url_video: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_publicacio: {
        type: DataTypes.DATE
    },
    visualitzacions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'videos'
});

module.exports = Video;