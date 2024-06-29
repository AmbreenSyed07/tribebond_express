/** @format */

const { asyncHandler } = require("../helper/async-error.helper");
const { base_url } = require("../helper/local.helpers");
const Giveaway = require("../model/freeGiveaway.model");

const createGiveawayItem = async (info) => {
  return asyncHandler(async () => {
    const giveawayItem = new Giveaway(info);

    const savedGiveawayItem = await giveawayItem.save();
    return savedGiveawayItem instanceof Giveaway
      ? savedGiveawayItem.toJSON()
      : false;
  });
};

const findAndUpdateGiveawayItem = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const giveawayItem = await Giveaway.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return giveawayItem ? giveawayItem : false;
  });
};

const findGiveawayItemById = async (id) => {
  return asyncHandler(async () => {
    const giveawayItem = await Giveaway.findOne({ _id: id, status: true })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture");
    if (giveawayItem) {
      let giveawayItemObj = giveawayItem.toObject();

      if (
        giveawayItemObj.createdBy &&
        giveawayItemObj.createdBy.profilePicture &&
        !giveawayItemObj.createdBy.profilePicture.startsWith(base_url)
      ) {
        giveawayItemObj.createdBy.profilePicture = `${base_url}public/data/profile/${giveawayItemObj.createdBy._id}/${giveawayItemObj.createdBy.profilePicture}`;
      }

      giveawayItemObj?.reviews &&
        giveawayItemObj?.reviews.length > 0 &&
        giveawayItemObj?.reviews.forEach((review) => {
          if (
            review.user &&
            review.user.profilePicture &&
            !review.user.profilePicture.startsWith(base_url)
          ) {
            review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
          }
        });

      if (giveawayItemObj.images && giveawayItemObj.images.length > 0) {
        giveawayItemObj.images = giveawayItemObj.images.map((img) => {
          return `${base_url}public/data/giveaway/images/${giveawayItemObj._id}/${img}`;
        });
      }
      return giveawayItemObj;
    } else {
      return false;
    }
  });
};

const findGiveawayItemsByCity = async (city) => {
  return asyncHandler(async () => {
    const giveawayItems = await Giveaway.find({
      city: { $regex: `^${city}$`, $options: "i" },
      status: true,
    })
      .collation({ locale: "en", strength: 2 })
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("reviews.user", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();
    if (giveawayItems.length > 0) {
      const modifiedGiveawayItems = giveawayItems.map((giveawayItem) => {
        let giveawayItemObj = giveawayItem.toObject();

        if (
          giveawayItemObj.createdBy &&
          giveawayItemObj.createdBy.profilePicture &&
          !giveawayItemObj.createdBy.profilePicture.startsWith(base_url)
        ) {
          giveawayItemObj.createdBy.profilePicture = `${base_url}public/data/profile/${giveawayItemObj.createdBy._id}/${giveawayItemObj.createdBy.profilePicture}`;
        }

        giveawayItemObj?.reviews &&
          giveawayItemObj?.reviews.length > 0 &&
          giveawayItemObj?.reviews.forEach((review) => {
            if (
              review.user &&
              review.user.profilePicture &&
              !review.user.profilePicture.startsWith(base_url)
            ) {
              review.user.profilePicture = `${base_url}public/data/profile/${review.user._id}/${review.user.profilePicture}`;
            }
          });

        if (giveawayItemObj.images && giveawayItemObj.images.length > 0) {
          giveawayItemObj.images = giveawayItemObj.images.map((img) => {
            return `${base_url}public/data/giveaway/images/${giveawayItemObj._id}/${img}`;
          });
        }
        return giveawayItemObj;
      });
      return modifiedGiveawayItems;
    } else {
      return false;
    }
  });
};

const findGiveawayItemByIdHelper = async (id) => {
  return asyncHandler(async () => {
    const giveawayItem = await Giveaway.findOne({ _id: id, status: true });
    return giveawayItem ? giveawayItem : false;
  });
};

const searchGiveaways = async (query) => {
  return asyncHandler(async () => {
    const giveaways = await Giveaway.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      status: true,
    })
      .populate("reviews.user", "firstName lastName profilePicture")
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .exec();;
    return giveaways.length > 0
      ? modifyResponse(giveaways, "giveaway")
      : false;
  });
};

module.exports = {
  createGiveawayItem,
  findAndUpdateGiveawayItem,
  findGiveawayItemsByCity,
  findGiveawayItemById,
  findGiveawayItemByIdHelper,
  searchGiveaways,
};
