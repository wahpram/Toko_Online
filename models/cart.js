const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
    sequelize.define('Cart', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        qty: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    });