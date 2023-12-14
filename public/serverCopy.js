require("dotenv").config();

const stripeSecretKey = process.env.STRIPE_PRIVATE_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripeSecretKey);
console.log(stripePublicKey);

const express = require("express");
const { create } = require("yallist");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.static("public")); // This says that all the client side code is inside the folder called public
app.set("view engine", "ejs");

const stripe = require("stripe")(stripeSecretKey);

const storeItems = new Map([
  [1, { priceInCents: 20000, name: "Learn React today" }],
  [2, { priceInCents: 10000, name: "Learn CSS Today" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  // req is for the objects in the fetch method in the checkoutPage file and res is for the code in the then method in the checkoutPage file that outlines what happens if the request is successful
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        // body.items comes from the checkoutPage file
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
      //   allow_promotion_codes: true,
      discounts: [
        {
          coupon: "abc",
        },
      ],
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", function (req, res) {
  res.send("Welcome");
});

app.get("/store", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data),
      });
    }
  });
});

app.post("/purchase", function (req, res) {
  fs.readFile("items.json", function (error, data) {
    if (error) {
      res.status(500).end();
    } else {
      console.log("purchase!!");
      const itemsJson = JSON.parse(data);
      const itemsArray = itemsJson.music.concat(itemsJson.merch);
      let total = 0;
      req.body.items.forEach((item) => {
        const itemJson = itemsArray.find(function (i) {
          return i.id === item.id;
        });
        total = total + itemJson.price * item.quantity;
      });

      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd",
        })
        .then(function () {
          console.log("Charge Successful");
          res.json({ message: "Successfully purchased items" });
        })
        .catch(function () {
          console.log("Chage failed");
          res.status(500).end();
        });
    }
  });
});

app.listen(3000); // localhost:3000/ is typed in the web browser to load the page
