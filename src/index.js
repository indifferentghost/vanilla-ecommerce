if ((!"content") in document.createElement("template")) {
  throw new Error(
    "templates are not supported in your browser, please upgrade.",
  );
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

fetch("https://fakestoreapi.com/products")
  .then((res) => res.json())
  .then((storeItems) => {
    if (!Array.isArray(storeItems)) {
      throw new Error(`Did not receive expected output!\nExpected: [array], received ${typeof storeItems}`);
    }
    const template = document.querySelector("#product");
    const list = document.createElement('ul');
    storeItems.forEach(item => {
      const productTemplate = template.content.cloneNode(true);
      const product = productTemplate.querySelector('.product');
      // card.dataset.item_id = item.id;
      
      const rating = product.querySelector('.text small');
      rating.textContent = item.rating.rate;

      const title = product.querySelector('.text a');
      title.textContent = item.title;
      // title.setAttribute('href', '')

      const price = product.querySelector('.text span');
      price.textContent = formatter.format(item.price);

      const image = product.querySelector('.image img');
      image.setAttribute('src', item.image);

      list.appendChild(product);
    });

    document.querySelector('#products').appendChild(list);
  });
/**
 *
 *   <li class="card">
    <div class="text">
      <small></small>
      <h3>
        <a href></a>
      </h3>
      <span></span>
      <button>Add to cart</button>
    </div>
    <div class="image">
      <img src />
    </div>
  </li>
 */
