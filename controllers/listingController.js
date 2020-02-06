const Listing = require('../models/listingModel');

const { prepareDataForDbInsertion } = require('../utils/listingUtils');
 
const loopAndWrapTryCatch = require('../utils/reusableTryCatch');

const { ErrorHandler } = require('../utils/errorUtils');


//grouping the contoleer functions into a single object to loop through the functions and 
//wrap them in the reusable try catch block
const groupedFunctionsObj = {

    getAllListings: async (req, res, next) => {

        //throw new Error('ABC');

        const listings = await Listing.find();

        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: listings.length,
            data: {
                listings
            }
        });
    },

    createListing : async (req, res, next)=>{//***IMPORTANT - the next parameter is necessary here

            
        const data = await prepareDataForDbInsertion(req, process.env.LOCATIONIQ_API_TOKEN, next);
        const newListing = await Listing.create(data);

        res.status(201).json({
            status: 'success',
            data: {
                listing: newListing
            }
        });            
    
    },
    getListing : async (req, res, next) => {

        const listing = await Listing.findById(req.params.id);

        if (!listing){
            return next(new ErrorHandler(404, `No listing found with that ID`))
        }

        res.status(200).json({
            status: 'success',
            data: {
                listing
            }
        });


    },updateListing : async (req, res, next) => {
        
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedListing){
            return next(new ErrorHandler(404, `No listing found with that ID`))
        }

        res.status(200).json({
            status: 'success',
            data: updatedListing
        }); 

    },deleteListing : async (req, res, next) => {

        const listing = await Listing.findByIdAndDelete(req.params.id);

        if (!listing){
            return next(new ErrorHandler(404, `No listing found with that ID`))
        }

        res.status(204).json({
            status: 'success',
            data: null
        });         
        
    }

}


const listingController = loopAndWrapTryCatch(groupedFunctionsObj);

module.exports = listingController;