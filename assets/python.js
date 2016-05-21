var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');


function stringBuilder(codeValidation,textSolution){

  var string = "text = \""+ textSolution + "\"\n"+ codeValidation + "\nprint exercise(text)";

  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution);

    (function(){
      var d = Q.defer();

       fs.writeFile('./files/python/'+ nameFile +'.py', string, (err) => {
        if (err)
            d.reject(err);

        console.log("Created file: " + nameFile + ".py");
        d.resolve();

      });

      return d.promise;

    })().then(function(){

      var d = Q.defer();

      console.log("Executing: " + nameFile + ".py");

      execFile('python', ['./files/python/'+ nameFile +'.py'], (err, stdout, stderr) => {
        if (err){

          console.log("Borrando archivo: " + nameFile + ".py");

          fs.unlink('./files/python/'+ nameFile +'.py');
          d.reject(stderr);
        }else{

          console.log("Respuesta: "+ stdout);

          res.json(JSON.stringify({"respuesta":stdout.trim()}));

          console.log("Borrando archivo: " + nameFile + ".py");

          fs.unlink('./files/python/'+ nameFile +'.py');

        }

      });

      return d.promise;

    }).catch(function(e) {

      res.status(500).send({"respuesta": e});

    }).done();
  }

};
