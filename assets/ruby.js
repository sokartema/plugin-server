var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;


function errorHandler(msg, res){


  console.log(msg);
  var obj = {"respuesta": msg};
  res.status(500).send(obj);


}


function stringBuilder(codeValidation,textSolution){

  var string = "text = \""+ textSolution + "\"\n"+ codeValidation + "\nputs exercise(text)";

  return string;
}



module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution);

    new Promise(function(resolve,reject){ fs.writeFile('./files/ruby/'+ nameFile +'.rb', string, (err) => {
        if (err)
            reject(err);

        console.log("Created file: " + nameFile + ".rb");
        resolve();

      });
    }).then(function(resolve){

      console.log("Executing: " + nameFile + ".rb");

      execFile('ruby', ['./files/ruby/'+ nameFile +'.rb'], (err, stdout, stderr) => {
        if (err){
          errorHandler(err, res);
        }else{


        console.log("Respuesta: "+ stdout);
        var obj = {"respuesta":stdout.trim()};

        res.json(JSON.stringify(obj));

        }

        console.log("Borrando archivo: " + nameFile + ".rb");

        fs.unlink('./files/ruby/'+ nameFile +'.rb');

      });

    }).catch(function(e) {

      var obj = {"respuesta": e};
      res.status(500).send(obj);

    });
  }

};
