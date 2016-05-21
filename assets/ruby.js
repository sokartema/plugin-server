var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');


function stringBuilder(codeValidation,textSolution){

  var string = "text = \""+ textSolution + "\"\n"+ codeValidation + "\nputs exercise(text)";

  return string;
}

module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution);

    (function(){

        var d = Q.defer();

      fs.writeFile('./files/ruby/'+ nameFile +'.rb', string, (err) => {
        if (err)
          d.reject(err);

        console.log("Created file: " + nameFile + ".rb");
        d.resolve();

      });

      return d.promise;

    })().then(function(resolve){

      var d = Q.defer();

      console.log("Executing: " + nameFile + ".rb");

      execFile('ruby', ['./files/ruby/'+ nameFile +'.rb'], (err, stdout, stderr) => {
        if (err){
          d.reject(stderr);
          console.log("Borrando archivo: " + nameFile + ".rb");

          fs.unlink('./files/ruby/'+ nameFile +'.rb');

        }else{


          console.log("Respuesta: "+ stdout);

          res.json(JSON.stringify({"respuesta":stdout.trim()}));

          console.log("Borrando archivo: " + nameFile + ".rb");

          fs.unlink('./files/ruby/'+ nameFile +'.rb');

          d.resolve();

        }

      });

      return d.promise;

    }).catch(function(e) {

      res.status(500).send({"respuesta": e});

    }).done();
  }

};
