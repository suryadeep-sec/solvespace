const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
