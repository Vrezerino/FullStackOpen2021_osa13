require('dotenv').config();
const SECRET = '5yk50ry';

module.exports = {
	DATABASE_URL: process.env.DATABASE_URL,
	PORT: process.env.PORT || 3001,
	SECRET
};