require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

require("./model/index");
const Chat = require("./model/chat.model");

// Middleware to parse JSON bodies
const fileUpload = require("express-fileupload");
const path = require("path");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors("*"));

// Define server port
const PORT = process.env.PORT || 8713;

const apiRoutes = require("./routes/api.routes");
const { sendResponse } = require("./helper/local.helpers");
const { modules } = require("./constants/local-business.constants");

app.use("/api", apiRoutes);

// io.on("connection", (socket) => {
//   console.log("a user connected");

//   socket.on("chatMessage", ({ senderId, receiverId, message, moduleId }) => {
//     let moduleName = modules.find((el) => el.id == moduleId);
//     const chat = new Chat({
//       senderId,
//       receiverId,
//       message,
//       moduleName,
//       moduleId,
//     });
//     chat.save().then(() => {
//       io.emit("message", { user, message });
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on(
    "chatMessage",
    async ({ senderId, receiverId, message, moduleId }) => {
      try {
        let module = modules.find((el) => el.id == moduleId);
        if (!module) {
          throw new Error(`Module with id ${moduleId} not found`);
        }
        const chat = new Chat({
          senderId,
          receiverId,
          message,
          moduleName: module.moduleName,
          moduleId,
        });
        await chat.save();
        io.emit("message", {
          senderId,
          receiverId,
          message,
          moduleId,
          moduleName: module.moduleName,
        });
      } catch (error) {
        console.error("Error saving chat message:", error.message);
        socket.emit("errorMessage", { error: error.message });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});


app.all("*", function (req, res) {
  return sendResponse(res, 404, false, "Page Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
