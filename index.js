const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

// In-memory storage for users and exercises
const users = {};
const exercises = {};

// POST /api/users endpoint to create a new user
app.post("/api/users", (req, res) => {
	const { username } = req.body;
	const _id = uuidv4();

	users[_id] = { username, _id };
	exercises[_id] = [];

	res.json(users[_id]);
});

// GET /api/users endpoint to get a list of all users
app.get("/api/users", (req, res) => {
	res.json(Object.values(users));
});

// POST /api/users/:_id/exercises endpoint to add an exercise
app.post("/api/users/:_id/exercises", (req, res) => {
	const _id = req.params._id;
	const { description, duration } = req.body;
	const date = req.body.date ? new Date(req.body.date) : new Date();

	if (!users[_id]) {
		return res.status(404).json({ error: "User not found" });
	}

	const exercise = {
		description,
		duration: parseInt(duration),
		date: date.toDateString(),
	};

	exercises[_id].push(exercise);

	res.json({
		username: users[_id].username,
		...exercise,
		_id,
	});
});

// GET /api/users/:_id/logs endpoint to retrieve a user's exercise log
app.get("/api/users/:_id/logs", (req, res) => {
	const _id = req.params._id;
	const { from, to, limit } = req.query;

	if (!users[_id]) {
		return res.status(404).json({ error: "User not found" });
	}

	let log = exercises[_id];

	if (from) {
		const fromDate = new Date(from);
		log = log.filter((e) => new Date(e.date) >= fromDate);
	}

	if (to) {
		const toDate = new Date(to);
		log = log.filter((e) => new Date(e.date) <= toDate);
	}

	if (limit) {
		log = log.slice(0, parseInt(limit));
	}

	res.json({
		username: users[_id].username,
		count: log.length,
		_id,
		log,
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
