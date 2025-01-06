// Function to format price in VND currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Fetching data from product.json
const fetchData = async () => {
  try {
    const response = await fetch('../product.json');  // Make sure the path is correct
    const data = await response.json();
    const groupedProducts = groupByType(data);
    renderProducts(groupedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Group products by type
const groupByType = (products) => {
  const groupedProducts = {};
  products.forEach((product) => {
    if (!groupedProducts[product.products_type]) {
      groupedProducts[product.products_type] = [];
    }
    groupedProducts[product.products_type].push(product);
  });
  return groupedProducts;
};

// Render products to the HTML
const renderProducts = (groupedProducts) => {
  const productListContainer = document.getElementById('product-list');
  Object.keys(groupedProducts).forEach(type => {
    const typeSection = document.createElement('div');
    const heading = document.createElement('div');
    heading.classList.add('heading-list');
    heading.innerHTML = `<a id="link-${type}">${type}</a>`;
    typeSection.appendChild(heading);

    const row = document.createElement('div');
    row.classList.add('row');

    groupedProducts[type].forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('col-xl-3', 'col-md-4', 'col-sm-6');
      productCard.style.height = '490px';

      productCard.innerHTML = `
          <div class="card" style="height: 470px;">
            <img src="${product.products_image}" class="card-img-top" alt="${product.products_name}">
            <div class="card-body">
              <h5 class="mb-0" style="font-size: 16px; font-weight: 400; padding-bottom: 10px;">
                ${product.products_name}
              </h5>
              <h5 class="text-dark mb-0" style="font-size: 16px; font-weight: 600;">
                ${formatPrice(product.products_price)}
              </h5>
              <div class="d-flex justify-content-center align-items-center mt-5 ">
                <a href="detail.html?products_id=${product.products_id}" class="product-link">
                  <button class="detail">Xem chi tiết</button>
                </a>
              </div>
            </div>
          </div>
        `;
      row.appendChild(productCard);
    });

    typeSection.appendChild(row);
    productListContainer.appendChild(typeSection);
  });
};

// Call the fetchData function when the page loads
window.onload = fetchData;
