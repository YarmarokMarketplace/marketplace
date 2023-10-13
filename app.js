require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const path = require("path");
const passport = require("passport");
const expressSession = require('express-session');

const noticeRouter = require("./routes/api/notices/notices-routes");
const mainRouter = require("./routes/api/main/main-routes");
const authRouter = require("./routes/api/auth/auth-routes");
const userRouter = require("./routes/api/user/user-routes");
const orderRouter = require("./routes/api/order/orders-routes");

const { job } = require('./utils/cronJob');

const app = express();
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
  res.render('index', {
      heading: 'YarmarOK',
      text: 'Some text',
      time: (new Date().toUTCString())
  })
})

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.get('/', (req, res) => {
  res.render('index', {title: 'Hey', message: 'Hello World!'});
});

app.use(logger(formatsLogger));

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8080", "https://yarmarok.netlify.app/", "https://stcn619d-8080.euw.devtunnels.ms/", /\.netlify\.app$/],
  })
);

app.use(express.static("public"));
app.use(express.json());

app.use(expressSession({
  secret: 'jayantpatilapp',
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser((user, done)=>{
  done(null, user);
})

passport.deserializeUser((user, done)=>{
  done(null, user);
})

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/main", mainRouter);
app.use("/api/notices", noticeRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/orders", orderRouter);

job.start();

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;