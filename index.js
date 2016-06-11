var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var loader = require('./loader');

var PORT = 8080;

var selector = 0;
var pool = ['10.6.128.60','10.6.128.63','10.6.128.68'];

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/', function(req, res) {

    var server = pool[selector];

    if(selector === 2)
      selector = 0;
    else
      selector++;

    var codeValidation = req.body.codeValidation;
    var textSolution = req.body.textSolution;
    var language = req.body.language;

    console.log("Code Validation: " + codeValidation);
    console.log("Text Solution: " + textSolution);
    console.log("Language: " + language);

    var respuesta = null;

    var error = false;


    switch (language) {
      case "javascript":

          loader.js.execute(codeValidation, textSolution, res , server);

        break;

      case "ruby":

          loader.ruby.execute(codeValidation, textSolution, res, server);


        break;

      case "python":

          loader.python.execute(codeValidation, textSolution , res , server);

        break;

      case "java":

          loader.java.execute(codeValidation, textSolution , res , server);

        break;
      case "c++":

          loader.cpp.execute(codeValidation, textSolution , res , server);

      break;

      default:

        error = true;
        respuesta = "Unexpected language";

    }

    if(error){

      console.log("Respuesta: " + respuesta);

      res.status(500).send({"respuesta": respuesta});
    }

});

app.get('/', function(req, res) {

    res.send("En get no hay nada :(");
});


app.listen(process.env.PORT || PORT);

console.log("Server Listening on " + PORT);
