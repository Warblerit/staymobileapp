var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var http = require("http");
var jwt = require("jsonwebtoken");
var path = require("path");
var $ = require("jquery");
var cors = require("cors");
var fs = require("fs");
var rfs = require('rotating-file-stream')
var mkdirp = require('mkdirp');
/*Internal dependencies*/
var config = require("./server/config");
var User = require("./server/models/user");

/*Express Server config*/

/*API routes*/
const api = require("./server/routes/route");

var port = process.env.PORT || 3000;
// mongoose.connect(config.database, { useMongoClient: true });

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/*Enable cors origin*/
var corsOptions = {

  origin: "http://localhost:4200",
  optionsSuccessStatus: 200
};
app.use(cors());

/* use morgan to log requests to the console & file */

// var accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
// app.use(morgan('combined', { stream: accessLogStream }))


function pad(num) {
  return (num > 9 ? "" : "0") + num;
}

var date = new Date();
var year = date.getFullYear()
var month = pad(date.getMonth() + 1);

var fullDirPath = "";
var logDirectory = path.join(__dirname, 'httpLogs')
if (fs.existsSync || !fs.existsSync(logDirectory)) {
  if (!fs.existsSync(logDirectory)) {
    mkdirp(logDirectory)
  }
  var yearDir = path.join(__dirname, 'httpLogs/' + year)
  if (!fs.existsSync(yearDir)) {
    mkdirp(yearDir)
  }
  var monthDir = path.join(__dirname, 'httpLogs/' + year + "/" + month)
  if (!fs.existsSync(monthDir)) {
    mkdirp(monthDir)
  }
  fullDirPath = path.join(__dirname, 'httpLogs/' + year + "/" + month)
}

function generator() {

  var date = new Date();
  var year = date.getFullYear()
  var month = pad(date.getMonth() + 1);
  var day = pad(date.getDate());


  return day + "-" + month + "-" + year + "-file.log";

}

var accessLogStream = rfs(generator(), {
  interval: '1d',
  path: fullDirPath
})

app.use(morgan("dev"));

app.use(morgan('combined', { stream: accessLogStream }))

/* static path to dist/src */
app.use(express.static(path.join(__dirname, "dist")));

app.use("/api", api);

app.get("/", function (req, res) {
  // res.send("END POINT URL : localhost:3000/api");
});

var server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));

server.timeout = 240000;
