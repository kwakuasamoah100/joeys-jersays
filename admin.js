// DEFAULT INITIAL INVENTORY
const INITIAL_PRODUCTS = [
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
    name: "Ghana Black Stars Home Kit",
    category: "National",
    price: 250,
    featured: true,
    image: "https://images.unsplash.com/photo-1541032580310-58782fe49039?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"]
  }
];

let PRODUCTS = [];

// Initialize and Sync Storage
function loadProducts() {
  const saved = localStorage.getItem('joey_jerseys_inventory');
  if (saved) {
    try {
      PRODUCTS = JSON.parse(saved);
    } catch (e) {
      PRODUCTS = [...INITIAL_PRODUCTS];
    }
  } else {
    PRODUCTS = [...INITIAL_PRODUCTS];
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem('joey_jerseys_inventory', JSON.stringify(PRODUCTS));
}

// AUTHENTICATION CONTROLLER
function authenticateAdmin(e) {
  e.preventDefault();
  const input = document.getElementById('admin-passcode-input').value;
  if (input === 'admin123') {
    document.getElementById('auth-overlay').classList.add('hidden');
    sessionStorage.setItem('admin_authenticated', 'true');
    initAdminPage();
  } else {
    alert("Incorrect Passcode!");
  }
}

function lockAdminPortal() {
  sessionStorage.removeItem('admin_authenticated');
  document.getElementById('auth-overlay').classList.remove('hidden');
}

// INITIALIZE PORTAL
function initAdminPage() {
  loadProducts();
  renderAdminList();
  updateStats();
}

// RENDER INVENTORY LIST
function renderAdminList() {
  const list = document.getElementById('admin-items-list');
  if (!list) return;

  if (PRODUCTS.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No jerseys currently in inventory.</p>`;
    return;
  }

  list.innerHTML = PRODUCTS.map(item => `
    <div class="bg-slate-950 p-3.5 rounded-2xl flex items-center justify-between text-xs gap-4 border border-slate-800">
      <div class="flex items-center gap-3 truncate">
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain bg-slate-900 rounded-xl p-1 border border-slate-800">
        <div class="truncate">
          <p class="font-bold text-white text-sm truncate">${item.name}</p>
          <p class="text-amber-400 font-black mt-0.5">GH₵ ${item.price} <span class="text-slate-400 font-semibold">• ${item.category} ${item.featured ? '• (Featured)' : ''}</span></p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="editProductFromAdmin(${item.id})" class="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-bold rounded-xl transition-all">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteProductFromAdmin(${item.id})" class="px-3.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold rounded-xl transition-all">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// UPDATE FORM FOR EDITING
function editProductFromAdmin(id) {
  const item = PRODUCTS.find(p => p.id === id);
  if (!item) return;

  document.getElementById('admin-item-id').value = item.id;
  document.getElementById('admin-item-name').value = item.name;
  document.getElementById('admin-item-price').value = item.price;
  document.getElementById('admin-item-category').value = item.category;
  document.getElementById('admin-item-image').value = item.image;
  document.getElementById('admin-item-featured').checked = !!item.featured;

  document.getElementById('form-title').textContent = "Edit Jersey Details";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// RESET FORM
function resetAdminForm() {
  document.getElementById('admin-form')?.reset();
  document.getElementById('admin-item-id').value = '';
  document.getElementById('form-title').textContent = "Add New Jersey";
}

// SAVE OR UPDATE PRODUCT
function saveProductFromAdmin(e) {
  e.preventDefault();

  const id = document.getElementById('admin-item-id').value;
  const name = document.getElementById('admin-item-name').value.trim();
  const price = parseFloat(document.getElementById('admin-item-price').value);
  const category = document.getElementById('admin-item-category').value;
  const image = document.getElementById('admin-item-image').value.trim();
  const featured = document.getElementById('admin-item-featured').checked;

  if (id) {
    const idx = PRODUCTS.findIndex(p => p.id == id);
    if (idx !== -1) {
      PRODUCTS[idx] = { ...PRODUCTS[idx], name, price, category, image, featured };
    }
  } else {
    const newItem = {
      id: Date.now(),
      name,
      price,
      category,
      image,
      featured,
      sizes: category === 'Kids' ? ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"] : ["S", "M", "L", "XL", "XXL"]
    };
    PRODUCTS.push(newItem);
  }

  saveToStorage();
  resetAdminForm();
  renderAdminList();
  updateStats();
  alert("Jersey catalog updated successfully!");
}

// DELETE PRODUCT
function deleteProductFromAdmin(id) {
  if (confirm("Are you sure you want to delete this jersey?")) {
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    saveToStorage();
    renderAdminList();
    updateStats();
  }
}

// STATS CALCULATOR
function updateStats() {
  document.getElementById('stat-total').textContent = PRODUCTS.length;
  document.getElementById('stat-featured').textContent = PRODUCTS.filter(p => p.featured).length;
  
  const avg = PRODUCTS.length > 0 
    ? Math.round(PRODUCTS.reduce((acc, curr) => acc + curr.price, 0) / PRODUCTS.length) 
    : 0;
  document.getElementById('stat-avg-price').textContent = `GH₵ ${avg}`;
}

// Check session on page load
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('admin_authenticated') === 'true') {
    document.getElementById('auth-overlay').classList.add('hidden');
    initAdminPage();
  }
});