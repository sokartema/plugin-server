var http = require("http");

var obj = {

  "algo": "algo"

};

function start(){

  function onRequest(request,response){
    console.log(request);
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(obj));
    response.end();

  }

  http.createServer(onRequest).listen(8888);


}


exports.start = start;
