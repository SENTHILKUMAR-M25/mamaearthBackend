const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ FIXED userId generator
userSchema.pre("save", async function () {
  if (!this.userId) {
    try {
      const lastUser = await mongoose
        .model("User")
        .findOne({}, {}, { sort: { createdAt: -1 } });

      let newIdNumber = 1;

      if (lastUser && lastUser.userId) {
        const parts = lastUser.userId.split("-");

        const lastNumber = parseInt(parts[1], 10) || 0; // ✅ FIX

        newIdNumber = lastNumber + 1;
      }

      this.userId = `MME-${String(newIdNumber).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating userId:", err);
      throw err;
    }
  }
});

module.exports = mongoose.model("User", userSchema);