const db = require('./models');

(async () => {
	try {
		await db.sequelize.authenticate();
		console.log('Connected to the database.');

		await db.sequelize.sync({ force: true });
		console.log('All tables created.');

		process.exit();
	} catch (err) {
		console.error('Error:', err);
		process.exit(1);
	}
})();