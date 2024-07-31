const mongoose = require("mongoose");
const { validProductCategories } = require("../utils/constants");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    unique: true
  },
  sortDescription: {
    type: String,
    required: [true, "A product must have a short description"]
  },
  description: {
    type: String,
    required: [true, "A product must have a description"]
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
    validate: {
      validator: function () {
        return this.price > 0;
      },
      message: "Price must be greater than 0"
    }
  },
  categories: {
    required: [true, "A product must have a category"],
    type: [String]
  },
  images: {
    type: [mongoose.Schema.ObjectId],
    ref: "Image"
  },
  discount: {
    type: Number,
    validate: {
      validator: function () {
        return this.discount < this.price;
      },
      message: "Discount must be less than price"
    }
  },
  stock: {
    type: Number,
    required: [true, "A product must have a stock"]
  },
  brand: {
    type: String,
    required: [true, "A product must have a brand"]
  },
  reviews: {
    type: [mongoose.Schema.ObjectId],
    ref: "Review"
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
});

productSchema.pre("save", function (next) {
  // cehck if there is any category which is not a valid
  // in case there is a invalid -> throw error
  // else -> proceed
  const invalidCategories = this.categories.filter(
    (category) => !validProductCategories.includes(category)
  );
  if (invalidCategories.length > 0) {
    throw new Error(`Invalid categories ${invalidCategories.join(",")}`);
  } else {
    next();
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
