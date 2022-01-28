const router = require('express').Router();
const bcrypt = require('bcrypt');

const { User, Blog } = require('../models');

router.get('/', async (req, res) => {

	const users = await User.findAll({
		include: {
			model: Blog,
			attributes: { exclude: ['userId'] }
		}
	});
	res.json(users);
});

router.post('/', async (req, res) => {
	try {
		console.log(req.body);
		const passwordHash = await bcrypt.hash(req.body.password, 10);
		const u = {
			username: req.body.username,
			name: req.body.name,
			passwordHash
		};
		const user = await User.create(u);
		res.json(user);
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.put('/:username', async (req, res) => {
	try {
		let user = await User.find({ username: req.params.username });
		user.username = req.body.username;
		user.save();
	} catch (error) {
		return res.status(400).json({ error });
	}
});

router.get('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (user) {
		res.json(user);
	} else {
		res.status(404).end();
	}
});

module.exports = router;