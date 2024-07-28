import Listing from "../models/listing.model.js"; // Adjust the import based on your models structure
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res) => {
  const {
    userRef,
    name,
    description,
    address,
    quantity,
    regularPrice,
    discountPrice,
    fresh,
    offer,
    fish,
    others,
    imageUrls,
  } = req.body;

  try {
    const newListing = new Listing({
      userRef,
      name,
      description,
      address,
      quantity,
      regularPrice,
      discountPrice,
      fresh,
      offer,
      fish,
      others,
      imageUrls,
    });

    const savedListing = await newListing.save();
    res.status(201).json({ success: true, _id: savedListing._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only delete your listings!"));
  }
  try {
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json("Your Listing has been deleted !");
  } catch (error) {
    next(error);
  }
};
export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, "Listing not found!"));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only update your listings!"));
  }
  try {
    const updateListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updateListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === false) {
      offer = { $in: [false, true] };
    }

    let fish = req.query.fish;

    if (fish === undefined || fish === "false") {
      fish = { $in: [false, true] };
    }

    let others = req.query.others;

    if (others === undefined || others === "false") {
      others = { $in: [false, true] };
    }

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      fish,
      others,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
