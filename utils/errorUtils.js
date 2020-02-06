//https://dev.to/nedsoft/central-error-handling-in-express-3aej
//exports.class ErrorHandler extends Error {//exports wont work when using extends keyword
class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super();//calling the parent constructor
      this.statusCode = statusCode;
      this.message = message;

      //this - current obj., this.constructor - the ErrorHandler class
      Error.captureStackTrace(this, this.constructor);//not necessary
    }

}

const handleError = (err, res) => {
    const { statusCode, message } = err;
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