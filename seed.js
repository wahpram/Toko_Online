const db = require('./models');

(async () => {
	try {
		await db.sequelize.sync();

		await db.Item.destroy({ where: {} });
		await db.Category.destroy({ where: {} });

		const categories = await Promise.all([
		db.Category.create({ name: 'Makanan Ringan' }),
		db.Category.create({ name: 'Minuman' }),
		db.Category.create({ name: 'Buku' }),
		db.Category.create({ name: 'Pakaian' }),
		db.Category.create({ name: 'Aksesoris' }),
		]);

		const items = [
		{ name: 'Keripik Kentang', price: 15000, stock: 25, category_id: categories[0].id },
		{ name: 'Cokelat Kacang', price: 12000, stock: 30, category_id: categories[0].id },
		{ name: 'Kacang Pedas', price: 10000, stock: 40, category_id: categories[0].id },
		{ name: 'Snack Jagung', price: 13000, stock: 35, category_id: categories[0].id },
		{ name: 'Biskuit Keju', price: 14000, stock: 20, category_id: categories[0].id },

		{ name: 'Teh Botol', price: 8000, stock: 50, category_id: categories[1].id },
		{ name: 'Kopi Susu', price: 12000, stock: 45, category_id: categories[1].id },
		{ name: 'Air Mineral', price: 5000, stock: 100, category_id: categories[1].id },
		{ name: 'Susu Coklat', price: 10000, stock: 30, category_id: categories[1].id },
		{ name: 'Jus Jeruk', price: 15000, stock: 25, category_id: categories[1].id },

		{ name: 'Buku Belajar JS', price: 85000, stock: 10, category_id: categories[2].id },
		{ name: 'Buku Python Dasar', price: 90000, stock: 12, category_id: categories[2].id },
		{ name: 'Novel Remaja', price: 75000, stock: 8, category_id: categories[2].id },
		{ name: 'Komik Naruto', price: 35000, stock: 15, category_id: categories[2].id },
		{ name: 'Ensiklopedia Mini', price: 100000, stock: 5, category_id: categories[2].id },

		{ name: 'Kaos Polos', price: 50000, stock: 20, category_id: categories[3].id },
		{ name: 'Kemeja Lengan Panjang', price: 100000, stock: 10, category_id: categories[3].id },
		{ name: 'Celana Pendek', price: 75000, stock: 15, category_id: categories[3].id },
		{ name: 'Jaket Hoodie', price: 150000, stock: 7, category_id: categories[3].id },
		{ name: 'Rok Mini', price: 85000, stock: 9, category_id: categories[3].id },
		
		{ name: 'Jam Tangan', price: 250000, stock: 5, category_id: categories[4].id },
		{ name: 'Gelang Kulit', price: 40000, stock: 20, category_id: categories[4].id },
		{ name: 'Kalung Etnik', price: 60000, stock: 10, category_id: categories[4].id },
		{ name: 'Topi Trucker', price: 45000, stock: 12, category_id: categories[4].id },
		{ name: 'Kacamata Hitam', price: 70000, stock: 15, category_id: categories[4].id },
		];

		await db.Item.bulkCreate(items);

		console.log('Seed selesai: 5 kategori dan 25 item berhasil ditambahkan.');
		process.exit();
	} catch (err) {
		console.error('Gagal seed data:', err);
		process.exit(1);
	}
})();