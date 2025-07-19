const express = require('express');
const db = require('./models');
const app = express();
const itemRoutes = require('./routes/itemRoutes');
const saleRoutes = require('./routes/saleRoutes');
const callbackRoutes = require('./routes/callbackRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Toko Online Kita aktif!');
});

app.use('/midtrans/callback', callbackRoutes);
app.use('/sales', saleRoutes);
app.use('/items', itemRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/items', itemRoutes);
app.use('/admin', adminRoutes);
const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
  	.then(() => {
    	console.log('Database connected.');
		app.listen(PORT, () => {
			console.log(`Server berjalan di http://localhost:${PORT}`);
		});
  	})
  	.catch((err) => {
    	console.error('Database gagal terkoneksi:', err);
  	});