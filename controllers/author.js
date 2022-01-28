const Sequelize = require('sequelize');
const { Blog } = require('../models');
const authorsRouter = require('express').Router();

authorsRouter.get('/', async (req, res) => {
	try {
		const blogs = await Blog.findAll({
			group: 'author',
			attributes: [
				'author',
				[Sequelize.fn('COUNT', Sequelize.col('title')), 'articles'], // Count each author's blogs
				[Sequelize.fn('SUM', Sequelize.col('likes')), 'likes'] // Count each author's total likes
			],
			order: [[Sequelize.literal('likes'), 'DESC']] // Order authors by total likes
		})
		res.json(blogs);
	} catch (error) {
		res.json({ error });
	}
});

module.exports = authorsRouter;