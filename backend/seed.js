const db = require('./models');

(async () => {
  try {
    await db.sequelize.sync();

    await db.Item.destroy({ where: {} });
    await db.Category.destroy({ where: {} });

    const categories = await Promise.all([
      db.Category.create({ name: 'Kaos & T-Shirt' }),
      db.Category.create({ name: 'Jaket & Hoodie' }),
      db.Category.create({ name: 'Aksesoris Fashion' }),
      db.Category.create({ name: 'Sepatu & Sandal' }),
      db.Category.create({ name: 'Tas & Dompet' }),
    ]);

    const imagePath = '/uploads/962669.png'; // semua pakai gambar sama

    const items = [
      // Kaos & T-Shirt
      { name: 'Kaos Polos Hitam', price: 85000, stock: 20, category_id: categories[0].id, image: imagePath },
      { name: 'Kaos Oversize', price: 120000, stock: 15, category_id: categories[0].id, image: imagePath },
      { name: 'Kaos Graphic Streetwear', price: 135000, stock: 10, category_id: categories[0].id, image: imagePath },
      { name: 'Kaos Lengan Panjang', price: 100000, stock: 12, category_id: categories[0].id, image: imagePath },
      { name: 'Kaos Raglan', price: 95000, stock: 18, category_id: categories[0].id, image: imagePath },

      // Jaket & Hoodie
      { name: 'Hoodie Oversize', price: 250000, stock: 8, category_id: categories[1].id, image: imagePath },
      { name: 'Jaket Varsity', price: 300000, stock: 6, category_id: categories[1].id, image: imagePath },
      { name: 'Jaket Denim', price: 280000, stock: 5, category_id: categories[1].id, image: imagePath },
      { name: 'Sweater Rajut', price: 220000, stock: 7, category_id: categories[1].id, image: imagePath },
      { name: 'Jaket Bomber', price: 270000, stock: 6, category_id: categories[1].id, image: imagePath },

      // Aksesoris Fashion
      { name: 'Jam Tangan Kulit', price: 450000, stock: 5, category_id: categories[2].id, image: imagePath },
      { name: 'Gelang Tali', price: 75000, stock: 25, category_id: categories[2].id, image: imagePath },
      { name: 'Cincin Stainless', price: 120000, stock: 12, category_id: categories[2].id, image: imagePath },
      { name: 'Topi Baseball', price: 90000, stock: 20, category_id: categories[2].id, image: imagePath },
      { name: 'Kacamata Stylish', price: 160000, stock: 10, category_id: categories[2].id, image: imagePath },

      // Sepatu & Sandal
      { name: 'Sneakers Putih', price: 350000, stock: 10, category_id: categories[3].id, image: imagePath },
      { name: 'Slip On Canvas', price: 200000, stock: 15, category_id: categories[3].id, image: imagePath },
      { name: 'Sandal Jepit Premium', price: 80000, stock: 25, category_id: categories[3].id, image: imagePath },
      { name: 'Boots Casual', price: 500000, stock: 5, category_id: categories[3].id, image: imagePath },
      { name: 'Loafers Kulit', price: 450000, stock: 8, category_id: categories[3].id, image: imagePath },

      // Tas & Dompet
      { name: 'Backpack Canvas', price: 300000, stock: 10, category_id: categories[4].id, image: imagePath },
      { name: 'Sling Bag', price: 220000, stock: 12, category_id: categories[4].id, image: imagePath },
      { name: 'Dompet Kulit Pria', price: 180000, stock: 15, category_id: categories[4].id, image: imagePath },
      { name: 'Tote Bag', price: 150000, stock: 20, category_id: categories[4].id, image: imagePath },
      { name: 'Mini Backpack', price: 280000, stock: 7, category_id: categories[4].id, image: imagePath },
    ];

    await db.Item.bulkCreate(items);

    console.log('Seed selesai: 5 kategori (fashion & aksesoris) dengan 25 produk berhasil ditambahkan.');
    process.exit();
  } catch (err) {
    console.error('Gagal seed data:', err);
    process.exit(1);
  }
})();
