
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        // Related Problem
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },

        // Student who submitted
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Student's written answer
        answer: {
            type: String,
            trim: true,
            default: ""
        },

        // Uploaded attachments
        attachments: [
            {
                fileName: {
                    type: String,
                    required: true
                },

                originalName: {
                    type: String,
                    required: true
                },

                fileUrl: {
                    type: String,
                    required: true
                },

                mimeType: {
                    type: String,
                    required: true
                },

                size: {
                    type: Number,
                    required: true
                }
            }
        ],

        // Submission review status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        // Admin feedback
        adminFeedback: {
            type: String,
            trim: true,
            default: ""
        },

        // Admin who reviewed
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Review date
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
