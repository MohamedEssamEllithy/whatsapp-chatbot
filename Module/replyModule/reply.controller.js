import replyModel from "../../Database/Schema/replySchema.js";
import { fileName as filename } from "../../middleware/middleware.upload.js";

async function addReply(req, res) {
  try {
    const flag = await replyModel.findOne({
      message: req.body.message,
      userId: req.body.userId,
    });

    if (flag) {
      res.json({
        message: "This message exists before , write unique message",
      });
      return;
    }

    if (!filename) {
      const reply = await replyModel.insertMany([
        { ...req.body, message: req.body.message.toLowerCase() },
      ]);
      res.json({ message: "reply added", reply });
    } else {
      const reply = await replyModel.insertMany([
        {
          reply: filename,
          message: req.body.message.toLowerCase(),
          userId: req.body.userId,
        },
      ]);
      res.status(200).json({ message: "media uploaded" });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

async function updateReply(req, res) {
  try {
    const { reply, message, userId } = req.body;

    if (!message) {
      res.json({ message: " Enter your message" });
    } else {
      const updatedReply = await replyModel.findOneAndUpdate(
        { message: message.toLowerCase(), userId },
        { reply },
        { new: true }
      );
      if (!updatedReply) {
        res.json({ message: "message not found" });
      }
      res.json({ message: "Reply updated", updatedReply });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

async function getAllreplies(req, res) {
  try {
    const { userId } = req.body;
    const allreplies = await replyModel.find({ userId });
    if (allreplies) {
      res.json({ message: "All replies", allreplies });
    } else {
      res.json({ message: " No replies founded" });
    }
  } catch (error) {
    res.json({ message: "error", error });
  }
}

export { addReply, updateReply, getAllreplies };
