const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ApiError = require("./utils/ApiError");
const app = express();
const loggerMiddleware = require("./middleware/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json"); // Generated Swagger file
const router = require("./router/index");
const fileUpload = require("express-fileupload");
const path = require("path");

// Middlewares
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(loggerMiddleware);
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// api doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
//routes
app.use("/", router);

app.get("/", (req, res) => {
  res.send("cloudfront api v1.0.1");
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

module.exports = app;
