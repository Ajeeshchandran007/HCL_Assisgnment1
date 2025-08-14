// Show Bootstrap toast for add-to-cart feedback
function showAddToCartToast(productName) {
    const toastEl = document.getElementById('toast-add-cart');
    if (toastEl) {
        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) toastBody.textContent = `${productName} added to cart!`;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}
// --- Cart and Checkout Logic ---
function updateCartCount() {
    // Update both old and new cart count badges
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = cart.length;
    const cartCountBadge = document.getElementById('cart-count');
    if (cartCountBadge) cartCountBadge.textContent = cart.length;
}

function showCheckout() {
    if (cart.length === 0) {
        alert('Please add items to your cart first');
        return;
    }

    // Calculate total bill
    let total = 0;
    cart.forEach(item => { total += item.price; });
    
    // Show checkout modal with order summary and payment form
    const checkoutModal = document.getElementById('checkoutModal');
    const modalContent = checkoutModal.querySelector('.modal-body');
    
    modalContent.innerHTML = `
        <div class="checkout-form">
            <h4>Order Summary</h4>
            <div class="order-summary mb-4">
                ${cart.map(item => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>${item.name}</span>
                        <span>$${item.price.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="d-flex justify-content-between align-items-center fw-bold border-top pt-2">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>

            <h4>Customer Information</h4>
            <form id="checkoutForm" class="mb-3">
                <div class="mb-3 row">
                    <label class="col-sm-3 col-form-label">Name:</label>
                    <div class="col-sm-9">
                        <input type="text" class="form-control" id="userName" required>
                    </div>
                </div>
                
                <div class="mb-3 row">
                    <label class="col-sm-3 col-form-label">Phone Number:</label>
                    <div class="col-sm-9">
                        <input type="tel" class="form-control" id="userPhone" required pattern="[0-9]{10}">
                    </div>
                </div>
                
                <div class="mb-3 row">
                    <label class="col-sm-3 col-form-label">Address:</label>
                    <div class="col-sm-9">
                        <textarea class="form-control" id="userAddress" required rows="2"></textarea>
                    </div>
                </div>

                <div class="mb-3 row">
                    <label class="col-sm-3 col-form-label">Payment Method:</label>
                    <div class="col-sm-9">
                        <select class="form-control" id="paymentMethod" disabled>
                            <option>Cash on Delivery</option>
                        </select>
                    </div>
                </div>

                <input type="hidden" id="totalBill" value="${total.toFixed(2)}">
                
                <div class="text-end">
                    <button type="submit" class="btn btn-primary">Place Order</button>
                </div>
            </form>
        </div>
    `;

    // Add submit handler to the new form
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.addEventListener('submit', submitOrder);
    
    checkoutModal.style.display = 'block';
}

