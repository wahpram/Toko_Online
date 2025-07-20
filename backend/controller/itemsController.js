const { Item, SaleDetail } = require('../models');
const { Sequelize } = require('sequelize');

exports.getBestSellers = async (req, res) => {
  try {
    const bestSellers = await SaleDetail.findAll({
      attributes: [
        'item_id',
        [Sequelize.fn('SUM', Sequelize.col('qty')), 'total_sold']
      ],
      include: [{
        model: Item,
        attributes: ['id', 'name', 'price', 'image']
      }],
      group: ['item_id', 'Item.id'],
      order: [[Sequelize.literal('total_sold'), 'DESC']],
      limit: 3
    });

    const result = bestSellers.map(s => ({
      id: s.Item.id,
      name: s.Item.name,
      price: s.Item.price,
      image: s.Item.image || '/frontend/assets/default-product.jpg'
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil produk terlaris' });
  }
};
