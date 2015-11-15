var express = require("express"),
    stylus = require("stylus"),
    logger = require("morgan"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var app = express();

//util method. stylus extension method
function compile(str, path) {
    return stylus(str).set("filename", path);
}

//configs, move to application start step file
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src: __dirname + "/../public",
        compile: compile
    }
));

//database stuff
if (env === "development") {
    mongoose.connect("mongodb://localhost/pharma-app");
} else {
    mongoose.connect("mongodb://andsct:andsct@ds053944.mongolab.com:53944/pharma-app");
}

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error..."));
db.once("open", function callback() {
    console.log("pharma-app db opened");
});
var messageSchema = mongoose.Schema({ message: String });
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
    mongoMessage = messageDoc.message;
});

//server routing. pay attention to order of declarin routes
app.use(express.static(__dirname + "/../public"));
app.get("/partials/:partialPath", function (req, res) {
    res.render("partials/" + req.params.partialPath);
});
app.get("*", function (req, res) {
    res.render("index", {
        mongoMessage: mongoMessage
    });
});

//start app
var port = process.env.PORT || 8089;
app.listen(port);
console.log("start listening on port " + port + "...");