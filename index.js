var express = require('express');
var app = express();
var bodyParser = require('body-parser');


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

    try{

      eval('var test = '+ codeValidation);

    }catch(e){

      console.log('Function error = '+ e);

    }

    var respuesta = test(textSolution);

    console.log(respuesta);

    obj = {"respuesta": respuesta};

    res.json(JSON.stringify(obj));
});

app.get('/', function(req, res) {
    console.log(req);
    res.json(JSON.stringify(obj));
});


app.listen(8888);

console.log("Server Listening on 8888");
