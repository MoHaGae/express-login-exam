const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const dbconfig = require("./config/databaseConfig.js");

const connection = mysql.createConnection(dbconfig);
connection.connect(() => {
	console.log("✅ DB Connected");
});

const app = express();
const PORT = 8080;

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

// 회원가입 패이지 요청처리
app.get("/join", (req, res) => {
	res.render("join");
});

// 회원가입 요청처리
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

	//💾 유저정보를 데이터베이스에 저장
	connection.query(
		"INSERT INTO user(id, password, nickname) VALUES(?, ?, ?)",
		[id, password, nickname],
		(err) => {
			if (err) {
				console.error(err);
				if (err.code === "ER_DUP_ENTRY") {
					return res.render("join", {
						flashMessage: "이미 가입된 아이디가 있습니다.",
					});
				}
				return res.render("join", {
					flashMessage: "회원가입에 실패했습니다.",
				});
			}
			return res.redirect("/login");
		}
	);
});

// 로그인 페이지 요청처리
app.get("/login", (_, res) => {
	res.render("login");
});

// 로그인 요청처리
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

	connection.query(
		"SELECT id, password, nickname FROM user WHERE id = ?",
		[id],
		(err, rows) => {
			const user = rows[0];
			if (err) {
				console.error(err);
				return res.render("login", {
					flashMessage:
						"현재 서비스를 이용할 수 없습니다. 잠시후 시도해주세요.",
				});
			}
			if (user.password !== password) {
				return res.render("login", {
					flashMessage: "로그인에 실패했습니다.",
				});
			}
			req.session.user = user;
			res.redirect("/");
		}
	);
});

// 로그아웃 요청처리
app.get("/logout", (req, res) => {
	delete req.session.user;
	res.redirect("/");
});

// 별명수정 페이지 요청처리
app.get("/nickname/edit", (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.render("login", { flashMessage: "로그인 후 이용해주세요." });
	}
	res.render("nicknameEdit", { user });
});

// 별명변경 요청처리
app.post("/nickname/edit", (req, res) => {
	const { nickname } = req.body;
	const { user } = req.session;

	// 세션에 인증된 유저인지 검증
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

	// TODO 별명을 수정하는 코드
	connection.query(
		"UPDATE user SET nickname=? WHERE id=?",
		[nickname, user.id],
		(err, rows, fields) => {
			console.log(err, rows, fields);
			if (err) {
				return res.render("nicknameEdit", {
					user,
					flashMessage:
						"현재 서비스를 이용할 수 없습니다. 잠시후 시도해주세요.",
				});
			}
			user.nickname = nickname;
			req.session.user = user;
			res.redirect("/");
		}
	);
});

// 홈화면 요청처리
app.get("/", (req, res) => {
	const { user } = req.session;
	res.render("home", { user });
});

app.listen(PORT, () => {
	console.log(`✅ Server Listen: http://localhost:${PORT}`);
});
