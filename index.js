var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var loader = require('./loader');


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/', function(req, res) {
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

          loader.js.execute(codeValidation, textSolution, res);

        break;

      case "ruby":

          loader.ruby.execute(codeValidation, textSolution, res);


        break;

      case "python":

          loader.python.execute(codeValidation, textSolution , res);

        break;

      case "java":

          loader.java.execute(codeValidation, textSolution , res);

        break;
      case "c++":

          loader.cpp.execute(codeValidation, textSolution , res);
          
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


app.listen(8888);

console.log("Server Listening on 8888");
