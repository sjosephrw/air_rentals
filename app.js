const express = require('express');
var morgan = require('morgan')

const app = express();

const listingRouter = require('./routes/listingRoutes');
const userRouter = require('./routes/userRoutes');
const { ErrorHandler, handleError } = require('./utils/errorUtils');

//middleware
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log('Hello from the MIDDLEWARE 👋');
    next();
});

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err);//when we pass a argument into next express will trigger the new Error() class.
  })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(`⏲: ${req.requestTime}`);
    console.log(req.body)
    next();
});

app.use('/api/v1/listings', listingRouter);
app.use('/api/v1/users', userRouter);

//all  = all http methods, * = all undefined routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(404, `Sorry the URL - ${req.originalUrl} - was not found on our server. 🌛`));
});

//express global error handling MW
app.use((err, req, res, next) => {
    handleError(err, res);
});

module.exports = app;
