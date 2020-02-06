const express = require('express');

const { upload, cloudinaryResizeAndUploadImages } = require('../utils/imageUploadUtils');

const listingController = require('../controllers/listingController');

const router = express.Router();

// router.param('id', listingController.checkID);

//https://stackoverflow.com/questions/40215527/file-upload-with-multer-that-contains-input-name-array
router.route('/')
    .get(listingController.getAllListings)
    .post(upload.any(),
        //   listingController.resizeImages,
          cloudinaryResizeAndUploadImages, 
          listingController.createListing);

router.route('/:id')
    .get(listingController.getListing)
    .patch(listingController.updateListing)
    .delete(listingController.deleteListing);

module.exports = router;