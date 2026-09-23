// Sample Products Data Store
const PRODUCTS = [
  {
    id: 1,
    name: "Real Madrid Home Kit 2024/25",
    category: "Club",
    price: 280,
    featured: true,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 2,
    name: "Barcelona Home Kit 2024/25",
    category: "Club",
    price: 270,
    featured: true,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Arsenal Home Kit 2024/25",
    category: "Club",
    price: 280,
    featured: true,
    image: "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 4,
    name: "Ghana Black Stars Home Kit",
    category: "National",
    price: 250,
    featured: true,
    image: "https://images.unsplash.com/photo-1541032580310-58782fe49039?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Kids Real Madrid Full Kit Set",
    category: "Kids",
    price: 220,
    featured: false,
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&auto=format&fit=crop&q=80",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"]
  },
  {
    id: 6,
    name: "Kids Ghana Black Stars Set",
    category: "Kids",
    price: 200,
    featured: false,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"]
  },
  {
    id: 7,
    name: "Manchester United Retro 1999 Kit",
    category: "Retro",
    price: 300,
    featured: false,
    image: "https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=800&auto=format&fit=crop&q=80",
    sizes: ["M", "L", "XL"]
  },
  {
    id: 8,
    name: "Liverpool Home Kit 2024/25",
    category: "Club",
    price: 260,
    featured: false,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"]
  }
];

// App State
let cart = [];
let activeCategory = 'all';
let selectedProduct = null;
let selectedSize = '';

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedProducts();
  renderCatalogProducts(PRODUCTS);
  updateCartUI();
});

// Navigation Controller
function showPage(pageId, categoryFilter = null) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
  
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update Nav Button Styles
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-white', 'border-red-500');
    btn.classList.add('text-slate-300', 'border-transparent');
  });

  if (pageId === 'home') {
    document.getElementById('nav-home')?.classList.add('text-white', 'border-red-500');
  } else if (pageId === 'shop') {
    if (categoryFilter === 'Kids') {
      document.getElementById('nav-kids')?.classList.add('text-white', 'border-red-500');
    } else {
      document.getElementById('nav-shop')?.classList.add('text-white', 'border-red-500');
    }
  }

  if (categoryFilter) {
    setCategoryFilter(categoryFilter);
  }
}

// Render Featured Jerseys on Home View
function renderFeaturedProducts() {
  const container = document.getElementById('featured-grid');
  if (!container) return;

  const featured = PRODUCTS.filter(p => p.featured);
  container.innerHTML = featured.map(p => createProductCardHTML(p)).join('');
}

// Filter and Render Catalog Page
function applyFilters() {
  const searchVal = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
  const sortVal = document.getElementById('sort-select')?.value || 'featured';

  let filtered = PRODUCTS.filter(product => {
    const matchesCat = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchVal) || product.category.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  // Apply Sorting
  if (sortVal === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortVal === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderCatalogProducts(filtered);
}

function setCategoryFilter(category) {
  activeCategory = category;
  
  // Update UI Filter buttons
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.classList.add('bg-red-600', 'text-white');
      btn.classList.remove('text-slate-400', 'hover:bg-slate-800');
    } else {
      btn.classList.remove('bg-red-600', 'text-white');
      btn.classList.add('text-slate-400', 'hover:bg-slate-800');
    }
  });

  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) {
    catalogTitle.textContent = category === 'all' ? 'All Jerseys' : `${category} Jerseys`;
  }

  applyFilters();
}

function resetFilters() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'featured';
  setCategoryFilter('all');
}

