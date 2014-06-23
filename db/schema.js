(function() {
  var ReviewSchema, Schema, mongoose;

  mongoose = require("mongoose");

  Schema = mongoose.Schema;

  ReviewSchema = new Schema({
    service_id: {
      type: Number,
      "default": 1
    },
    author: {
      type: String,
      "default": ""
    },
    rating: {
      type: Number,
      "default": 0
    },
    version: {
      type: String,
      "default": ""
    },
    title: {
      type: String,
      "default": ""
    },
    content: {
      type: String,
      "default": ""
    },
    found_at: {
      type: Date,
      "default": new Date()
    }
  });

  module.exports = {
    Review: ReviewSchema
  };

}).call(this);
