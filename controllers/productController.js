const fs = require("fs");
const {
  getAllFactory,
  createFactory,
  getElementByIdFactory,
  deleteElementByIdFactory,
  updateElementByIdFactory
} = require("../utils/crudFactory");
const { validProductCategories } = require("../utils/constants");

//file storage
const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   }
// });
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});
// const storage = multer.memoryStorage();
// const uploadImage = multer({ storage }).single("image");
const uploadImage = multer({
  storage,
  limits: {
    fileSize: 1000000 // in bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(undefined, true);
  }
}).single("image");

const Product = require("../models/productModel");
const Image = require("../models/imageModel");

/** Route handlers */

const getProductHandler = getAllFactory(Product);

const createProductHandler = async (req, res) => {
  console.log("callint createProductHandler::", req);
  try {
    const {
      name,
      description,
      sortDescription,
      price,
      categories,
      discount,
      stock,
      brand,
      imgWidth,
      imgHeight,
      imgName
    } = req.body;

    console.log(req.body);
    console.log(req.file);
    let uploadedImage = null;
    if (req.file) {
      const { filename, size, mimetype: contentType, path } = req.file;
      uploadedImage = await Image.create({
        name: imgName ?? filename,
        dimentions: {
          w: imgWidth,
          h: imgHeight
        },
        size,
        img: {
          data: fs.readFileSync(path),
          contentType
        },
        url: `/images/${filename}`
      });

      fs.unlink(req.file.path, function (err) {
        if (err) console.error(err);
      });

      // uploadImage(req, res, function (err) {
      //   if (err instanceof multer.MulterError) {
      //     throw err;
      //     // A Multer error occurred when uploading.
      //   } else if (err) {
      //     throw err;
      //     // An unknown error occurred when uploading.
      //   }
    }

    const product = await Product.create({
      name,
      description,
      sortDescription,
      price,
      categories,
      discount,
      stock,
      brand,
      images: uploadedImage ? [uploadedImage._id] : []
    });

    res.status(201).json({
      message: "success",
      product: {
        ...product._doc,
        images: uploadedImage ? [{ url: uploadedImage.url }] : []
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getProductByIdHandler = getElementByIdFactory(Product);

const updateProductByIdHandler = updateElementByIdFactory(Product);

const deleteProductByIdHandler = deleteElementByIdFactory(Product);

const getProductCategories = async (req, res) => {
  res.json({
    message: "success",
    data: validProductCategories
  });
};

module.exports = {
  uploadImage,
  getProductHandler,
  createProductHandler,
  getProductByIdHandler,
  updateProductByIdHandler,
  deleteProductByIdHandler,
  getProductCategories
};
