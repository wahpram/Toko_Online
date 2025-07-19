const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
    sequelize.define('Notification', {
        sale_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        target: DataTypes.STRING, 
        message: DataTypes.TEXT,
        status: DataTypes.STRING,
        sent_at: DataTypes.DATE
    }
);