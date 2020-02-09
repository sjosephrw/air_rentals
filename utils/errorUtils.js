//https://dev.to/nedsoft/central-error-handling-in-express-3aej
//exports.class ErrorHandler extends Error {//exports wont work when using extends keyword
//es6 vanilla js error class
//https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel

class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super();//calling the parent constructor
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';//4 means 404 etc errors, else 500
      this.message = message;
      this.isOperational = `${statusCode}`.startsWith('4') ? true : false;

      //to prevent the error stack trace (the large error message) from appearing
      //this - current obj., this.constructor - the ErrorHandler class
      // Error.captureStackTrace(this, this.constructor);//not necessary
    }

}

const handleCastErrorDB = (error) => {
  const message = `Invalid error ${error.path} : ${error.value}`;
  return new ErrorHandler(400, message);
}

//https://stackoverflow.com/questions/56773093/how-to-handle-http-errors-in-express-in-production
const processErrors = (err) => {
  let responseObj = {};

  const { statusCode, status, message, stack } = err;

  //without this line of code when throwing an error invalida status code was being displayed
  //https://teamtreehouse.com/community/rangeerror-errhttpinvalidstatuscode-invalid-status-code-undefined-pretty-sure-the-issue-is-in-cardsjs
  sCode = statusCode || 500; 

  if (process.env.NODE_ENV === 'development'){

    responseObj.status = status;
    responseObj.err = err;
    responseObj.message = message;
    responseObj.stack = stack;

  } else if (process.env.NODE_ENV === 'production'){
    
    if (err.isOperational){

      responseObj.status = status;
      responseObj.message = message;      
    
    } else {
      
      //500 errors
      console.error(`ERROR 💥`, err)
      //cast errors are if the vale that is required is a string and the user enters a integer
      //then the DB will generate a cast error
      //cast errors will be handled by the else block that also handles 500 errors
      // since cast errors will generate a 500 status code 
      //bt we need to show the database validation errors to the user so we do - 
      //return new ErrorHandler(400, message);
      
      if(err.name === 'CastError') 
      {
        //this will return - //return new ErrorHandler(400, message);
        const error = handleCastErrorDB(err);
        responseObj.status = error.status;
        responseObj.message = error.message;

        return { sCode: error.statusCode,  responseObj };

      }

      responseObj.status = 'error';
      responseObj.message = `Sorry for the inconvenience, something went very wrong 🛰`;
    

    }
  } 
  
  return { sCode, responseObj};
}

const handleError = (err, res) => {
      const { sCode, responseObj } = processErrors(err);
      res.status(sCode).json(responseObj);
};


module.exports = {
    ErrorHandler,
    handleError
}