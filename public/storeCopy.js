"use strict";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  const cartTotalPrice = document.querySelector(".cart-total-price");
  const removeCartItemButtons = document.querySelectorAll(".btn-danger");
  const cartQuantityInput = document.querySelectorAll(".cart-quantity-input");

  cartQuantityInput.forEach((el) => {
    el.addEventListener("input", function () {
      const input = el;
      input.addEventListener("change", quantityChange);
    });
  });

  if (cartTotalPrice.innerHTML !== Number) {
    document.querySelector(".cart-total-title").style.display = "none";
  }

  //Clearing the cart once purchase button is clicked
  //prettier-ignore
  document.querySelector(".btn-purchase").addEventListener("click", purchaseClicked);

  const stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: "auto",
    token: function (token) {
      const items = [];
      const cartItemContainer = document.querySelector(".cart-items");
      const cartRows = cartItemContainer.querySelectorAll(".cart-row");

      cartRows.forEach((el) => {
        const cartRow = el;
        const quantityElement = cartRow.querySelector(".cart-quantity-input");
        const quantity = quantityElement.value;
        const id = cartRow.dataset.itemId;
        items.push({
          id: id,
          quantity: quantity,
        });
      });
      console.log(token);
      console.log(items);

      fetch("/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          stripeTokenId: token.id,
          items: items,
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          alert(data.message);
          const cartItems = document.querySelector(".cart-items");
          while (cartItems.hasChildNodes()) {
            cartItems.removeChild(cartItems.firstChild);
          }
          updateCartTotal();
        })
        .catch(function (error) {
          console.error(error);
        });
    },
  });

  function purchaseClicked() {
    const priceElement = document.querySelector(".cart-total-price");
    const price = parseFloat(priceElement.innerHTML.replace("$", "")) * 100;
    stripeHandler.open({
      amount: price,
    });
  }

  function removeCartItem() {
    removeCartItemButtons.forEach((el) => {
      el.addEventListener("click", function (e) {
        const buttonClicked = e.target.closest(".btn-danger");

        if (buttonClicked) {
          const cartRow = buttonClicked.closest(".cart-row");
          if (cartRow) {
            cartRow.remove();
            updateCartTotal();
          }
        }
      });
    });
  }
  removeCartItem();

  function quantityChange(event) {
    const input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
      console.log("Not", input.value);
      input.value = 1;
    }
    updateCartTotal();
  }

  const addToCartButtons = document.querySelectorAll(".shop-item-button");

  addToCartButtons.forEach((el) => {
    el.addEventListener("click", addToCartClicked);
  });

  function addToCartClicked(event) {
    const button = event.target;
    const shopItem = button.parentElement.parentElement;
    const title = shopItem.querySelectorAll(".shop-item-title")[0].innerText;
    const price = shopItem.querySelectorAll(".shop-item-price")[0].innerText;
    const imageSrc = shopItem.querySelectorAll(".shop-item-image")[0].src;
    const id = shopItem.dataset.itemId;
    addItemToCart(title, price, imageSrc, id);
    updateCartTotal();
  }

  function addItemToCart(title, price, imageSrc, id) {
    const cartRow = document.createElement("div");
    cartRow.innerText = title;
    cartRow.classList.add("cart-row");
    cartRow.dataset.itemId = id;
    const cartItems = document.querySelector(".cart-items");
    const cartItemNames = cartItems.querySelectorAll(".cart-item-title");
    let isItemInCart = false;

    cartItemNames.forEach((el) => {
      if (el.innerText === title) {
        //prettier-ignore
        document.querySelector(".cart-duplicates-alert").classList.remove("display-none");

        setInterval(function () {
          //prettier-ignore
          document.querySelector(".cart-duplicates-alert").classList.add("display-none");
        }, 5000);
        isItemInCart = true;
        return;
      }
    });

    if (isItemInCart) {
      return;
    }

    const html = ` 
    <div class="cart-item cart-column">
        <img
      class="cart-item-image"
      src=${imageSrc}
      width="100"
      height="100"
        />
        <span class="cart-item-title">${title}</span>
    </div>
    <span class="cart-price cart-column">${price}</span>
    <div class="cart-quantity cart-column">
        <input class="cart-quantity-input" type="number" value="1" />
        <button class="btn btn-danger" type="button">REMOVE</button>
    </div>`;

    cartRow.innerHTML = html;
    cartItems.append(cartRow);

    const removeButton = cartRow.querySelector(".btn-danger");
    const cartQuantity = cartRow.querySelector(".cart-quantity-input");

    removeButton.addEventListener("click", function () {
      cartRow.remove();

      updateCartTotal();
    });
    cartQuantity.addEventListener("change", quantityChange);
  }

  function updateCartTotal() {
    let total = 0;
    document.querySelectorAll(".cart-row").forEach((row) => {
      const rowPriceElement = row.querySelector(".cart-price");
      const rowQuantityElement = row.querySelector(".cart-quantity-input");
      if (rowPriceElement && rowQuantityElement) {
        const rowPrice = Number.parseFloat(
          row.querySelector(".cart-price").innerText.slice(1)
        );
        const rowQuantity = +row.querySelector(".cart-quantity-input").value;
        total += rowPrice * rowQuantity;
      }
    });

    if (total === 0) {
      cartTotalPrice.innerHTML = "Add items to cart.";
      document.querySelector(".cart-row-titles").style.display = "none";
      document.querySelector(".cart-total-title").style.display = "none";
    }
    if (total > 0) {
      document.querySelector(".cart-row-titles").style.display = "flex";
      document.querySelector(".cart-total-title").style.display = "flex";

      cartTotalPrice.innerHTML =
        "$" + (Math.round(total * 100) / 100).toFixed(2);
    }
  }
}
