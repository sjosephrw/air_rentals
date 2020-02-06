//https://dev.to/nedsoft/central-error-handling-in-express-3aej
//exports.class ErrorHandler extends Error {//exports wont work when using extends keyword
//es6 vanilla js error class
//https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel

class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super();//calling the parent constructor
      this.statusCode = statusCode;
      this.message = message;

      //to prevent the error stack trace (the large error message) from appearing
      //this - current obj., this.constructor - the ErrorHandler class
      // Error.captureStackTrace(this, this.constructor);//not necessary
    }

}

const handleError = (err, res) => {
    const { statusCode, message } = err;

    //without this line of code when throwing an error invalida status code was being displayed
    //https://teamtreehouse.com/community/rangeerror-errhttpinvalidstatuscode-invalid-status-code-undefined-pretty-sure-the-issue-is-in-cardsjs
    const sCode = statusCode || 500; 
    
    res.status(sCode).json({
      status: "error",
      sCode,
      message
    });
  };


module.exports = {
    ErrorHandler,
    handleError
}