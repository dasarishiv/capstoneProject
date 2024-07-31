require("dotenv").config();
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");

const express = require("express");
const mongooes = require("mongoose");

const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3100;
const app = express();
app.use(express.static("public"));

const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const authRouter = require("./routers/authRouter");
const bookingRouter = require("./routers/bookingRouter");
const reviewRouter = require("./routers/reviewRouter");
const videoRouter = require("./routers/videoRouter");

const Image = require("./models/imageModel");

/**MongoDB connection */

mongooes
  .connect(process.env.DB_URL)
  .then((connection) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.error("DB connection error:: ", err);
  });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
});
app.use(limiter);
app.use(mongoSanitize());
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

const corsConfig = {
  origin: true,
  credentials: true
};
// this is allowing all the requests
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

//WS

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});
let interval = null;

let room;

io.on("connection", (socket) => {
  console.log("a user connected");
  // socket.emit("message", `Welcome to E-Cap support ${socket.id}`);
  socket.emit("message", `Welcome to E-Cap support`);

  // interval = setInterval(() => {
  //   socket.emit(
  //     "message",
  //     "message from server" + "-" + socket.id + "at" + new Date()
  //   );
  // }, 2000);

  // disconnect event is fired when a user disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected " + socket.id);
    clearInterval(interval);
  });
  const messageBank = [
    "Hello! How can I help you today?",
    "Sure, could you please provide your order ID?",
    "Thank you! Let me check the status for you.",
    "Your order is on its way and should arrive by tomorrow.",
    "You're welcome! Is there anything else I can assist you with?",
    "Sure, please provide the product name or ID."
  ];
  // message event is fired when a user sends a message
  socket.on("message", (data) => {
    // console.log("message: recived::" + data);
    const randomIndex = Math.floor(Math.random() * messageBank.length);

    socket.emit("message", messageBank[randomIndex]);
    // socket.broadcast.emit("broadcast", data);
  });

  /** listen to create grp */
  socket.on("create_grp", (roomId, callback) => {
    console.log("group created", roomId);
    room = roomId;
    socket.join(roomId); // first member of the room
    callback("group created"); // call back way to notify client
  });

  socket.on("join_grp", () => {
    console.log(socket.id + "joined the room " + room);
    socket.join(room); // second member of the room
  });

  socket.on("grp message", (data) => {
    socket.to(room).emit("server_grp_msg", data);
  });

  socket.on("leave_room", () => {
    console.log(socket.id + "left the room " + room);
    socket.leave(room);
  });
});

// ws:end
/** Routes */

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/videos", videoRouter);
app.use("/images/:imageName", async (req, res) => {
  try {
    const { imageName } = req.params;

    const file = await Image.findOne({ url: `/images/${imageName}` });

    if (file) {
      const { img } = file;
      res.set("Content-Type", img.contentType);
      res.set("Content-Length", file.size);
      res.set("Cache-Control", "public, max-age=31536000");
      res.set("Expires", new Date(Date.now() + 31536000000).toUTCString());
      const buffer = Buffer.from(img.data, "base64");

      res.send(buffer);
    } else {
      res.status(404).json({
        message: "Image not found!"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
});

app.use("/api/products", productRouter);
app.use("/search", (req, res) => {
  console.log(req.query);
  res.status(200).json({
    message: "success",
    data: req.query
  });
});

app.use((req, res) => {
  res.status(404).send("Sorry we cannot find that");
});
server.listen(PORT, () => console.log("Application running on ", PORT));
