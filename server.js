const mongoose = require('mongoose');
const ora = require('ora');
const chalk = require('chalk');

const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app');



// console.log(app.get('env'));
// console.log(process.env);

//Error: listen EADDRINUSE: address already in use :::3000
//https://stackoverflow.com/questions/39322089/node-js-port-3000-already-in-use-but-it-actually-isnt
//solution:$ killall -9 node

//https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call
String.prototype.allReplace = function(obj) {
    var retStr = this;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

const DB = process.env.DATABASE.allReplace({'<USERNAME>': process.env.DATABASE_USERNAME, '<PASSWORD>': process.env.DATABASE_PASSWORD});

// console.log(DB);

const port = process.env.PORT || 3000;

const spinner = ora(`Please wait ${chalk.red('Connecting to DB \n')}`).start();

mongoose.connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
    // ,
    // useUnifiedTopology: true
}).then((con) => {
    // console.log(con.connections);
    spinner.succeed('Connected to Database successfully 💽');
}).catch((err) => {
    console.error(err);
    throw new Error('Failed to connect to Database. 💥 💥');
});


app.listen(port, () => {
    console.log(`\n App running on PORT ${port} 🏃 🏃 🏃 🏃`);
    console.log(`-------------------------------------------------------------------`)
    console.log(`-------------------------------------------------------------------`)
    console.log(`- THIS APPLICATION REPRESENTS A HARMONY OF MATHEMATICAL PRECISION -`)
    console.log(`-------------------------------------------------------------------`)
    console.log(`-------------------------------------------------------------------\n`)
});

