// "use strict";

// const checkOutBtn = document.querySelector(".checkout-btn");

// checkOutBtn.addEventListener("click", function (e) {
//   e.preventDefault();
//   console.log("Click");

//   // 1. make a request to server at the url I create /create-checkout-session
//   fetch("/create-checkout-session", {
//     method: "POST",
//     headers: {
//       // This tells fetch that you're passing json
//       "Content-Type": "application/json",
//     },
//     // 2. send along the id and the quantity of all the different items you want to buy
//     body: JSON.stringify({
//       items: [
//         { id: 1, quantity: 3 },
//         { id: 2, quantity: 1 },
//       ],
//     }),
//   })
//     // 3. making sure you redirect the user if this is a successful request
//     .then((res) => {
//       if (res.ok) return res.json();
//       return res.json().then((json) => Promise.reject(json));
//     })
//     .then(({ url }) => {
//       //   console.log(url);
//       window.location = url;
//     })
//     .catch((e) => {
//       console.error(e.error);
//     });
// });
