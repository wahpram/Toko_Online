const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
    sequelize.define('Payment', {
        sale_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        midtrans_transaction_id: DataTypes.STRING,
        payment_type: DataTypes.STRING,
        transaction_time: DataTypes.STRING,
        transaction_status: DataTypes.STRING,
        fraud_status: DataTypes.STRING,
        gross_amount: DataTypes.STRING,
        raw_response: DataTypes.JSON
    }
);