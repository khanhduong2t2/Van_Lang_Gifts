const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const infoSchema = new mongoose.Schema(
    {
        username: {
          type: String,
          required: true,
          minlength: 6,
          maxlength: 20,
          unique: true,
        },
        email: {
          type: String,
          required: true,
          minlength: 10,
          maxlength: 50,
          unique: true,
        },
        name: {
            type: String,
        },
        phone: {
            type: String,
        },
        avatar: {
            type: String,
        },
        facebook: {
            type: String,
        },
        instagram: {
            type: String,
        }
      },
      { timestamps: true }
);

infoSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
  });

module.exports = mongoose.model("Info", infoSchema);
