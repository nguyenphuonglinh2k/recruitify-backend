require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const projectRoute = require("./routes/project.route");
const taskRoute = require("./routes/task.route");
const tagRoute = require("./routes/tag.route");
// const jobRoute = require("./routes/job.route");

const app = express();
const port = 5000;

//connect mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Added check for DB connection
mongoose.connection.on("connected", () => {
  console.log("connected to mongo yeah!");
});
mongoose.connection.on("error", err => {
  console.log("error connecting:", err);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use("/api", userRoute);
app.use("/api", projectRoute);
app.use("/api", taskRoute);
app.use("/api", tagRoute);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
