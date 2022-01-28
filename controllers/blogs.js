/* eslint-disable no-unused-vars */
const { Op } = require('sequelize');
const { Blog, User } = require('../models');
const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		try {
			req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
		} catch {
			res.status(401).json({ error: 'token invalid' });
		}
	} else {
		res.status(401).json({ error: 'token missing' });
	}
	next();
};

blogsRouter.get('/', async (req, res) => {
	const where = {};

	if (req.query.search) {
		where.title = {
			[Op.substring]: req.query.search
		};
	}

	if (req.query.author) {
		where.author = {
			[Op.substring]: req.query.author
		};
	}

	try {
		const blogs = await Blog.findAll({
			order: [['likes', 'DESC']],
			attributes: { exclude: ['userId'] },
			include: {
				model: User,
				attributes: ['username']
			},
			where
		});
		res.json(blogs);
	} catch (error) {
		res.status(500).json({ error });
	}
});

blogsRouter.post('/', tokenExtractor, async (req, res) => {
	// express-async-errors takes care of try-catch
	const user = await User.findByPk(req.decodedToken.id);
	const blog = await Blog.create({ ...req.body, userId: user.id/*, date: new Date() */ });
	return res.json(blog);
});

const blogFinder = async (req, res, next) => {
	req.blog = await Blog.findByPk(req.params.id);
	next();
};

blogsRouter.get('/:id', blogFinder, async (req, res) => {
	if (req.blog) {
		res.json(req.blog);
	} else {
		res.status(404).end();
	}
});

blogsRouter.put('/:id', blogFinder, async (req, res) => {
	if (req.blog && req.decodedToken.id === req.blog.userId) {
		req.blog.likes = req.body.likes;
		await req.blog.save();
		res.json({ likes: req.blog.likes });
	} else {
		res.status(404).end();
	}
});

blogsRouter.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
	if (req.blog && req.decodedToken.id === req.blog.userId) {
		try {
			await req.blog.destroy();
		} catch (error) {
			res.status(400).json({ error });
		}
	}
	res.status(204).end();
});

module.exports = blogsRouter;