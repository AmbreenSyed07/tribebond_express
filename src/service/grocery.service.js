const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Grocery = require("../model/grocery.model");

const createGrocery = async (info) => {
  return asyncHandler(async () => {
    const grocery = new Grocery(info);

    const savedGrocery = await grocery.save();
    return savedGrocery instanceof Grocery ? savedGrocery.toJSON() : false;
  });
};

const findAndUpdateGrocery = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return grocery ? grocery : false;
  });
};

const findGroceryById = async (id) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (grocery) {
      let groceryObj = grocery.toObject();
      groceryObj?.reviews &&
        groceryObj?.reviews.length > 0 &&
        groceryObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (groceryObj.thumbnail) {
        // Modify the thumbnail path
        groceryObj.thumbnail = `${base_url}public/data/grocery/thumbnail/${groceryObj._id}/${groceryObj.thumbnail}`;
      }
      if (groceryObj.images && groceryObj.images.length > 0) {
        groceryObj.images = groceryObj.images.map((img) => {
          return `${base_url}public/data/grocery/images/${groceryObj._id}/${img}`;
        });
      }
      return groceryObj;
    } else {
      return false;
    }
  });
};

const findGroceriesByCity = async (city) => {
  return asyncHandler(async () => {
    const groceries = await Grocery.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    // return groceries.length > 0 ? groceries : false;
    if (groceries.length > 0) {
      // Map through groceries and check for a thumbnail
      const modifiedGroceries = groceries.map((grocery) => {
        let groceryObj = grocery.toObject();

        groceryObj?.reviews &&
          groceryObj?.reviews.length > 0 &&
          groceryObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (groceryObj.thumbnail) {
          // Modify the thumbnail path
          groceryObj.thumbnail = `${base_url}public/data/grocery/thumbnail/${groceryObj._id}/${groceryObj.thumbnail}`;
        }
        if (groceryObj.images && groceryObj.images.length > 0) {
          groceryObj.images = groceryObj.images.map((img) => {
            return `${base_url}public/data/grocery/images/${groceryObj._id}/${img}`;
          });
        }
        return groceryObj; // Return the original grocery if no thumbnail
      });
      return modifiedGroceries;
    } else {
      return false;
    }
  });
};

const findGroceryByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const grocery = await Grocery.findById(id);
    return grocery ? grocery : false;
  });
};

module.exports = {
  createGrocery,
  findAndUpdateGrocery,
  findGroceriesByCity,
  findGroceryById,
  findGroceryByIdHelper,
};