const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: [1, "Payment amount must be greater than 0"] },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: true }
);

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    totalFees: { type: Number, required: [true, "Total fees amount is required"], min: [0, "Total fees cannot be negative"] },
    payments: [paymentSchema],
  },
  { timestamps: true }
);

feeSchema.virtual("paidAmount").get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
});

feeSchema.virtual("pendingAmount").get(function () {
  return this.totalFees - this.payments.reduce((sum, p) => sum + p.amount, 0);
});

feeSchema.set("toJSON", { virtuals: true });
feeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Fee", feeSchema);
