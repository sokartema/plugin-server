module.exports = {

  execute: function(codeValidation,textSolution,res ){

    var error = false;

    try{

      eval('var test = '+ codeValidation);

    }catch(e){

      var respuesta = "Function error: " + e;

    }

    var respuesta = test(textSolution);

    console.log("Respuesta: " + respuesta);

    var obj = {"respuesta":respuesta};

    if(!error){

      res.json(JSON.stringify(obj));

    }else{

      res.status(500).send(respuesta);
    }

  }



};
