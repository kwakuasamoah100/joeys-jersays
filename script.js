// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://lhytegyaeaeksrcdtaos.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w2N6Oev-AiIfwtmtdbgQXQ_KHpyBWzl';

// Renamed variable to avoid name collisions with window.supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// GLOBAL STATE
let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem('joey_jerseys_cart')) || [];
let activeCategory = 'All';

// 1. FETCH LIVE PRODUCTS FROM SUPABASE
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
          <p class="text-xs font-semibold">Failed to load jerseys. Please refresh.</p>
        </div>
      `;
    }
    return;
  }

  PRODUCTS = data || [];
  renderCatalog();
  renderFeaturedSection();
}

// 2. RENDER STORE CATALOG
function renderCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-xs">No jerseys available in this category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all">
      <div>
        <div class="relative bg-slate-950 rounded-xl p-3 mb-3 border border-slate-800/80 aspect-square flex items-center justify-center overflow-hidden">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
          ${item.featured ? `<span class="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Featured</span>` : ''}
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider">${item.category}</span>
        </div>
        <h3 class="font-bold text-white text-sm line-clamp-1">${item.name}</h3>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <p class="text-amber-400 font-black text-sm">GH₵ ${item.price}</p>
        <button onclick="addToCart(${item.id})" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-cart-plus"></i> Add
        </button>
      </div>
    </div>
  `).join('');
}

// 3. RENDER FEATURED SECTION (OPTIONAL HERO CAROUSEL/GRID)
function renderFeaturedSection() {
  const featuredGrid = document.getElementById('featured-grid');
  if (!featuredGrid) return;

  const featuredItems = PRODUCTS.filter(p => p.featured);

  if (featuredItems.length === 0) {
    featuredGrid.innerHTML = `<p class="text-xs text-slate-500 col-span-full text-center">No featured jerseys this week.</p>`;
    return;
  }

  featuredGrid.innerHTML = featuredItems.map(item => `
    <div class="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain bg-slate-950 rounded-xl p-1">
      <div class="flex-1 truncate">
        <h4 class="font-bold text-white text-xs truncate">${item.name}</h4>
        <p class="text-amber-400 font-black text-xs mt-0.5">GH₵ ${item.price}</p>
      </div>
      <button onclick="addToCart(${item.id})" class="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs hover:bg-amber-400">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `).join('');
}

// 4. CATEGORY FILTER CONTROLLER
function filterCategory(category, element) {
  activeCategory = category;

  // Update active state on filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-amber-500', 'text-slate-950');
    btn.classList.add('bg-slate-900', 'text-slate-300');
  });

  if (element) {
    element.classList.remove('bg-slate-900', 'text-slate-300');
    element.classList.add('bg-amber-500', 'text-slate-950');
  }

  renderCatalog();
}

// 5. CART SYSTEM LOGIC
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = CART.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    CART[existingIndex].quantity += 1;
  } else {
    CART.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  alert(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  CART = CART.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = CART.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('joey_jerseys_cart', JSON.stringify(CART));
}

function updateCartUI() {
  const countBadge = document.getElementById('cart-count');
  const cartList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal');

  // Total Quantity Counter Badge
  const totalCount = CART.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = totalCount;

  // Total Price Calculator
  const totalAmount = CART.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartSubtotal) cartSubtotal.textContent = `GH₵ ${totalAmount}`;

  if (!cartList) return;

  if (CART.length === 0) {
    cartList.innerHTML = `<p class="text-xs text-slate-500 py-8 text-center">Your cart is empty.</p>`;
    return;
  }

  cartList.innerHTML = CART.map(item => `
    <div class="flex items-center justify-between gap-3 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
      <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-contain bg-slate-900 rounded-lg p-1">
      <div class="flex-1 truncate">
        <p class="font-bold text-white truncate">${item.name}</p>
        <p class="text-amber-400 font-bold">GH₵ ${item.price}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="updateQuantity(${item.id}, -1)" class="w-5 h-5 bg-slate-800 text-white rounded flex items-center justify-center font-bold hover:bg-slate-700">-</button>
        <span class="font-bold text-white">${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)" class="w-5 h-5 bg-slate-800 text-white rounded flex items-center justify-center font-bold hover:bg-slate-700">+</button>
      </div>
    </div>
  `).join('');
}

// 6. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  fetchStoreCatalog();
  updateCartUI();
});