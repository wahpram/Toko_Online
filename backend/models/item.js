const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
    sequelize.define('Item', {
        name: DataTypes.STRING,
        price: DataTypes.INTEGER,
        stock: DataTypes.INTEGER,
        category_id: DataTypes.INTEGER,
        image: DataTypes.STRING
    }
);