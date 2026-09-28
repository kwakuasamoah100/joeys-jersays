// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://lhytegyaeaeksrcdtaos.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w2N6Oev-AiIfwtmtdbgQXQ_KHpyBWzl';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let PRODUCTS = [];

// 1. SUPABASE AUTHENTICATION
async function authenticateAdmin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('admin-email-input');
  const email = emailInput ? emailInput.value : '';
  const password = document.getElementById('admin-passcode-input').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Authentication Failed: " + error.message);
  } else {
    document.getElementById('auth-overlay').classList.add('hidden');
    initAdminPage();
  }
}

async function lockAdminPortal() {
  await supabaseClient.auth.signOut();
  document.getElementById('auth-overlay').classList.remove('hidden');
}

// 2. INITIALIZE PORTAL
async function initAdminPage() {
  await fetchProducts();
}

// 3. FETCH PRODUCTS FROM SUPABASE DATABASE
async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from('jerseys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching inventory:", error.message);
    alert("Failed to load inventory from database.");
    return;
  }

  PRODUCTS = data || [];
  renderAdminList();
  updateStats();
}

// 4. RENDER INVENTORY LIST
function renderAdminList() {
  const list = document.getElementById('admin-items-list');
  if (!list) return;

  if (PRODUCTS.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-500 py-6 text-center">No jerseys currently in database.</p>`;
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
        <button onclick="editProductFromAdmin('${item.id}')" class="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-bold rounded-xl transition-all">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button onclick="deleteProductFromAdmin('${item.id}')" class="px-3.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold rounded-xl transition-all">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// 5. EDIT PRODUCT FORM PREFILL
function editProductFromAdmin(id) {
  const item = PRODUCTS.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById('admin-item-id').value = item.id;
  document.getElementById('admin-item-name').value = item.name;
  document.getElementById('admin-item-price').value = item.price;
  document.getElementById('admin-item-category').value = item.category;
  
  const urlInput = document.getElementById('admin-item-image');
  if (urlInput) urlInput.value = item.image;
  
  document.getElementById('admin-item-featured').checked = !!item.featured;

  const fileInput = document.getElementById('admin-item-file');
  if (fileInput) fileInput.value = '';

  document.getElementById('form-title').textContent = "Edit Jersey Details";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// RESET FORM
function resetAdminForm() {
  document.getElementById('admin-form')?.reset();
  document.getElementById('admin-item-id').value = '';
  document.getElementById('form-title').textContent = "Add New Jersey";
}

// 6. SAVE OR UPDATE PRODUCT IN DATABASE WITH IMAGE UPLOAD SUPPORT
async function saveProductFromAdmin(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('admin-submit-btn') || e.target.querySelector('button[type="submit"]');
  const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Save Jersey';

  const id = document.getElementById('admin-item-id').value;
  const name = document.getElementById('admin-item-name').value.trim();
  const price = parseFloat(document.getElementById('admin-item-price').value);
  const category = document.getElementById('admin-item-category').value;
  const featured = document.getElementById('admin-item-featured').checked;
  
  const fileInput = document.getElementById('admin-item-file');
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;
  const urlInput = document.getElementById('admin-item-image');
  let image = urlInput ? urlInput.value.trim() : '';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    if (file) {
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...`;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('jersays')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw new Error("Image Upload Failed: " + uploadError.message);
      }

      const { data: urlData } = supabaseClient.storage
        .from('jersays')
        .getPublicUrl(filePath);

      image = urlData.publicUrl;
    }

    if (!image) {
      alert("Please upload an image file or provide an image URL.");
      return;
    }

    if (id) {
      const { error } = await supabaseClient
        .from('jerseys')
        .update({ name, price, category, image, featured })
        .eq('id', id);

      if (error) throw error;
    } else {
      const { error } = await supabaseClient
        .from('jerseys')
        .insert([{ name, price, category, image, featured }]);

      if (error) throw error;
    }

    resetAdminForm();
    await fetchProducts();
    alert("Jersey catalog updated successfully!");

  } catch (err) {
    console.error("Error saving product:", err);
    alert(err.message || "An unexpected error occurred while saving.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  }
}

// 7. DELETE PRODUCT FROM DATABASE
async function deleteProductFromAdmin(id) {
  const item = PRODUCTS.find(p => String(p.id) === String(id));

  if (confirm("Are you sure you want to delete this jersey?")) {
    const { error } = await supabaseClient
      .from('jerseys')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting jersey: " + error.message);
      return;
    }

    if (item && item.image && item.image.includes('/storage/v1/object/public/jersays/')) {
      const storagePath = item.image.split('/jersays/')[1];
      if (storagePath) {
        await supabaseClient.storage.from('jersays').remove([storagePath]);
      }
    }

    await fetchProducts();
  }
}

// 8. CALCULATE STATS
function updateStats() {
  document.getElementById('stat-total').textContent = PRODUCTS.length;
  document.getElementById('stat-featured').textContent = PRODUCTS.filter(p => p.featured).length;
  
  const avg = PRODUCTS.length > 0 
    ? Math.round(PRODUCTS.reduce((acc, curr) => acc + Number(curr.price), 0) / PRODUCTS.length) 
    : 0;
  document.getElementById('stat-avg-price').textContent = `GH₵ ${avg}`;
}

// 9. PERSIST AUTHENTICATION SESSION ON PAGE REFRESH
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (session) {
    document.getElementById('auth-overlay').classList.add('hidden');
    initAdminPage();
  } else {
    document.getElementById('auth-overlay').classList.remove('hidden');
  }
});