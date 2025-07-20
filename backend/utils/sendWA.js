const axios = require('axios');
require('dotenv').config();

module.exports = async function sendWA(phone, message) {
    try {
        const res = await axios.post(
            'https://sby.wablas.com/api/v2/send-message',{
                data: [
                    { phone, message }
                ]
            },
        {
            headers: {
                Authorization: process.env.WABLAS_API_KEY,
                'Content-Type': 'application/json',
                secret_key: process.env.WABLAS_SECRET_KEY
            }
        }
        );

        if (res.data.status) {
            console.log('WA berhasil dikirim ke', phone);
            return true;
        } else {
            console.log('Wablas response:', res.data);
            return false;
        }
    } catch (err) {
        console.error('Gagal kirim WA:', err.response?.data || err.message);
    return false;
  }
};
