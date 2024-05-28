/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const SweetShop = require("../model/sweets.model");

const createSweetShop = async (info) => {
  return asyncHandler(async () => {
    const sweetShop = new SweetShop(info);
    const savedSweetShop = await sweetShop.save();
    return savedSweetShop instanceof SweetShop
      ? savedSweetShop.toJSON()
      : false;
  });
};

const findAndUpdateSweetShop = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findOneAndUpdate(
      findInfo,
      {
        $set: setInfo,
      },
      { new: true, runValidators: true }
    );
    return sweetShop ? sweetShop : false;
  });
};

const findSweetShopById = async (id) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findById({ _id: id }).populate(
      "reviews.user",
      "firstName lastName profilePicture"
    );
    if (sweetShop) {
      let sweetShopObj = sweetShop.toObject();
      sweetShopObj?.reviews &&
        sweetShopObj?.reviews.length > 0 &&
        sweetShopObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (sweetShopObj.images && sweetShopObj.images.length > 0) {
        sweetShopObj.images = sweetShopObj.images.map((img) => {
          return `${base_url}public/data/sweets/${sweetShopObj._id}/${img}`;
        });
      }
      return sweetShopObj;
    } else {
      return false;
    }
  });
};

const findSweetShopsByCity = async (city) => {
  return asyncHandler(async () => {
    const sweetShops = await SweetShop.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .exec();
    if (sweetShops.length > 0) {
      const modifiedSweetShops = sweetShops.map((sweetShop) => {
        let sweetShopObj = sweetShop.toObject();

        sweetShopObj?.reviews &&
          sweetShopObj?.reviews.length > 0 &&
          sweetShopObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (sweetShopObj.images && sweetShopObj.images.length > 0) {
          sweetShopObj.images = sweetShopObj.images.map((img) => {
            return `${base_url}public/data/sweets/${sweetShopObj._id}/${img}`;
          });
        }
        return sweetShopObj;
      });
      return modifiedSweetShops;
    } else {
      return false;
    }
  });
};

const findSweetShopByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const sweetShop = await SweetShop.findById(id);
    return sweetShop ? sweetShop : false;
  });
};

module.exports = {
  createSweetShop,
  findAndUpdateSweetShop,
  findSweetShopsByCity,
  findSweetShopById,
  findSweetShopByIdHelper,
};
