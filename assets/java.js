var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;


shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$');

function errorHandler(msg, res){

  var obj = {"respuesta": e};
  res.status(500).send(respuesta);


}

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

    new Promise(function(resolve,reject){ fs.writeFile('./files/java/'+ nameFile +'.java', string, (err) => {
        if (err)
            reject(err);

        console.log("Created file: " + nameFile + ".java");
        resolve();

      });
    }).then(function(resolve){



      execFile('javac', ['./files/java/'+ nameFile +'.java'], (err, stdout, stderr) => {
        if (err)
          errorHandler(err, res);
        else
        console.log("Created file: " + nameFile + ".class");
      });

    }).then(function(resolve){

      console.log("Executing: " + nameFile + ".class");

      execFile('java',['./files/java/'+ nameFile], (err, stdout, stderr) => {
        if (err){
          errorHandler(err, res);
        }else{

          console.log("Respuesta: "+ stdout);
          var obj = {"respuesta":stdout.trim()};

          res.json(JSON.stringify(obj));

       }

        console.log("Borrando archivo: " + nameFile + ".java");

        //fs.unlink('./files/java/'+ nameFile +'.java');

        console.log("Borrando archivo: " + nameFile + ".class");

        //fs.unlink('./files/java/'+ nameFile +'.class');

      });

    }).catch(function(e) {

      var obj = {"respuesta": e};
      res.status(500).send(respuesta);

    });
  }

};
