const Listing = require("../models/listing.js");
const Review = require("../models/review.js")
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview); 
    await newReview.save().catch(err => {
      throw new ExpressError(400, "Invalid review data");
    });  
    await listing.save().catch(err => {
      throw new ExpressError(500, "Failed to update listing");
    });
    req.flash("success", "New Review Created !!!");
    res.redirect(`/listings/${listing.id}`);
  }

  module.exports.destroy = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted !!!");
    res.redirect(`/listings/${id}`);
};