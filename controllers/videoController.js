require("dotenv").config();
const fs = require("fs");
const path = require("path");

/** video related handlers */
const CHUNK_SIZE = 10 ** 6; // 1mb

const getVideoByIdHandler = async function (req, res) {
  try {
    const { id } = req.params;
    const { range: videoRange } = req.headers;
    const videoPath = path.join(__dirname, `../assets/${id}.mp4`);

    const videoStat = fs.statSync(videoPath);

    const fileSize = videoStat.size;

    if (videoRange) {
      const start = Number(videoRange.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

      const contentLength = end - start + 1;

      const videoFile = fs.createReadStream(videoPath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,

        "Accept-Ranges": "bytes",

        "Content-Length": contentLength,

        "Content-Type": "video/mp4",
        "Access-Control-Allow-Origin": "*"
      };

      res.writeHead(206, head);

      videoFile.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "video/mp4"
      };

      res.writeHead(200, head);

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
      status: "success"
    });
  }
};

module.exports = {
  getVideoByIdHandler
};
