if (!"content" in document.createElement("template")) {
  throw new Error(
    "templates are not supported in your browser, please upgrade."
  );
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

class Cart extends EventTarget {
  constructor(initialValue = new Map()) {
    super();
    this.cart = initialValue;
  }

  #emitChange(cartItem, status) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: cartItem, values: this.cart.values(), status },
      })
    );
  }

  addToCart({ id, price, title, qty = 1 }) {
    let newCartItem;
    if (this.cart.has(id)) {
      const old = this.cart.get(id);
      newCartItem = { ...old, qty: old.qty + qty };
    } else {
      newCartItem = { id, price, title, qty };
    }
    this.#emitChange(newCartItem, "added");
    this.cart.set(id, newCartItem);
  }

  removeFromCart(id) {
    let removedCartItem;
    if (!this.cart.has(id)) {
      throw new Error(`cart has no member by ${id}.`);
    }
    const val = this.cart.get(id);
    this.cart.delete(id);
    this.#emitChange(val, "removed");
  }
}

const cart = new Cart();

fetch("https://fakestoreapi.com/products")
  .then((res) => res.json())
  .then((storeItems) => {
    if (!Array.isArray(storeItems)) {
      throw new Error(
        `Did not receive expected output!\nExpected: [array], received ${typeof storeItems}`
      );
    }
    const template = document.querySelector("#product");
    const list = document.createElement("ul");

    storeItems.forEach((item) => {
      const productTemplate = template.content.cloneNode(true);
      const product = productTemplate.querySelector(".product");
      product.dataset.item_id = item.id;

      const rating = product.querySelector(".text small");
      rating.textContent = item.rating.rate;

      const title = product.querySelector(".text a");
      title.textContent = item.title;
      // title.setAttribute('href', '')

      const price = product.querySelector(".text span");
      price.textContent = formatter.format(item.price);

      const button = product.querySelector(".text button");
      const addToCart = () =>
        cart.addToCart({
          id: item.id,
          price: item.price,
          title: item.title,
          qty: 1,
        });
      button.addEventListener("click", addToCart);

      const image = product.querySelector(".image img");
      image.setAttribute("src", item.image);

      list.appendChild(product);
    });

    document.querySelector("#products").appendChild(list);
  });

let cartElement;
cart.addEventListener("change", ({ detail }) => {
  const { value, status } = detail;

  const createCartElement = ({ id, title, price }) => {
    const cartItem = document.createElement("li");
    cartItem.dataset.item_id = id;
    cartItem.textContent = title;

    const priceElement = document.createElement("span");
    priceElement.textContent = price;
    cartItem.appendChild(priceElement);

    cartElement.appendChild(cartItem);
  };

  if (!cartElement) {
    cartElement = document.createElement("ul");
    for (const values of detail.values) {
      createCartElement(values);
    }
    document.querySelector("#cart").appendChild(cartElement);
  }

  if (status === "added") {
    createCartElement(value);
  }
  if (status === "removed") {
    cartElement.querySelector(`[data-item_id="${value.id}"]`).remove();
  }
});
