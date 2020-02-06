const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Listing must have a name.'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A listing mst have a description.'],
        trim: true
    },
    category: {
        type: String,
        enum: ['stay', 'adventure'],
        required: true       
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },    
    additionalDetails: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: [isValidData, "Have you filled in all the form fields for ADDITIONAL DETAILS and check whether the data is valid."]      
    },    
    price: {
        type: Number,
        required: [true, 'A listing must have a price.']
    },
    images: {
        type: [String],
        required: [true, 'A listing must have at least 1 image.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
        
});

       Date.prototype.isValid = function () { 
              
            // If the date object is invalid it 
            // will return 'NaN' on getTime()  
            // and NaN is never equal to itself. 
            return this.getTime() === this.getTime(); 
        }; 

function isValidData(data) {

    if (this.category === "stay"){

        for (const datum of data) {

            console.log(datum.location.address, datum.location.coordinates[0], datum.location.coordinates[1]);

            if (typeof datum.maxGroupSize !== 'number'){ return false; }
            else if (typeof datum.location.address !== 'string'){ return false }
            else if (
                typeof datum.location.coordinates[0] !== 'number' 
                && typeof datum.location.coordinates[1] !== 'number'
            )
            { 
                return false
            } 

        }
    
    } else if (this.category === "adventure"){
        for (const datum of data) {
            console.log(datum.date);
            // if (!(datum.date instanceof Date)){ return false }
            if (typeof datum.maxGroupSize !== 'number'){ return false }
            else if (typeof datum.description !== 'string'){ return false }
            else if (typeof datum.image !== 'string'){ return false }
            else if (typeof datum.location.address !== 'string'){ return false }
            else if (
                typeof datum.location.coordinates[0] !== 'number' 
                && typeof datum.location.coordinates[1] !== 'number'
            )
            { 
                return false
            }       
        }
    
    }


    return true;
}

listingSchema.index({ '$**': 'text' });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;