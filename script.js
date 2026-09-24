// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://lhytegyaeaeksrcdtaos.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w2N6Oev-AiIfwtmtdbgQXQ_KHpyBWzl';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// GLOBAL STATE
let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem('joey_jerseys_cart')) || [];
let activeCategory = 'all';
let currentModalProduct = null;

// 1. PAGE NAVIGATION CONTROLLER
window.showPage = function(pageId, category = null) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.remove('hidden');

  // Highlight active nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-white', 'border-red-500');
    btn.classList.add('text-slate-300', 'border-transparent');
  });
  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) {
    activeNav.classList.remove('text-slate-300', 'border-transparent');
    activeNav.classList.add('text-white', 'border-red-500');
  }

  if (category) {
    window.setCategoryFilter(category);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 2. MODAL & DRAWER TOGGLES
window.toggleCartDrawer = function() {
  const modal = document.getElementById('cart-modal');
  if (modal) modal.classList.toggle('hidden');
};

window.closeProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
  currentModalProduct = null;
};

// 3. FETCH LIVE PRODUCTS FROM SUPABASE
async function fetchStoreCatalog() {
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    productGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
        <p class="text-xs">Loading jerseys...</p>
      </div>
    `;
  }

  const { data, error } = await supabaseClient
    .from('jerseys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading inventory:', error.message);
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-red-400">
          <p class="text-xs font-semibold">Failed to load jerseys. Please check your network.</p>
        </div>
      `;
    }
    return;
  }

  PRODUCTS = data || [];
  window.applyFilters();
  renderFeaturedSection();
}

// 4. FILTER & SEARCH CONTROLLER
window.setCategoryFilter = function(category) {
  activeCategory = category;

  // Update active category UI button styles
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    const btnCat = btn.getAttribute('data-cat');
    if (btnCat === category) {
      btn.classList.remove('text-slate-400', 'hover:bg-slate-800', 'hover:text-white');
      btn.classList.add('bg-red-600', 'text-white');
    } else {
      btn.classList.remove('bg-red-600', 'text-white');
      btn.classList.add('text-slate-400', 'hover:bg-slate-800', 'hover:text-white');
    }
  });

  window.applyFilters();
};

