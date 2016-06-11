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

  var string = "#include <iostream>\n"+
  "#include <regex>\n"+
  "#include <string>\n"+
  "using namespace std;\n"+
  codeValidation+ "\n"+
  " int main(int argc, const char * argv[]) {\n"+
    "   string text = \""+ util.inspect(textSolution).replace(/^'|'$/g, '').replace(/"/g, '\\"') + "\";\n" +
    "   cout << exercise(text);\n" +
    "   return 0;\n" +
  " }";

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

                ssh.connect({
                  host: server,
                  username: config.user,
                  password: config.password

                }).then(function(){

                  var z = Q.defer();

                  ssh.put(path.dirname(require.main.filename) + '/files/c++/'+ nameFile +'.cpp', 'files/c++/'+ nameFile +'.cpp').then(function() {
                      console.log('Uploaded file '+nameFile +'.cpp');
                      z.resolve();
                  }, function(error) {

                      console.log(error);
                      z.reject(error);

                  });

                  return z.promise;

                }).then(function(){

                    var z = Q.defer();

                  ssh.execCommand('g++ -std=c++11 files/c++/'+ nameFile +'.cpp -o files/c++/'+ nameFile ,{stream: 'both'}).then(function(result) {

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

                  ssh.execCommand('./files/c++/'+ nameFile ,{stream: 'both'}).then(function(result) {
                    if(result.stderr !== ''){

                      z.reject(result.stderr);

                    }else{

                      if(result.stdout === '1'){
                          result.stdout = "true";
                      }

                      if(result.stdout === '0'){
                          result.stdout = "false";
                      }

                      console.log("Respuesta: "+ result.stdout);
                      res.json(JSON.stringify({"respuesta": result.stdout.trim()}));
                      z.resolve();
                    }

                  });

                return z.promise;

                }).then(function(){

                    var z = Q.defer();

                  ssh.execCommand('rm -f files/c++/'+ nameFile +'.cpp && rm -f files/c++/'+ nameFile).then(function(result) {
                    console.log('Borrado archivos en el servidor');
                    console.log('Borrando archivo local');
                    fs.unlink('./files/c++/'+ nameFile +'.cpp');
                    z.resolve();
                    d.resolve();
                  });

                  return z.promise;

                }).catch(function(e){

                  ssh.execCommand('rm -f files/c++/'+ nameFile +'.cpp && rm -f files/c++/'+ nameFile).then(function(result) {
                    console.log('Borrado archivos en el servidor');
                    console.log('Borrando archivo local');
                    fs.unlink('./files/c++/'+ nameFile +'.cpp');
                    z.resolve();
                    d.resolve();
                  });

                });

        return d.promise;

    }).fail(function(error){

      console.log(error);
      res.status(500).send({"respuesta": error});

    })
    .done();

  }

};
