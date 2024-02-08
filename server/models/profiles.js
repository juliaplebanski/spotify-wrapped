var mongoose = require("mongoose");

var profileSchema = new mongoose.Schema({
  display_name: String,
  email: String,
  topArtists: String,
});

var profile = new mongoose.model("Profile", profileSchema);

module.exports = profile;