window.applyFilters = function() {
  const grid = document.getElementById('product-grid');
  const countLabel = document.getElementById('product-count');
  const titleLabel = document.getElementById('catalog-title');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  if (!grid) return;

  let filtered = [...PRODUCTS];

  // Category Filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }

  // Search Input Filter
  if (searchInput && searchInput.value.trim() !== '') {
    const query = searchInput.value.toLowerCase().trim();
    filtered = filtered.filter(p => p.name?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query));
  }

  // Sorting Filter
  if (sortSelect) {
    const sortVal = sortSelect.value;
    if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortVal === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortVal === 'featured') filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  if (countLabel) countLabel.textContent = `Showing ${filtered.length} products`;
  if (titleLabel) titleLabel.textContent = activeCategory === 'all' ? 'All Jerseys' : `${activeCategory} Kits`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-xs">No jerseys match your filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/50 transition-all">
      <div>
        <div class="relative bg-slate-950 rounded-xl p-3 mb-3 border border-slate-800/80 aspect-square flex items-center justify-center overflow-hidden">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
          ${item.featured ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Featured</span>` : ''}
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider">${item.category}</span>
        </div>
        <h3 class="font-bold text-white text-sm line-clamp-1">${item.name}</h3>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <p class="text-amber-400 font-black text-sm">GH₵ ${item.price}</p>
        <div class="flex gap-2">
          <button onclick="openProductModal('${item.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all">
            Customize
          </button>
          <button onclick="addToCart('${item.id}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
};

window.resetFilters = function() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'featured';

  window.setCategoryFilter('all');
};

// 5. RENDER FEATURED SECTION
function renderFeaturedSection() {
  const featuredGrid = document.getElementById('featured-grid');
  if (!featuredGrid) return;

  const featuredItems = PRODUCTS.filter(p => p.featured);

  if (featuredItems.length === 0) {
    featuredGrid.innerHTML = `<p class="text-xs text-slate-500 col-span-full text-center">No featured jerseys available.</p>`;
    return;
  }

  featuredGrid.innerHTML = featuredItems.map(item => `
    <div class="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all">
      <div>
        <div class="relative bg-slate-950 rounded-xl p-3 mb-3 aspect-square flex items-center justify-center overflow-hidden">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
        </div>
        <h3 class="font-bold text-white text-sm truncate">${item.name}</h3>
        <p class="text-amber-400 font-black text-sm mt-1">GH₵ ${item.price}</p>
      </div>
      <button onclick="addToCart('${item.id}')" class="mt-3 w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
        <i class="fa-solid fa-cart-plus"></i> Add To Cart
      </button>
    </div>
  `).join('');
}

// 6. CUSTOMIZATION MODAL LOGIC
window.openProductModal = function(productId) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  currentModalProduct = product;

  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-category').textContent = product.category;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-price').textContent = `GH₵ ${product.price}`;

  // Generate Size Options
  const sizeContainer = document.getElementById('modal-sizes');
  const sizes = product.category?.toLowerCase() === 'kids' ? ['Kids-S', 'Kids-M', 'Kids-L', 'Kids-XL'] : ['S', 'M', 'L', 'XL', 'XXL'];
  sizeContainer.innerHTML = sizes.map((size, idx) => `
    <label class="cursor-pointer">
      <input type="radio" name="modal-size" value="${size}" ${idx === 0 ? 'checked' : ''} class="peer sr-only">
      <span class="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600 block transition-all">
        ${size}
      </span>
    </label>
  `).join('');

  // Clear customization inputs
  document.getElementById('custom-name').value = '';
  document.getElementById('custom-number').value = '';
  window.updatePrintPreview();

  document.getElementById('product-modal').classList.remove('hidden');
};

window.updatePrintPreview = function() {
  const name = document.getElementById('custom-name').value.trim();
  const num = document.getElementById('custom-number').value.trim();
  const previewBox = document.getElementById('modal-print-preview');

  if (name || num) {
    previewBox.classList.remove('hidden');
    document.getElementById('modal-preview-name').textContent = name || 'NAME';
    document.getElementById('modal-preview-number').textContent = num || '00';
  } else {
    previewBox.classList.add('hidden');
  }
};

window.addModalItemToCart = function() {
  if (!currentModalProduct) return;

  const selectedSizeEl = document.querySelector('input[name="modal-size"]:checked');
  const selectedSize = selectedSizeEl ? selectedSizeEl.value : 'M';
  const customName = document.getElementById('custom-name').value.trim().toUpperCase();
  const customNumber = document.getElementById('custom-number').value.trim();

  const printExtraPrice = (customName || customNumber) ? 30 : 0;
  const itemPrice = currentModalProduct.price + printExtraPrice;

  // Cart item unique key (combination of ID + Size + Custom Printing)
  const cartItemId = `${currentModalProduct.id}-${selectedSize}-${customName}-${customNumber}`;

  const existingIndex = CART.findIndex(item => item.cartItemId === cartItemId);

  if (existingIndex > -1) {
    CART[existingIndex].quantity += 1;
  } else {
    CART.push({
      cartItemId: cartItemId,
      id: currentModalProduct.id,
      name: currentModalProduct.name,
      price: itemPrice,
      image: currentModalProduct.image,
      size: selectedSize,
      customName: customName || null,
      customNumber: customNumber || null,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  window.closeProductModal();
  window.toggleCartDrawer();
};

// 7. CART SYSTEM LOGIC
window.addToCart = function(productId) {
  const product = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!product) return;

  const cartItemId = `${product.id}-M-none`;
  const existingIndex = CART.findIndex(item => item.cartItemId === cartItemId || item.id === product.id);

  if (existingIndex > -1) {
    CART[existingIndex].quantity += 1;
  } else {
    CART.push({
      cartItemId: cartItemId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 'M',
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  window.toggleCartDrawer();
};

window.removeFromCart = function(cartItemId) {
  CART = CART.filter(item => (item.cartItemId || item.id) !== cartItemId);
  saveCart();
  updateCartUI();
};

window.updateQuantity = function(cartItemId, delta) {
  const item = CART.find(i => (i.cartItemId || i.id) === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    window.removeFromCart(cartItemId);
  } else {
    saveCart();
    updateCartUI();
  }
};

function saveCart() {
  localStorage.setItem('joey_jerseys_cart', JSON.stringify(CART));
}

function updateCartUI() {
  const countBadge = document.getElementById('cart-badge');
  const cartList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');

  const totalCount = CART.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = totalCount;

  const totalAmount = CART.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartSubtotal) cartSubtotal.textContent = `GH₵ ${totalAmount}`;
  if (cartTotal) cartTotal.textContent = `GH₵ ${totalAmount}`;

  if (!cartList) return;

  if (CART.length === 0) {
    cartList.innerHTML = `<p class="text-xs text-slate-500 py-8 text-center">Your cart is empty.</p>`;
    return;
  }

  cartList.innerHTML = CART.map(item => {
    const key = item.cartItemId || item.id;
    const printText = (item.customName || item.customNumber) 
      ? `<span class="block text-[10px] text-amber-400">Print: ${item.customName || ''} #${item.customNumber || ''}</span>` 
      : '';

    return `
      <div class="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain bg-slate-900 rounded-lg p-1">
        <div class="flex-1 truncate">
          <p class="font-bold text-white truncate">${item.name}</p>
          <p class="text-slate-400 text-[10px]">Size: ${item.size || 'M'}</p>
          ${printText}
          <p class="text-amber-400 font-black mt-0.5">GH₵ ${item.price}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateQuantity('${key}', -1)" class="w-6 h-6 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold hover:bg-slate-700">-</button>
          <span class="font-bold text-white text-xs">${item.quantity}</span>
          <button onclick="updateQuantity('${key}', 1)" class="w-6 h-6 bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold hover:bg-slate-700">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// 8. WHATSAPP CHECKOUT GENERATOR
window.checkoutWhatsApp = function() {
  if (CART.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = `Hello Joey Jerseys, I would like to place an order:\n\n`;

  CART.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    message += `   - Size: ${item.size || 'M'}\n`;
    if (item.customName || item.customNumber) {
      message += `   - Printing: ${item.customName || 'N/A'} (#${item.customNumber || 'N/A'})\n`;
    }
    message += `   - Qty: ${item.quantity} x GH₵ ${item.price} = GH₵ ${item.price * item.quantity}\n\n`;
  });

  const total = CART.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  message += `*Total Amount:* GH₵ ${total}\n\nPlease let me know how to proceed with payment and delivery!`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/233204442259?text=${encodedMessage}`, '_blank');
};

// 9. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  fetchStoreCatalog();
  updateCartUI();
});