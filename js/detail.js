// Fetch dữ liệu từ file JSON
fetch("../product.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Không thể tải dữ liệu!");
    }
    return response.json();
  })
  .then((data) => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("products_id"));

    // Tìm sản phẩm theo ID
    const product = data.find((item) => item.products_id === productId);

    if (product) {
      // Hiển thị thông tin sản phẩm
      document.getElementById("product-image").src = product.products_image;
      document.getElementById("product-name").textContent =
        product.products_name;
      document.getElementById("product-price").textContent = `${product.products_price} VND`;
      document.getElementById("product-type").textContent = `Loại: ${product.products_type}`;
    } else {
      // Nếu không tìm thấy sản phẩm
      document.querySelector(".container").innerHTML =
        "<p>Sản phẩm không tồn tại!</p>";
    }
  })
  .catch((error) => {
    console.error("Lỗi:", error);
    document.querySelector(".container").innerHTML =
      "<p>Không thể tải dữ liệu sản phẩm!</p>";
  });
let amount = 1; // Mặc định số lượng khi thêm vào giỏ hàng (có thể thay đổi từ nút + / -)

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart() {
  const cartCountElement = document.querySelector(".cart-count");
  const amount = parseInt(document.getElementById("amount").textContent) || 1;

  // Lấy số lượng hiện tại từ localStorage (nếu có)
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Lấy sản phẩm từ API hoặc dữ liệu đã fetch (giả sử có giá trị products_id từ query string)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("products_id"));

  // Lấy thông tin sản phẩm từ dữ liệu đã fetch hoặc product.json
  fetch("../product.json")
    .then(response => response.json())
    .then(data => {
      const product = data.find(item => item.products_id === productId);

      if (product) {
        // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
        const existingProductIndex = cart.findIndex(item => item.products_id === productId);

        if (existingProductIndex !== -1) {
          // Nếu sản phẩm đã có trong giỏ, tăng số lượng
          cart[existingProductIndex].quantity += amount;
        } else {
          // Nếu chưa có sản phẩm trong giỏ, thêm mới
          cart.push({
            products_id: product.products_id,
            products_name: product.products_name,
            products_image: product.products_image,
            products_price: product.products_price,
            quantity: amount
          });
        }

        // Lưu giỏ hàng vào localStorage
        localStorage.setItem("cart", JSON.stringify(cart));

        // Cập nhật cart-count (số lượng sản phẩm trong giỏ)
        updateCartCount();

        // Reset `amount` về 1 sau khi thêm vào giỏ
        document.getElementById("amount").textContent = 1;
      }
    })
    .catch(error => {
      console.error("Error fetching product:", error);
    });
}

// Hàm cập nhật số lượng giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElement = document.querySelector(".cart-count");

  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }

  // Lưu cartCount vào localStorage để duy trì dữ liệu qua các trang
  localStorage.setItem("cartCount", cartCount);
}

// Hàm tăng số lượng sản phẩm
function increaseAmount() {
  amount++;
  document.getElementById("amount").textContent = amount;
}

// Hàm giảm số lượng sản phẩm
function decreaseAmount() {
  if (amount > 1) {
    amount--;
    document.getElementById("amount").textContent = amount;
  }
}

// Cập nhật cart-count khi tải trang
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount(); // Cập nhật lại cart-count khi trang được tải lại
});



function buyNow() {
  alert("Mua ngay thành công!");
}
document.addEventListener("DOMContentLoaded", () => {
  const commentsSection = document.getElementById("comments-section");

  // Lấy products_id từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("products_id"));

  if (!productId) {
    console.error("Không tìm thấy products_id trong URL!");
    return;
  }

  function getComments(productId) {
    fetch(`http://localhost:3000/comments/${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        return response.json();
      })
      .then((comments) => {
        console.log("Comments for Product", productId, comments);
        renderComments(comments);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }

  // Hàm render bình luận ra HTML
  function renderComments(comments) {
    const commentsSection = document.getElementById("comments-section");
    commentsSection.innerHTML = ""; // Xóa nội dung cũ
    comments.forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.classList.add("comment-item");
      commentItem.innerHTML = `
        <div class="user-info">
          <img src="https://via.placeholder.com/40" alt="User Avatar">
          <div>
            <p class="username">${comment.user_fullname}</p>
            <p class="time">${new Date(comment.created_at).toLocaleString()}</p>
          </div>
        </div>
        <p class="content">${comment.content}</p>
      `;
      commentsSection.appendChild(commentItem);
    });
  }

  getComments(productId);

  // Thêm bình luận
  const addCommentButton = document.querySelector(".add-comment button");
  addCommentButton.addEventListener("click", () => {
    const newCommentText = document.getElementById("new-comment").value.trim();

    if (!newCommentText) {
      alert("Vui lòng nhập nội dung bình luận!");
      return;
    }

    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }

    const newComment = {
      user_id: user.id, // Lấy user_id từ localStorage
      product_id: productId, // ID sản phẩm
      user_fullname: user.fullname, // Lấy fullname từ localStorage
      content: newCommentText, // Nội dung bình luận
      created_at: new Date().toISOString(), // Thời gian hiện tại
      comment_id: null, // Comment ID sẽ được server tự động tạo
    };

    fetch("http://localhost:3000/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to post comment");
        }
        return response.text();
      })
      .then((message) => {
        console.log("Success:", message);
        getComments(productId); // Load lại danh sách bình luận sau khi thêm mới
      })
      .catch((error) => console.error("Error posting comment:", error));
  });
});



