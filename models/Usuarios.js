const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
});

module.exports = model("User", userSchema);