let cart = JSON.parse(localStorage.getItem('faith_cart')) || [];

const mobileMenuBtn = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu');
const navMenu = document.getElementById('nav-menu');

const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('overlay');

const cartCountBadge = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function openMenu() {
  navMenu.classList.add('active');
  overlay.classList.add('active');
}

function openCart() {
  cartDrawer.classList.add('active');
  overlay.classList.add('active');
}

function closeAll() {
  if(navMenu) navMenu.classList.remove('active');
  if(cartDrawer) cartDrawer.classList.remove('active');
  if(productModal) productModal.classList.remove('active');
  if(checkoutModal) checkoutModal.classList.remove('active');
  if(overlay) overlay.classList.remove('active');
}

if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeAll);
if(cartBtn) cartBtn.addEventListener('click', openCart);
if(closeCartBtn) closeCartBtn.addEventListener('click', closeAll);
if(closeModalBtn) closeModalBtn.addEventListener('click', closeAll);
if(closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeAll);
if(overlay) overlay.addEventListener('click', closeAll);

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', closeAll);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('size-btn')) {
    const parent = e.target.closest('.size-selector');
    if (parent) {
      parent.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    }
  }
});

document.querySelectorAll('.product-image').forEach(imgContainer => {
  imgContainer.addEventListener('click', () => {
    const card = imgContainer.closest('.product-card');
    const title = card.querySelector('h3').textContent;
    const price = card.querySelector('.price').textContent;
    const imgSrc = card.querySelector('img').src;
    const desc = card.getAttribute('data-desc');

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-price').textContent = price;
    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-desc').textContent = desc;

    productModal.classList.add('active');
    overlay.classList.add('active');

    const modalBuyBtn = document.getElementById('modal-buy-btn');
    modalBuyBtn.onclick = () => {
      const priceNum = parseFloat(card.querySelector('.price').getAttribute('data-price'));
      const activeSizeBtn = document.querySelector('#modal-size-selector .size-btn.active');
      const size = activeSizeBtn ? activeSizeBtn.textContent : 'M';
      addToCart(title, priceNum, size);
      closeAll();
    };
  });
});

function updateCartUI() {
  localStorage.setItem('faith_cart', JSON.stringify(cart));

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = totalItems;

  const totalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalPrice.textContent = totalSum.toFixed(2).replace('.', ',') + ' €';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">O teu carrinho está vazio.</p>';
  } else {
    cartItemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item-single';
      itemEl.innerHTML = `
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta">Tamanho: ${item.size} | Qtd: ${item.quantity} - ${(item.price * item.quantity).toFixed(2)} €</div>
        </div>
        <button class="remove-item-btn" onclick="removeItem(${index})">&times;</button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
  }
}

function addToCart(title, price, size) {
  const existingIndex = cart.findIndex(item => item.title === title && item.size === size);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ title, price, size, quantity: 1 });
  }

  updateCartUI();
  showToast(`Adicionado: ${title} (${size})`);
}

document.querySelectorAll('.product-card').forEach(card => {
  const buyBtn = card.querySelector('.btn-buy');
  
  buyBtn.addEventListener('click', () => {
    const title = card.querySelector('h3').textContent;
    const price = parseFloat(card.querySelector('.price').getAttribute('data-price'));
    const sizeBtn = card.querySelector('.size-btn.active');
    const size = sizeBtn ? sizeBtn.textContent : 'M';

    addToCart(title, price, size);
  });
});

window.removeItem = function(index) {
  const removedTitle = cart[index].title;
  cart.splice(index, 1);
  updateCartUI();
  showToast(`Removido: ${removedTitle}`);
};

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('O teu carrinho está vazio!');
    return;
  }
  cartDrawer.classList.remove('active');
  checkoutModal.classList.add('active');
  overlay.classList.add('active');
});

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('shipping-name').value;
  const paymentOption = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = paymentOption ? paymentOption.value : 'MB WAY';
  
  showToast(`Obrigado, ${name}! Encomenda (${paymentMethod}) registada com sucesso. 🚀`);
  
  cart = [];
  updateCartUI();
  checkoutForm.reset();
  closeAll();
});

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.getAttribute('data-category');

    productCards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

document.getElementById('newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Bem-vindo à FAITH Community! Subscrição guardada.');
  e.target.reset();
});

updateCartUI();