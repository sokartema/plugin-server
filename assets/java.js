var fs = require('fs');
var path = require('path');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');
var node_ssh = require('node-ssh');
var util = require('util');
var config = require('../config.json');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');

function stringBuilder(codeValidation,textSolution,nameFile){

  var string = "package files.java;"+
  "class "+nameFile+" {\n"+
  " public static void main(String args[]) {\n"+
    "   String text = \""+ util.inspect(textSolution).replace(/^'|'$/g, '').replace(/"/g, '\\"') + "\";\n" +
    "   System.out.print(exercise(text));\n"+
  " }\n"+
  codeValidation+ "\n"+
"}";


  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res, server){

    var ssh = new node_ssh();

    console.log("Server: " + server);

    var nameFile = shortid.generate();

    var string = stringBuilder(codeValidation,textSolution,nameFile);

    (function(){

      var d = Q.defer();

      fs.writeFile('./files/java/'+ nameFile +'.java', string, (err) => {
        if (err){
          d.reject(err);
        }else{
          console.log("Created file: " + nameFile + ".java");
          d.resolve();
        }

      });
      return d.promise;

    })().then(function(){

      var d = Q.defer();

      ssh.connect({
        host: server,
        username: config.user,
        password: config.password

      }).then(function(){

        var z = Q.defer();

        ssh.put(path.dirname(require.main.filename) + '/files/java/'+ nameFile +'.java', 'files/java/'+ nameFile +'.java').then(function() {
            console.log('Uploaded file '+nameFile +'.java');
            z.resolve();
        }, function(error) {

            console.log(error);
            z.reject(error);

        });

        return z.promise;

      }).then(function(){

          var z = Q.defer();

        ssh.execCommand('javac files/java/'+ nameFile +'.java',{stream: 'both'}).then(function(result) {

          if(result.stderr !== ''){

            z.reject(result.stderr);
          }else{
            console.log("Archivo compilado");
            z.resolve();
          }

          });

        return z.promise;

      }).then(function(){

        var z = Q.defer();

        ssh.execCommand('java files.java.'+ nameFile ,{stream: 'both'}).then(function(result) {
          if(result.stderr !== ''){

            z.reject(result.stderr);

          }else{

            console.log("Respuesta: "+ result.stdout);
            res.json(JSON.stringify({"respuesta": result.stdout.trim()}));
            z.resolve();
          }

        });

      return z.promise;

      }).then(function(){

          var z = Q.defer();

        ssh.execCommand('rm -f files/java/'+ nameFile +'.java && rm -f files/java/'+ nameFile +'.class').then(function(result) {
          console.log('Borrado archivos en el servidor');
          console.log('Borrando archivo local');
          fs.unlink('./files/java/'+ nameFile +'.java');
          z.resolve();
          d.resolve();
        });

        return z.promise;

      }).catch(function(e){

        ssh.execCommand('rm -f files/java/'+ nameFile +'.java && rm -f files/java/'+ nameFile+ '.class').then(function(result) {
          console.log('Borrado archivos en el servidor');
          console.log('Borrando archivo local');
          fs.unlink('./files/java/'+ nameFile +'.java');
          z.resolve();
          d.resolve();
        });

      });

        return d.promise;
    })
    .fail(function(error){

      console.log(error);
      res.status(500).send({"respuesta": error});

    })
    .done();

  }

};
