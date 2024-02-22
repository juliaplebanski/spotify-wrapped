var mongoose = require("mongoose");

var profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  display_name: String,
  email: String,
  topArtists: String,
  
},{
    timestamps: true,
  });

var profile = new mongoose.model("Profile", profileSchema);

module.exports = profile;
