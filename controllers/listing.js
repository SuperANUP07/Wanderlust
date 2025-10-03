const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing } = require ("../middleware.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", { listing: {} });
};

module.exports.showListing = async (req, res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author",}
    })
    .populate("owner");

    if(!listing){
      req.flash("error", " NOT Found !!!");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
   let response = await geocodingClient
   .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
   })
   .send();
    
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    let savedListing = newListing.geometry = response.body.features[0].geometry;
      console.log(savedListing);
      

    await newListing.save();
    req.flash("success", "New Listing Created !!!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) =>{
   let { id } = req.params;
   const listing = await Listing.findById(id);
   if(!listing){
      req.flash("error", " NOT Found !!!");
      res.redirect("/listings");
    }
   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200");
   res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash("success", "Listing Updated !!!");
    res.redirect(`/listings/${id}`);
    };

module.exports.destroy =  async(req, res) =>{
    let { id } = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !!!");
    res.redirect("/listings");
};

