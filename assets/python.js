var fs = require('fs');
var path = require('path');
var shortid = require('shortid');
var execFile = require('child_process').execFile;
var Q = require('q');
var node_ssh = require('node-ssh');
var util = require('util');
var config = require('../config.json');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');

function stringBuilder(codeValidation,textSolution){

  var string = "text = \""+ util.inspect(textSolution).replace(/^'|'$/g, '').replace(/"/g, '\\"') + "\"\n"+ codeValidation + "\nprint exercise(text)";

  return string;
}


module.exports = {

  execute: function(codeValidation,textSolution, res , server){

    var ssh = new node_ssh();

    console.log("Server: " + server);

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

              ssh.connect({
                host: server,
                username: config.user,
                password: config.password

              }).then(function(){

                var z = Q.defer();

                ssh.put(path.dirname(require.main.filename) + '/files/python/'+ nameFile +'.py', 'files/python/'+ nameFile +'.py').then(function() {
                    console.log('Uploaded File '+nameFile +'.py');
                    z.resolve();
                }, function(error) {

                    console.log(error);
                    z.reject(error);
                });

                return z.promise;

              }).then(function(){

                  var z = Q.defer();

                ssh.execCommand('python files/python/'+ nameFile +'.py',{stream: 'both'}).then(function(result) {

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

                ssh.execCommand('rm -f files/python/'+ nameFile +'.py').then(function(result) {
                  console.log('Borrado archivo en el servidor');
                  console.log('Borrando archivo local');
                  fs.unlink('./files/python/'+ nameFile +'.py');
                  z.resolve();
                  d.resolve();
                });

                return z.promise;

              }).catch(function(e){

                ssh.execCommand('rm -f files/python/'+ nameFile +'.py').then(function(result) {
                  console.log('Borrado archivo en el servidor');
                  console.log('Borrando archivo local');
                  fs.unlink('./files/python/'+ nameFile +'.py');
                  z.resolve();
                  d.resolve();
                });

                d.reject(e);

              });

            return d.promise;


    }).catch(function(e) {

      res.status(500).send({"respuesta": e});

    }).done();
  }

};
