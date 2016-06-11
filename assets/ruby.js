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

  var string = "text = \""+ util.inspect(textSolution).replace(/^'|'$/g, '').replace(/"/g, '\\"') + "\"\n"+ codeValidation + "\nputs exercise(text)";

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

      fs.writeFile('./files/ruby/'+ nameFile +'.rb', string, (err) => {
        if (err)
          d.reject(err);

        console.log("Created file: " + nameFile + ".rb");
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

          ssh.put(path.dirname(require.main.filename) + '/files/ruby/'+ nameFile +'.rb', 'files/ruby/'+ nameFile +'.rb').then(function() {
              console.log('Uploaded File '+nameFile +'.rb');
              z.resolve();
          }, function(error) {

              console.log(error);
              z.reject(error);
          });

          return z.promise;

        }).then(function(){

            var z = Q.defer();

          ssh.execCommand('ruby files/ruby/'+ nameFile +'.rb',{stream: 'both'}).then(function(result) {

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

          ssh.execCommand('rm -f files/ruby/'+ nameFile +'.rb').then(function(result) {
            console.log('Borrado archivo en el servidor');
            console.log('Borrando archivo local');
            fs.unlink('./files/ruby/'+ nameFile +'.rb');
            z.resolve();
            d.resolve();
          });

          return z.promise;

        }).catch(function(e){

          ssh.execCommand('rm -f files/ruby/'+ nameFile +'.rb').then(function(result) {
            console.log('Borrado archivo en el servidor');
            console.log('Borrando archivo local');
            fs.unlink('./files/ruby/'+ nameFile +'.rb');
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