function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const address = document.getElementById('userAddress').value;
    const order_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    fetch('http://localhost:5000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, name, phone, address, order_date })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        cart = [];
        renderCart();
        updateCartCount();
        document.getElementById('checkoutModal').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Gallery modal
    const modal = document.getElementById('galleryModal');
    const closeBtn = document.getElementById('closeModal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    // Checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    closeCheckout.onclick = function() {
        checkoutModal.style.display = 'none';
    };
    // Orders modal
    const ordersModal = document.getElementById('ordersModal');
    const closeOrders = document.getElementById('closeOrders');
    closeOrders.onclick = function() {
        ordersModal.style.display = 'none';
    };
    const ordersBtn = document.getElementById('ordersBtn');
    ordersBtn.onclick = function(e) {
        e.preventDefault();
        fetch('http://localhost:5000/orders')
            .then(res => res.json())
            .then(orders => {
                const ordersList = document.getElementById('ordersList');
                const tbody = ordersList.querySelector('tbody');
                
                if (orders.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found.</td></tr>';
                } else {
                    tbody.innerHTML = orders.map(order => {
                        let parsedItems = [];
                        let total = 0;
                        try { 
                            parsedItems = JSON.parse(order.items); 
                            total = parsedItems.reduce((sum, item) => sum + item.price, 0);
                        } catch { 
                            parsedItems = order.items; 
                        }
                        
                        const itemsList = Array.isArray(parsedItems) ? parsedItems.map(item => 
                            `<div class="d-flex justify-content-between border-bottom py-1">
                                <span>${item.name}</span>
                                <span>$${item.price.toFixed(2)}</span>
                             </div>`
                        ).join('') : '';

                        return `
                            <tr>
                                <td>${order.order_id}</td>
                                <td>${order.name}</td>
                                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                <td>
                                    <div class="order-items">
                                        ${itemsList}
                                    </div>
                                </td>
                                <td>$${total.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('');
                }
                ordersModal.style.display = 'block';
            });
    };
    // Cart dropdown
    const cartBtn = document.getElementById('cartBtn');
    const cartDropdown = document.getElementById('cartDropdown');
    cartBtn.onclick = function() {
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        if (event.target == ordersModal) {
            ordersModal.style.display = 'none';
        }
        if (!cartBtn.contains(event.target) && !cartDropdown.contains(event.target)) {
            cartDropdown.style.display = 'none';
        }
    };
});
let cart = [];


function showCategories() {
    const categories = [
        {
            name: 'Baby Onesie',
            image: '../backend/static/onesie.jpg',
            key: 'Onesie'
        },
        {
            name: 'Baby Blanket',
            image: '../backend/static/blanket.jpg',
            key: 'Blanket'
        },
        {
            name: 'Baby Hat',
            image: '../backend/static/hat.jpg',
            key: 'Hat'
        }
    ];
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = '';
    categories.forEach(cat => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 d-flex';
        const card = document.createElement('div');
        card.className = 'card product-card flex-fill animate-fadein';
        card.innerHTML = `
            <img src="${cat.image}" alt="${cat.name}" class="card-img-top" style="cursor:pointer;" />
            <div class="card-body d-flex flex-column align-items-center">
                <div class="product-title text-center">${cat.name}</div>
            </div>
        `;
        card.addEventListener('click', function() {
            showCategoryProducts(cat.key);
        });
        col.appendChild(card);
        productsDiv.appendChild(col);
    });
}

function showAllProducts() {
    const categories = ['Onesie', 'Blanket', 'Hat'];
    const products = [];
    
    categories.forEach(category => {
        const descriptions = {
        Onesie: [
            "Soft Cotton Striped Onesie",
            "Polka Dot Party Onesie",
            "Animal Print Comfort Onesie",
            "Floral Pattern Summer Onesie",
            "Classic White Everyday Onesie",
            "Rainbow Colors Joy Onesie",
            "Dinosaur Print Fun Onesie",
            "Hearts & Stars Onesie",
            "Sleep Time Moon Onesie",
            "Adventure Time Onesie"
        ],
        Blanket: [
            "Super Soft Minky Blanket",
            "Organic Cotton Comfort Blanket",
            "Quilted Warmth Blanket",
            "Star Pattern Security Blanket",
            "Rainbow Dreams Blanket",
            "Cloud Pattern Cozy Blanket",
            "Animal Friends Blanket",
            "Chevron Design Blanket",
            "Butterfly Garden Blanket",
            "Sweet Dreams Blanket"
        ],
        Hat: [
            "Cozy Winter Beanie",
            "Sun Protection Summer Hat",
            "Cute Bunny Ears Hat",
            "Bear Face Character Hat",
            "Rainbow Stripes Beanie",
            "Flower Pattern Sun Hat",
            "Adventure Explorer Hat",
            "Polka Dot Party Hat",
            "Warm Fleece Winter Hat",
            "Animal Friends Beanie"
        ]
    };

    const productDescriptions = {
        Onesie: [
            "100% organic cotton, perfect for sensitive skin, snap closures for easy changes",
            "Breathable fabric with fun patterns, ideal for playtime and parties",
            "Soft stretch material with adorable animal prints, perfect for everyday wear",
            "Light and airy with beautiful floral patterns, great for summer",
            "Essential white onesie made from premium cotton, a wardrobe staple",
            "Vibrant rainbow colors to brighten any day, super soft material",
            "Fun dinosaur prints on premium cotton, perfect for little explorers",
            "Cute pattern design on soft fabric, ideal for day and night",
            "Gentle fabric with dreamy pattern, perfect for bedtime",
            "Durable and comfortable, great for active babies"
        ],
        Blanket: [
            "Ultra-soft minky fabric with raised dots for sensory development",
            "100% organic cotton, chemical-free and safe for sensitive skin",
            "Double-layered for extra warmth, perfect for cold nights",
            "Lightweight security blanket with embroidered stars",
            "Colorful rainbow pattern on super soft fabric",
            "Dreamy cloud pattern on plush material, perfect for naps",
            "Cute animal prints on soft fleece material",
            "Modern chevron design on premium cotton blend",
            "Delicate butterfly patterns on soft muslin fabric",
            "Extra cozy blanket for peaceful sleep"
        ],
        Hat: [
            "Warm and cozy beanie for winter protection",
            "Wide-brim hat with UPF 50+ sun protection",
            "Adorable bunny ear design on soft cotton",
            "Cute bear face design with ear warmers",
            "Colorful stripes on premium knit material",
            "Pretty flower patterns with wide brim for shade",
            "Durable explorer hat for outdoor adventures",
            "Fun polka dot pattern for special occasions",
            "Super warm fleece hat for winter comfort",
            "Cute animal designs on soft knit fabric"
        ]
    };

    for (let i = 1; i <= 10; i++) {
            products.push({
                id: i,
                name: descriptions[category][i-1],
                price: 19.99 + i,
                description: productDescriptions[category][i-1],
                image: `/static/${category.toLowerCase()}_${i}.jpg`,
                category: category
            });
        }
    });

    displayProducts(products);
}

function showCategoryProducts(category) {
    const descriptions = {
        Onesie: [
            "Soft Cotton Striped Onesie",
            "Polka Dot Party Onesie",
            "Animal Print Comfort Onesie",
            "Floral Pattern Summer Onesie",
            "Classic White Everyday Onesie",
            "Rainbow Colors Joy Onesie",
            "Dinosaur Print Fun Onesie",
            "Hearts & Stars Onesie",
            "Sleep Time Moon Onesie",
            "Adventure Time Onesie"
        ],
        Blanket: [
            "Super Soft Minky Blanket",
            "Organic Cotton Comfort Blanket",
            "Quilted Warmth Blanket",
            "Star Pattern Security Blanket",
            "Rainbow Dreams Blanket",
            "Cloud Pattern Cozy Blanket",
            "Animal Friends Blanket",
            "Chevron Design Blanket",
            "Butterfly Garden Blanket",
            "Sweet Dreams Blanket"
        ],
        Hat: [
            "Cozy Winter Beanie",
            "Sun Protection Summer Hat",
            "Cute Bunny Ears Hat",
            "Bear Face Character Hat",
            "Rainbow Stripes Beanie",
            "Flower Pattern Sun Hat",
            "Adventure Explorer Hat",
            "Polka Dot Party Hat",
            "Warm Fleece Winter Hat",
            "Animal Friends Beanie"
        ]
    };

    const productDescriptions = {
        Onesie: [
            "100% organic cotton, perfect for sensitive skin, snap closures for easy changes",
            "Breathable fabric with fun patterns, ideal for playtime and parties",
            "Soft stretch material with adorable animal prints, perfect for everyday wear",
            "Light and airy with beautiful floral patterns, great for summer",
            "Essential white onesie made from premium cotton, a wardrobe staple",
            "Vibrant rainbow colors to brighten any day, super soft material",
            "Fun dinosaur prints on premium cotton, perfect for little explorers",
            "Cute pattern design on soft fabric, ideal for day and night",
            "Gentle fabric with dreamy pattern, perfect for bedtime",
            "Durable and comfortable, great for active babies"
        ],
        Blanket: [
            "Ultra-soft minky fabric with raised dots for sensory development",
            "100% organic cotton, chemical-free and safe for sensitive skin",
            "Double-layered for extra warmth, perfect for cold nights",
            "Lightweight security blanket with embroidered stars",
            "Colorful rainbow pattern on super soft fabric",
            "Dreamy cloud pattern on plush material, perfect for naps",
            "Cute animal prints on soft fleece material",
            "Modern chevron design on premium cotton blend",
            "Delicate butterfly patterns on soft muslin fabric",
            "Extra cozy blanket for peaceful sleep"
        ],
        Hat: [
            "Warm and cozy beanie for winter protection",
            "Wide-brim hat with UPF 50+ sun protection",
            "Adorable bunny ear design on soft cotton",
            "Cute bear face design with ear warmers",
            "Colorful stripes on premium knit material",
            "Pretty flower patterns with wide brim for shade",
            "Durable explorer hat for outdoor adventures",
            "Fun polka dot pattern for special occasions",
            "Super warm fleece hat for winter comfort",
            "Cute animal designs on soft knit fabric"
        ]
    };

    const products = [];
    for (let i = 1; i <= 10; i++) {
        products.push({
            id: i,
            name: descriptions[category][i-1],
            price: 19.99 + i,
            description: productDescriptions[category][i-1],
            image: `/static/${category.toLowerCase()}_${i}.jpg`
        });
    }
    
    displayProducts(products);
}

function displayProducts(products) {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = '';
    productsDiv.className = 'row g-4 justify-content-center';
    
    products.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 d-flex';
        const card = document.createElement('div');
        card.className = 'card product-card flex-fill animate-fadein';
        card.innerHTML = `
            <img src="../backend${p.image}" alt="${p.name}" class="card-img-top" style="cursor:pointer;" data-product-id="${p.id}" />
            <div class="card-body d-flex flex-column align-items-center">
                <div class="product-title text-center">${p.name}</div>
                <div class="product-price mb-2">$${p.price.toFixed(2)}</div>
                ${p.category ? `<div class="product-category mb-2 text-muted">${p.category}</div>` : ''}
                <button class="add-cart-btn mt-auto" data-product-id="${p.id}">Add to Cart</button>
            </div>
        `;
        
        card.querySelector('img').addEventListener('click', function() {
            openGallery(p.id, p.name, p.description, p.price, p.image);
        });
        
        card.querySelector('.add-cart-btn').addEventListener('click', function() {
            addToCart({ name: p.name, image: p.image, price: p.price, description: p.description });
        });
        
        col.appendChild(card);
        productsDiv.appendChild(col);
    });
}

function openGallery(productId, productName, productDesc, productPrice, mainImage) {
    fetch(`http://localhost:5000/product_images/${productId}`)
        .then(res => res.json())
        .then(images => {
            const galleryDiv = document.getElementById('galleryImages');
            galleryDiv.innerHTML = `<h2>${productName} Gallery</h2><p>${productDesc}</p>`;
            images.forEach((imgObj, idx) => {
                const imgBox = document.createElement('div');
                imgBox.style.display = 'inline-block';
                imgBox.style.margin = '10px';
                imgBox.style.verticalAlign = 'top';
                imgBox.innerHTML = `
                    <img src="${imgObj.image}" alt="${productName}" style="width:120px;height:120px;object-fit:cover;border-radius:6px;display:block;" />
                    <div style="margin-top:5px;">
                        <b>${productName}</b><br/>
                        <span style="color:#2d7bb6;">$${imgObj.price.toFixed(2)}</span><br/>
                        <span style="font-size:12px;">${imgObj.description}</span><br/>
                        <button onclick='addToCartFromGallery(${JSON.stringify({name: productName, image: imgObj.image, price: imgObj.price, description: imgObj.description})})'>Add to Cart</button>
                    </div>
                `;
                galleryDiv.appendChild(imgBox);
            });
            document.getElementById('galleryModal').style.display = 'block';
        });
}

function addToCartFromGallery(item) {
    cart.push(item);
    renderCart();
    updateCartCount();
    showAddToCartToast(item.name);
}

// Close modal logic
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('galleryModal');
    const closeBtn = document.getElementById('closeModal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});

function addToCart(product) {
    cart.push(product);
    renderCart();
    updateCartCount();
    showAddToCartToast(product.name);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartCount();
}

function renderCart() {
    const cartUl = document.getElementById('cart');
    if (!cartUl) return;
    cartUl.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartUl.innerHTML = '<li class="text-center">Your cart is empty</li>';
        return;
    }

    // Add header
    const headerLi = document.createElement('li');
    headerLi.className = 'cart-header';
    headerLi.innerHTML = `
        <div class="row w-100 fw-bold border-bottom pb-2 mb-2">
            <div class="col-6">Product</div>
            <div class="col-3">Price</div>
            <div class="col-3">Action</div>
        </div>
    `;
    cartUl.appendChild(headerLi);

    cart.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="row w-100 align-items-center mb-2">
                <div class="col-6">
                    <div class="d-flex align-items-center">
                        <img src="../backend${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;margin-right:10px;" />
                        <div>
                            <div>${item.name}</div>
                            <small class="text-muted">${item.description}</small>
                        </div>
                    </div>
                </div>
                <div class="col-3">$${item.price.toFixed(2)}</div>
                <div class="col-3">
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${idx})">Remove</button>
                </div>
            </div>
        `;
        cartUl.appendChild(li);
        total += item.price;
    });

    // Show total bill
    if (cart.length > 0) {
        const totalLi = document.createElement('li');
        totalLi.className = 'cart-total';
        totalLi.innerHTML = `
            <div class="row w-100 fw-bold border-top pt-2 mt-2">
                <div class="col-6">Total:</div>
                <div class="col-6 text-end">$${total.toFixed(2)}</div>
            </div>
        `;
        cartUl.appendChild(totalLi);
    }
    // Disable checkout button if cart is empty
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
        checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    }
    updateCartCount();
}

function placeOrder() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    fetch('http://localhost:5000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        cart = [];
        renderCart();
    });
}

// Show categories on Home load
showCategories();

// Handle navigation clicks
document.addEventListener('DOMContentLoaded', function() {
    // Home nav click
    const homeNav = document.querySelector('a.nav-link[href="#"]');
    if (homeNav) {
        homeNav.addEventListener('click', function(e) {
            e.preventDefault();
            showCategories();
        });
    }
    
    // Products nav click
    const productsNav = document.querySelector('a.nav-link[href="#products"]');
    if (productsNav) {
        productsNav.addEventListener('click', function(e) {
            e.preventDefault();
            showAllProducts();
        });
    }
});