function renderCatalogProducts(productsList) {
  const container = document.getElementById('catalog-grid');
  const countEl = document.getElementById('product-count');
  
  if (countEl) countEl.textContent = `Showing ${productsList.length} products`;
  if (!container) return;

  if (productsList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center space-y-3">
        <i class="fa-solid fa-shirt text-4xl text-slate-600"></i>
        <p class="text-slate-400 font-medium text-sm">No jerseys match your search criteria.</p>
        <button onclick="resetFilters()" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = productsList.map(p => createProductCardHTML(p)).join('');
}

// Generate Individual Product Card HTML
function createProductCardHTML(product) {
  return `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-lg">
      <div class="relative bg-slate-950 p-4 aspect-square flex items-center justify-center overflow-hidden">
        <span class="absolute top-3 left-3 bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
          ${product.category}
        </span>
        <img src="${product.image}" alt="${product.name}" class="max-h-full object-contain group-hover:scale-105 transition-transform duration-300">
      </div>
      
      <div class="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <h3 class="font-bold text-white text-base leading-snug line-clamp-1">${product.name}</h3>
          <p class="text-amber-400 font-extrabold text-lg mt-1">GH₵ ${product.price}</p>
        </div>

        <button onclick="openProductModal(${product.id})" class="w-full py-2.5 bg-slate-800 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
          <i class="fa-solid fa-eye"></i> View & Customise
        </button>
      </div>
    </div>
  `;
}

// Product Modal & Customization Systems
function openProductModal(productId) {
  selectedProduct = PRODUCTS.find(p => p.id === productId);
  if (!selectedProduct) return;

  selectedSize = selectedProduct.sizes[0];

  document.getElementById('modal-img').src = selectedProduct.image;
  document.getElementById('modal-category').textContent = `${selectedProduct.category} Kit`;
  document.getElementById('modal-title').textContent = selectedProduct.name;
  document.getElementById('modal-price').textContent = `GH₵ ${selectedProduct.price}`;

  // Reset Custom Inputs
  const nameInput = document.getElementById('custom-name');
  const numInput = document.getElementById('custom-number');
  if (nameInput) nameInput.value = '';
  if (numInput) numInput.value = '';
  updatePrintPreview();

  // Populate Sizes Buttons
  const sizesContainer = document.getElementById('modal-sizes');
  if (sizesContainer) {
    sizesContainer.innerHTML = selectedProduct.sizes.map(size => `
      <button onclick="selectSize('${size}')" class="size-btn px-3.5 py-2 rounded-xl text-xs font-bold border ${size === selectedSize ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'} transition-all" data-size="${size}">
        ${size}
      </button>
    `).join('');
  }

  document.getElementById('product-modal').classList.remove('hidden');
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(btn => {
    if (btn.dataset.size === size) {
      btn.className = 'size-btn px-3.5 py-2 rounded-xl text-xs font-bold border bg-red-600 border-red-500 text-white transition-all';
    } else {
      btn.className = 'size-btn px-3.5 py-2 rounded-xl text-xs font-bold border bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 transition-all';
    }
  });
}

function updatePrintPreview() {
  const name = document.getElementById('custom-name')?.value.trim();
  const number = document.getElementById('custom-number')?.value.trim();
  const previewBox = document.getElementById('modal-print-preview');
  const previewName = document.getElementById('modal-preview-name');
  const previewNumber = document.getElementById('modal-preview-number');

  if (name || number) {
    previewBox?.classList.remove('hidden');
    if (previewName) previewName.textContent = name || 'NAME';
    if (previewNumber) previewNumber.textContent = number || '10';
  } else {
    previewBox?.classList.add('hidden');
  }
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function addModalItemToCart() {
  if (!selectedProduct) return;

  const customName = document.getElementById('custom-name')?.value.trim().toUpperCase() || '';
  const customNumber = document.getElementById('custom-number')?.value.trim() || '';
  const hasCustom = customName !== '' || customNumber !== '';
  const finalPrice = selectedProduct.price + (hasCustom ? 30 : 0);

  const cartItem = {
    cartItemId: Date.now(),
    productId: selectedProduct.id,
    name: selectedProduct.name,
    image: selectedProduct.image,
    size: selectedSize,
    customName,
    customNumber,
    price: finalPrice
  };

  cart.push(cartItem);
  updateCartUI();
  closeProductModal();
  toggleCartDrawer();
}

// Cart Drawer Management
function toggleCartDrawer() {
  const modal = document.getElementById('cart-modal');
  modal?.classList.toggle('hidden');
}

function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  // Update Badge
  if (badge) {
    badge.textContent = cart.length;
    if (cart.length > 0) {
      badge.classList.remove('scale-0');
    } else {
      badge.classList.add('scale-0');
    }
  }

  // Calculate Totals
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if (subtotalEl) subtotalEl.textContent = `GH₵ ${total}`;
  if (totalEl) totalEl.textContent = `GH₵ ${total}`;

  // Populate Drawer List
  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
        <i class="fa-solid fa-bag-shopping text-4xl text-slate-700"></i>
        <p class="text-slate-400 text-sm font-medium">Your shopping cart is empty.</p>
        <button onclick="toggleCartDrawer(); showPage('shop')" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">Start Shopping</button>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = cart.map(item => `
    <div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-contain bg-slate-900 rounded-lg p-1 border border-slate-700">
      
      <div class="flex-grow min-w-0">
        <h4 class="font-bold text-white text-xs truncate">${item.name}</h4>
        <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
          <span>Size: <strong class="text-white">${item.size}</strong></span>
          ${item.customName || item.customNumber ? `• <span class="text-amber-400 font-semibold">${item.customName} #${item.customNumber}</span>` : ''}
        </div>
        <p class="text-amber-400 font-extrabold text-xs mt-1">GH₵ ${item.price}</p>
      </div>

      <button onclick="removeFromCart(${item.cartItemId})" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-trash-can text-sm"></i>
      </button>
    </div>
  `).join('');
}

// WhatsApp Checkout Link Generation
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let text = "Hello *Joey Jerseys*, I would like to place an order for:\n\n";

  cart.forEach((item, idx) => {
    text += `${idx + 1}. *${item.name}*\n`;
    text += `   • Size: ${item.size}\n`;
    if (item.customName || item.customNumber) {
      text += `   • Customization: ${item.customName} (#${item.customNumber})\n`;
    }
    text += `   • Price: GH₵ ${item.price}\n\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  text += `*Total Order Amount:* GH₵ ${total}\n\n`;
  text += "Please confirm availability and shipping details!";

  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/233204442259?text=${encodedText}`;

  window.open(whatsappUrl, '_blank');
}