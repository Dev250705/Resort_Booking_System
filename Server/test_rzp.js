const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_Sbojm7oNvOFLyi",
  key_secret: "isdzb8tdPL4mdn4C0fCwnMcg",
});
instance.orders.create({
  amount: 50000,
  currency: "INR",
  receipt: "receipt_test",
}).then(console.log).catch(console.error);
