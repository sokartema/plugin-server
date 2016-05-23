var fs = require('fs');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');

function stringBuilder(codeValidation,textSolution,nameFile){

  var string = "#include <iostream>\n"+
  "#include <regex>\n"+
  "#include <string>\n"+
  "using namespace std;\n"+
  codeValidation+ "\n"+
  " int main(int argc, const char * argv[]) {\n"+
    "   string text = \""+ textSolution + "\";\n" +
    "   cout << exercise(text);\n" +
    "   return 0;\n" +
  " }";

  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res){

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution,nameFile);

    (function(){

      var d = Q.defer();

      fs.writeFile('./files/c++/'+ nameFile +'.cpp', string, (err) => {
        if (err){
          d.reject(err);
        }else{
          console.log("Created file: " + nameFile + ".cpp");
          d.resolve();
        }

      });
      return d.promise;

    })().then(function(){

      var d = Q.defer();

      execFile('g++', ['files/c++/'+ nameFile +'.cpp', '-o' ,'files/c++/'+ nameFile], (err, stdout, stderr) => {
        if (err){

          console.log("Borrando archivo: " + nameFile + ".cpp");
          fs.unlink('./files/c++/'+ nameFile +'.cpp');
          d.reject(stderr);
        }else{

          console.log("Created file: " + nameFile);

          console.log("Borrando archivo: " + nameFile + ".cpp");

          fs.unlink('./files/c++/'+ nameFile +'.cpp');
          d.resolve();

        }
      });

      return d.promise;

    }).then(function(){

      var d = Q.defer();

      console.log("Executing: " + nameFile);

      execFile('./files/c++/'+nameFile , (err, stdout, stderr) => {
        if (err){

          console.log("Borrando archivo: " + nameFile);

          fs.unlink('./files/c++/'+ nameFile);

          d.reject(stderr);
        }else{

          console.log("Respuesta: "+ stdout);

          if(stdout === '1'){
            stdout = "true";
          }

          if(stdout === '0'){
            stdout = "false";
          }

          res.json(JSON.stringify({"respuesta":stdout.trim()}));

          console.log("Borrando archivo: " + nameFile);

          fs.unlink('./files/c++/'+ nameFile);


          d.resolve();


       }
         return d.promise;

      });

    })
    .fail(function(error){

      console.log(error);
      res.status(500).send({"respuesta": error});

    })
    .done();

  }

};
