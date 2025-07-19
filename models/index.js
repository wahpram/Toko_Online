const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

const db = {};

fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'))
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize);
        db[model.name] = model;
    }
);

const { Category, Item, Sale, SaleDetail, Payment, Notification, User, Cart } = db;

User.hasMany(Sale, { foreignKey: 'user_id' });
Sale.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Item, { foreignKey: 'category_id' });
Item.belongsTo(Category, { foreignKey: 'category_id' });

Sale.hasMany(SaleDetail, { foreignKey: 'sale_id' });
SaleDetail.belongsTo(Sale, { foreignKey: 'sale_id' });

Item.hasMany(SaleDetail, { foreignKey: 'item_id' });
SaleDetail.belongsTo(Item, { foreignKey: 'item_id' });

Sale.hasOne(Payment, { foreignKey: 'sale_id' });
Payment.belongsTo(Sale, { foreignKey: 'sale_id' });

Sale.hasMany(Notification, { foreignKey: 'sale_id' });
Notification.belongsTo(Sale, { foreignKey: 'sale_id' });

User.hasMany(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

Item.hasMany(Cart, { foreignKey: 'item_id' });
Cart.belongsTo(Item, { foreignKey: 'item_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;