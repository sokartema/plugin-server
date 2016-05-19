var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');


shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$');

function stringBuilder(codeValidation,textSolution,nameFile){

  var string = "package files.java;"+
  "class "+nameFile+" {\n"+
  " public static void main(String args[]) {\n"+
    "   String text = \""+ textSolution + "\";\n" +
    "   System.out.print(exercise(text));\n"+
  " }\n"+
  codeValidation+ "\n"+
"}";


  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution,nameFile);

    function uno(){
      
      var d = Q.defer();

      fs.writeFile('./files/java/'+ nameFile +'.java', string, (err) => {
        if (err){
          d.reject(new Error(err));
        }else{
          console.log("Created file: " + nameFile + ".java");
          d.resolve();
        }

      });
      return d.promise;
    }

    function dos(){
      var d = Q.defer();

      execFile('javac', ['./files/java/'+ nameFile +'.java'], (err, stdout, stderr) => {
        if (err){
          d.reject(new Error(err));
        }else{

          console.log("Created file: " + nameFile + ".class");
          d.resolve();

        }
      });

      return d.promise;

    }

    function tres(){

      var d = Q.defer();

      console.log("Executing: " + nameFile + ".class");

      execFile('java',['files/java/'+ nameFile], (err, stdout, stderr) => {
        if (err){
          d.reject(new Error(err));
        }else{

          console.log("Respuesta: "+ stdout);
          var obj = {"respuesta":stdout.trim()};

          res.json(JSON.stringify(obj));

          console.log("Borrando archivo: " + nameFile + ".java");

          fs.unlink('./files/java/'+ nameFile +'.java');

          console.log("Borrando archivo: " + nameFile + ".class");

          fs.unlink('./files/java/'+ nameFile +'.class');

          d.resolve();


       }
         return d.promise;

      });

    }

    uno()
    .then(dos)
    .then(tres)
    .catch(function(error){

      console.log(error);
      var obj = {"respuesta": error};
      res.status(500).send(obj);

    })
    .done();

  }

};
