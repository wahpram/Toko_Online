const express = require('express');
const db = require('./models');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Replace with your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const itemRoutes = require('./routes/itemRoutes');
const saleRoutes = require('./routes/saleRoutes');
const callbackRoutes = require('./routes/callbackRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API Toko Online Kita aktif!');
});

app.use('/midtrans/callback', callbackRoutes);
app.use('/sales', saleRoutes);
app.use('/items', itemRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/categories', categoryRoutes);
app.use('/user', userRoutes);

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