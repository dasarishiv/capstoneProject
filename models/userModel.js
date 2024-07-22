const mongoose = require("mongoose"); // commonjs module

/**
 * require vs imports ->
 * import is ES6 module
 * require is commonjs module
 * import is done at compilation time
 * require is done at runtime
 */

const bcrypt = require("bcrypt");

/** schemas */
/** Schema */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
      minLength: 10
    },
    password: {
      type: String,
      required: [true, "User password required"],
      minLength: 8
    },
    confirmPassword: {
      type: String,
      minLength: 8
      // validate: {
      //   validator: function (v) {
      //     return this.password === this.confirmPassword;
      //   },
      //   message: "Password and confirm password should be same"
      // }
    },
    token: String,
    otpExpiry: Date,
    role: {
      type: String,
      default: "user"
    },
    bookings: {
      type: [mongoose.Schema.ObjectId],
      ref: "Booking"
    }
  },
  { timestamps: { createdAt: "createAt" } }
);

const validRoles = ["admin", "user", "sales"];

/** Models */
userSchema.pre("save", async function (next) {
  console.log("cf", this.confirmPassword);
  console.log("password", this.password);
  if (this.password !== this.confirmPassword) {
    next(new Error("Password and confirm password should be same"));
  }

  this.confirmPassword = undefined;
  /** hash the password */
  const hashedPassword = await bcrypt.hash(this.password, 12);
  console.log("hashedPassword", hashedPassword);
  this.password = hashedPassword;
  // this.confirmPassword = undefined;
  if (this.role) {
    const isValidRole = validRoles.includes(this.role);
    if (!isValidRole) {
      throw new Error(`Invalid Role ${this.role}`);
    } else {
      next();
    }
  } else {
    this.role = "user";
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
