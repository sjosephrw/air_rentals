const Listing = require('../models/listingModel');

const { prepareDataForDbInsertion } = require('../utils/listingUtils');
 
const loopAndWrapTryCatch = require('../utils/reusableTryCatch');
    
const groupedFunctionsObj = {

    getAllListings: async (req, res) => {

        throw new Error('ABC');

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

    createListing : async (req, res)=>{

            
            const data = await prepareDataForDbInsertion(req, process.env.LOCATIONIQ_API_TOKEN);
            const newListing = await Listing.create(data);
    
            res.status(201).json({
                status: 'success',
                data: {
                    listing: newListing
                }
            });            
    

    },
    getListing : async (req, res) => {

        const listing = await Listing.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                listing
            }
        });


    },updateListing : async (req, res) => {
        
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: updatedListing
        }); 

    },deleteListing : async (req, res) => {
    
            await Listing.findByIdAndDelete(req.params.id);
    
            res.status(204).json({
                status: 'success',
                data: null
            });         
        
    }

}


const listingController = loopAndWrapTryCatch(groupedFunctionsObj);

module.exports = listingController;