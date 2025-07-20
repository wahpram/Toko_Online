const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
    sequelize.define('SaleDetail', {
        sale_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        qty: DataTypes.INTEGER,
        price: DataTypes.INTEGER,
        subtotal: DataTypes.INTEGER,
    }
);