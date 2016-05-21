var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');


function stringBuilder(codeValidation,textSolution){

  var string = "var text = \""+ textSolution + "\";\n"+ codeValidation + "\nconsole.log(exercise(text))";

  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution);

        (function(){
          var d = Q.defer();

           fs.writeFile('./files/javascript/'+ nameFile +'.js', string, (err) => {
            if (err)
                d.reject(err);

            console.log("Created file: " + nameFile + ".js");
            d.resolve();

          });

          return d.promise;

        })().then(function(){

          var d = Q.defer();

          console.log("Executing: " + nameFile + ".js");

          execFile('node', ['./files/javascript/'+ nameFile +'.js'], (err, stdout, stderr) => {
            if (err){

              console.log("Borrando archivo: " + nameFile + ".js");

              fs.unlink('./files/javascript/'+ nameFile +'.js');
              d.reject(stderr);
            }else{

              console.log("Respuesta: "+ stdout);

              res.json(JSON.stringify({"respuesta":stdout.trim()}));

              console.log("Borrando archivo: " + nameFile + ".js");

              fs.unlink('./files/javascript/'+ nameFile +'.js');

            }

          });

          return d.promise;

        }).catch(function(e) {

          res.status(500).send({"respuesta": e});

        }).done();

  }



};
