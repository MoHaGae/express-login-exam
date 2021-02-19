const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

const users = {};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
	session({
		secret: "Ssok2as@$!ssds@#aaxcBP$sd",
		resave: false,
		saveUninitialized: false,
	})
);

app.get("/join", (req, res) => {
	res.render("join");
});

app.post("/join", (req, res) => {
	const { id, password, nickname } = req.body;

	// 유효성 검증
	if (
		!id ||
		!password ||
		!nickname ||
		id.trim().length <= 0 ||
		password.trim().length <= 0 ||
		nickname.trim().length <= 0
	) {
		return res.render("join", {
			flashMessage: "회원정보를 정확히 입력해주세요.",
		});
	}

	// 중복체크
	if (users[id]) {
		return res.render("join", {
			flashMessage: "이미 가입되어있는 아이디입니다.",
		});
	}

	users[id] = {
		id,
		password,
		nickname,
	};
	return res.redirect("/login");
});

app.get("/login", (_, res) => {
	res.render("login");
});

app.post("/login", (req, res) => {
	const { id, password } = req.body;

	// 유효성 검증
	if (
		!id ||
		!password ||
		id.trim().length <= 0 ||
		password.trim().length <= 0
	) {
		return res.render("login", {
			flashMessage: "로그인정보를 정확히 입력해주세요.",
		});
	}

	// 회원검증
	if (!users[id] || users[id].password !== password) {
		return res.render("login", {
			flashMessage: "로그인에 실패하였습니다.",
		});
	}
	req.session.user = users[id];
	res.redirect("/");
});

app.get("/logout", (req, res) => {
	delete req.session.user;
	res.redirect("/");
});

app.get("/nickname/edit", (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.render("login", { flashMessage: "로그인 후 이용해주세요." });
	}
	res.render("nicknameEdit", { user });
});

app.post("/nickname/edit", (req, res) => {
	const { nickname } = req.body;
	const { user } = req.session;

	// 인증
	if (!user) {
		return res.render("login", { flashMessage: "로그인 후 이용해주세요." });
	}
	// 유효성검증
	if (!nickname || nickname.trim().length <= 0) {
		return res.render("nicknameEdit", {
			user,
			flashMessage: "별명을 정확히 입력해주세요.",
		});
	}

	// TODO 별명을 수정하는 코드 ~
	users[user.id].nickname = nickname;
	req.session.user = users[user.id];
	res.redirect("/");
});

app.get("/", (req, res) => {
	const { user } = req.session;
	console.log(users);
	console.log(req.session);
	res.render("home", { user });
});

app.listen(PORT, () => {
	console.log(`✅ Server Listen: http://localhost:${PORT}`);
});
