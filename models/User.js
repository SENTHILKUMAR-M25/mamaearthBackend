const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// ✅ Safe async pre-save hook (Mongoose 7+)
userSchema.pre("save", async function() {
  if (!this.userId) {
    try {
      const lastUser = await mongoose.model("User")
        .findOne({}, {}, { sort: { createdAt: -1 } }); // get last created user
      let newIdNumber = 1;
      if (lastUser && lastUser.userId) {
        const parts = lastUser.userId.split("-");
        const lastNumber = parseInt(parts[2], 10);
        newIdNumber = lastNumber + 1;
      }
      this.userId = `userId-MME-${String(newIdNumber).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating userId:", err);
      throw err; // Let Mongoose handle the error
    }
  }
});

module.exports = mongoose.model("User", userSchema);