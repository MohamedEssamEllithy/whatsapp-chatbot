import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const replyModel = mongoose.model("Reply", replySchema);

export default replyModel;
