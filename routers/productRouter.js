const express = require("express");
const Product = require("../models/productModel");

const {
  getProductHandler,
  createProductHandler,
  getProductByIdHandler,
  updateProductByIdHandler,
  deleteProductByIdHandler,
  getProductCategories,
  uploadImage
} = require("../controllers/productController");
const { checkInput } = require("../utils/crudFactory");
const { protectRoute, isAuthorized } = require("../controllers/authController");

const productValidRoles = ["admin", "seller"];

const productRouter = express.Router();

productRouter.get("/", getAllProduts);
productRouter.post(
  "/",
  uploadImage,
  checkInput,
  protectRoute,
  isAuthorized(productValidRoles),
  createProductHandler
);

//Aliasing route

productRouter.get("/bigBillionDay", getBigBillionDayProducts, getAllProduts); // share the same req, res object as getAllProducts

productRouter.get("/categories", getProductCategories);
productRouter.get("/:id", getProductByIdHandler);
productRouter.patch("/:id", updateProductByIdHandler);
productRouter.delete(
  "/:id",
  protectRoute,
  isAuthorized(productValidRoles),
  deleteProductByIdHandler
);

async function getAllProduts(req, res) {
  console.log(req.query);
  const { sort, select, page, limit, filter } = req.query;
  let queryPromise = Product.find()
    .populate("reviews")
    .populate({ path: "images", select: "url" });
  console.log("sort", sort);

  if (sort) {
    const [sortParam, order] = sort.split(" ");
    if (order === "asc") {
      queryPromise = queryPromise.sort(sortParam);
    } else {
      queryPromise = queryPromise.sort(`-${sortParam}`);
    }
  }
  if (select) {
    queryPromise = queryPromise.select(select);
  }

  //For filtering , we will also use MongoDB’s rich set of query operators
  //https://www.mongodb.com/docs/manual/reference/operator/query
  //localhost:3100/api/products?page=2&limit=2&filter={"categories":"electronics", "stock":{"lte":20}}

  if (filter) {
    try {
      console.log("Filter::", filter);
      const filterObj = JSON.parse(filter);

      // replace gt/gte/lt/lte with respective $gt/gte/lt/lte
      const filterObjStr = JSON.stringify(filterObj).replace(
        // loop over the keys in the object and replace the key with $key
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );
      queryPromise = queryPromise.find(JSON.parse(filterObjStr));
    } catch (error) {
      console.error(error);
    }
  }
  const count = await queryPromise.clone().count();

  /**
   * pagination logic will be implemented using limit and skip
   * limit -> number of documents to be returned
   * skip -> number of documents to be skipped
   */
  if (page && limit) {
    const pageNum = page || 1;
    const limitNum = limit || 2;
    const skip = (pageNum - 1) * limitNum;
    queryPromise = queryPromise.skip(skip).limit(limitNum);
  }

  //   queryPromise = queryPromise.count();
  //   const count = await queryPromise.count();
  const result = await queryPromise;
  //.exec();

  res.status(200).json({
    message: "success",
    data: result,
    totalCount: count ?? 0
  });
}

async function getBigBillionDayProducts(req, res, next) {
  req.query.filter = JSON.stringify({ stock: { lte: 20 } });
  next();
}

module.exports = productRouter;
