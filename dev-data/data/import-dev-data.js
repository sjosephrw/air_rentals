//core modules
const fs = require('fs');

//3rd party modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//models
const Tour = require('../../models/listingModel');
// const Review = require('../../models/reviewModel');
// const User = require('../../models/userModel');

dotenv.config({path: './config.env'});//*************IMPORTANT - THE CONFIG FILE MUST BE IMPORTED BEFORE const app = require('./app');*/

//const app = require('./app');

// console.log(process.env);//logs the environment vars.
// console.log(process.env.NODE_ENV);//logs the NODE_ENV environment var.
// console.log(app.get('env'));//logs the mode either development or production

const port = process.env.PORT || 3000;

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

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false    
})
.then(conn => {
    //console.log(conn.connections);
    console.log('DB Connection successful.');
});

//READ JSON FILE
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/listings.json`, 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));


//IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Listing.create(listings);//tours is a array of objects and mongoose.create() can also accept a array of objects
        // await Review.create(reviews);//reviews is a array of objects and mongoose.create() can also accept a array of objects
        // //the code below was generating please enter confirm password error validate before save prevented it.
        // await User.create(users, { validateBeforeSave: false });//users is a array of objects and mongoose.create() can also accept a array of objects
        
        console.log('Data successfully loaded.');
    } catch (err){
        console.log(err);
    }
    process.exit();//very aggresive way of quiting the application but since this is a single script it's not much of an issue

};

//DELETE DATA FROM COLLECTION
const deleteData = async () => {
    try {
        await Listing.deleteMany();//deletes all the data in the Collection
        // await Review.deleteMany();//deletes all the data in the Collection
        // await User.deleteMany();//deletes all the data in the Collection

        console.log('Data successfully deleted.');
    } catch (err){
        console.log(err);
    }
    process.exit();//very aggresive way of quiting the application but since this is a single script it's not much of an issue

};

if (process.argv[2] === '--import'){
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);
