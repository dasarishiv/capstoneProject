const express = require("express");
const { getVideoByIdHandler } = require("../controllers/videoController");

const videoRouter = express.Router();

/** routes for videoRouter */

videoRouter.get("/:id", getVideoByIdHandler);

module.exports = videoRouter;
