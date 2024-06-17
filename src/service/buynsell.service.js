/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const BuyNSell = require("../model/buynsell.model");
const { base_url } = require("../helper/local.helpers");

const createBuyNSell = async (itemData) => {
  return asyncHandler(async () => {
    const item = new BuyNSell(itemData);
    const savedItem = await item.save();
    return savedItem instanceof BuyNSell ? savedItem.toJSON() : false;
  });
};

const findAndUpdateBuyNSell = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const item = await BuyNSell.findOneAndUpdate(
      findInfo,
      { $set: setInfo },
      { new: true, runValidators: true }
    );
    return item ? item : false;
  });
};

const findBuyNSellById = async (id) => {
  return asyncHandler(async () => {
    let buyNSellRecord = await BuyNSell.findOne({ _id: id, status: true })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();
    if (buyNSellRecord) {
      let buyNSellRecordObj = buyNSellRecord.toObject();

      if (
        buyNSellRecordObj.createdBy &&
        buyNSellRecordObj.createdBy.profilePicture &&
        !buyNSellRecordObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        buyNSellRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${buyNSellRecordObj.createdBy._id}/${buyNSellRecordObj.createdBy.profilePicture}`;
      }

      buyNSellRecordObj?.reviews &&
        buyNSellRecordObj?.reviews.length > 0 &&
        buyNSellRecordObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (buyNSellRecordObj.images && buyNSellRecordObj.images.length > 0) {
        buyNSellRecordObj.images = buyNSellRecordObj.images.map((img) => {
          return `${base_url}public/data/buynsell/${buyNSellRecordObj._id}/${img}`;
        });
      }
      return buyNSellRecordObj;
    } else {
      return false;
    }
  });
};

const findBuyNSellByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const buyNSellRecord = await BuyNSell.findOne({ _id: id, status: true });
    return buyNSellRecord ? buyNSellRecord : false;
  });
};

const findBuyNSellByLocation = async (location) => {
  return asyncHandler(async () => {
    const buyNSellRecords = await BuyNSell.find({
      location: { $regex: `^${location}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    if (buyNSellRecords.length > 0) {
      const modifiedBuyNSellRecords = buyNSellRecords.map((buyNSellRecord) => {
        let buyNSellRecordObj = buyNSellRecord.toObject();

        if (
          buyNSellRecordObj.createdBy &&
          buyNSellRecordObj.createdBy.profilePicture &&
          !buyNSellRecordObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          buyNSellRecordObj.createdBy.profilePicture = `${base_url}public/data/profile/${buyNSellRecordObj.createdBy._id}/${buyNSellRecordObj.createdBy.profilePicture}`;
        }

        buyNSellRecordObj?.reviews &&
          buyNSellRecordObj?.reviews.length > 0 &&
          buyNSellRecordObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (buyNSellRecordObj.images && buyNSellRecordObj.images.length > 0) {
          buyNSellRecordObj.images = buyNSellRecordObj.images.map((img) => {
            return `${base_url}public/data/buynsell/${buyNSellRecordObj._id}/${img}`;
          });
        }
        return buyNSellRecordObj;
      });
      return modifiedBuyNSellRecords;
    } else {
      return false;
    }
  });
};

const searchBuyNSellRecords = async (query) => {
  return asyncHandler(async () => {
    const buyNSellRecords = await BuyNSell.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
      status: true,
    }).exec();

    return buyNSellRecords;
  });
};

module.exports = {
  createBuyNSell,
  findAndUpdateBuyNSell,
  findBuyNSellById,
  findBuyNSellByIdHelper,
  findBuyNSellByLocation,
  searchBuyNSellRecords,
};
