const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const authRouter = require("./routes/api/auth/auth-routes");
const noticeRouter = require("./routes/api/notices/notices-routes");
const userRouter = require("./routes/api/user/user-routes");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));

app.use(
  cors({
    credentials: true,
    origin: ["http://yarmarok-env.eba-npm2c4pm.eu-central-1.elasticbeanstalk.com/", "http://localhost:8080"],
  })
);

app.use(express.static("public"));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use("/api/auth", authRouter);
// app.use("/api/notices", noticeRouter);
// app.use("/api/user", userRouter);


app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;