var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');

function errorHandler(msg, res){

  console.log(msg);
  var obj = {"respuesta": msg};
  res.status(500).send(obj);

}


function stringBuilder(codeValidation,textSolution){

  var string = "text = \""+ textSolution + "\"\n"+ codeValidation + "\nprint exercise(text)";

  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution);

    new Promise(function(resolve,reject){ fs.writeFile('./files/python/'+ nameFile +'.py', string, (err) => {
        if (err)
            reject(err);

        console.log("Created file: " + nameFile + ".py");
        resolve();

      });
    }).then(function(resolve){

      console.log("Executing: " + nameFile + ".py");

      execFile('python', ['./files/python/'+ nameFile +'.py'], (err, stdout, stderr) => {
        if (err){
          errorHandler(err, res);
        }else{

          console.log("Respuesta: "+ stdout);
          var obj = {"respuesta":stdout.trim()};

          res.json(JSON.stringify(obj));

        }

        console.log("Borrando archivo: " + nameFile + ".py");

        fs.unlink('./files/python/'+ nameFile +'.py');

      });

    }).catch(function(e) {

      var obj = {"respuesta": e};
      res.status(500).send(obj);

    });
  }

};
