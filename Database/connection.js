import mongoose from "mongoose";

export default function connect() {
  mongoose
    .connect(
      "mongodb+srv://whatsAppBot:whatsAppBot@cluster0.cxwngfz.mongodb.net/whatsAppBot"
    )
    .then(() => {
      console.log("Database Connected");
    })
    .catch((err) => console.log(err));
}
