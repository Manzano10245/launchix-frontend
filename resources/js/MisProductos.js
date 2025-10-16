// MisProductos.js - Lista y gestiona los productos del emprendedor autenticado
import './config.js';

function buildApiUrl(endpoint) {
  const base = (window.API_BASE_URL || '').replace(/\/$/, '');
  const prefix = (window.API_PREFIX || '/api/v1');
  if (!endpoint) return `${base}${prefix}`;
  if (endpoint.startsWith('http')) return endpoint;
  if (endpoint.startsWith(prefix)) return `${base}${endpoint}`;
  if (endpoint.startsWith('/')) return `${base}${prefix}${endpoint}`;
  return `${base}${prefix}/${endpoint}`;
}

function authHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (window.API_TOKEN) headers['Authorization'] = `Bearer ${window.API_TOKEN}`;
  return headers;
}

async function getEntrepreneurId() {
  try {
    if (window.ENTREPRENEUR_ID) return window.ENTREPRENEUR_ID;
    const cached = localStorage.getItem('ENTREPRENEUR_ID');
    if (cached) { window.ENTREPRENEUR_ID = cached; return cached; }
    const mePath = window.API_EP_ME || `${(window.API_PREFIX || '/api/v1')}/entrepreneur/me`;
    const base = (window.API_BASE_URL || '').replace(/\/$/, '');
    const url = `${base}${mePath.startsWith('/') ? mePath : `/${mePath}`}`;
    const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const payload = data?.data || data?.user || data?.entrepreneur || data;
    const id = payload?.id || payload?.entrepreneur_id || null;
    if (id != null) {
      window.ENTREPRENEUR_ID = String(id);
      try { localStorage.setItem('ENTREPRENEUR_ID', String(id)); } catch {}
      return String(id);
    }
    return null;
  } catch { return null; }
}

function resolveImg(url) {
  if (!url) return 'https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (window.API_BASE_URL || '').replace(/\/$/, '');
  const rel = String(url).replace(/^\/+/, '');
  return `${base}/${rel.startsWith('storage/') ? rel : `storage/${rel.replace(/^storage\//,'')}`}`;
}

function productCard(p) {
  const img = resolveImg(p.main_image || p.image || p.photo || '');
  const name = p.name || p.nombre || 'Producto';
  const price = p.price ?? p.precio ?? null;
  const priceText = price != null ? `$${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  return `
    <div class="product-card bg-white rounded-lg shadow overflow-hidden">
      <div class="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src="${img}" alt="${name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x300/F77786/FFFFFF?text=Producto'" />
      </div>
      <div class="p-4">
        <div class="font-semibold text-gray-800 truncate">${name}</div>
        <div class="text-sm text-gray-600 mt-1">${priceText}</div>
        <div class="flex gap-2 mt-3">
          <button class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled>Editar</button>
          <button class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50" disabled>Eliminar</button>
        </div>
      </div>
    </div>`;
}

async function fetchMyProducts() {
  const primary = buildApiUrl(window.API_REL_EP_PRODUCTS || '/entrepreneur/products');
  const fallback = buildApiUrl(window.API_REL_EP_PRODUCTS_FALLBACK || '/products');

  const doFetch = async (endpoint) => {
    const res = await fetch(endpoint, { method: 'GET', headers: authHeaders(), credentials: window.API_WITH_CREDENTIALS ? 'include' : 'same-origin' });
    let data = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.products)) return data.products;
    return [];
  };

  const filterByEntrepreneur = async (items) => {
    const eid = await getEntrepreneurId();
    if (!eid) return [];

    const getOwnerId = (p) => {
      // Direct snake_case
      if (p?.entrepreneur_id != null) return p.entrepreneur_id;
      if (p?.emprendedor_id != null) return p.emprendedor_id;
      if (p?.owner_id != null) return p.owner_id;
      if (p?.user_id != null) return p.user_id;
      if (p?.usuario_id != null) return p.usuario_id;
      if (p?.created_by_id != null) return p.created_by_id;
      if (p?.creator_id != null) return p.creator_id;
      if (p?.author_id != null) return p.author_id;

      // camelCase
      if (p?.entrepreneurId != null) return p.entrepreneurId;
      if (p?.emprendedorId != null) return p.emprendedorId;
      if (p?.ownerId != null) return p.ownerId;
      if (p?.userId != null) return p.userId;
      if (p?.usuarioId != null) return p.usuarioId;
      if (p?.createdById != null) return p.createdById;
      if (p?.creatorId != null) return p.creatorId;
      if (p?.authorId != null) return p.authorId;

      // Nested relations
      if (p?.entrepreneur?.id != null) return p.entrepreneur.id;
      if (p?.emprendedor?.id != null) return p.emprendedor.id;
      if (p?.owner?.id != null) return p.owner.id;
      if (p?.user?.id != null) return p.user.id;
      if (p?.usuario?.id != null) return p.usuario.id;
      if (p?.created_by?.id != null) return p.created_by.id;
      if (p?.creator?.id != null) return p.creator.id;
      if (p?.author?.id != null) return p.author.id;

      return null;
    };

    return (items || []).filter(p => {
      const id = getOwnerId(p);
      return id != null && String(id) === String(eid);
    });
  };

  // If we already know the primary endpoint doesn't exist, go straight to fallback.
  if (window.API_EP_PRODUCTS_USE_FALLBACK) {
    const all = await doFetch(fallback);
    return filterByEntrepreneur(all);
  }

  try {
    const mine = await doFetch(primary);
    // Si el endpoint primario NO es el de emprendedor (genérico /products), filtrar por emprendedor
    const isGenericPrimary = /\/products\b/.test(primary) && !/\/entrepreneur\//.test(primary);
    if (isGenericPrimary) {
      return filterByEntrepreneur(mine);
    }
    return mine; // primary está acotado al emprendedor
  } catch (e) {
    // Remember to use fallback next time to avoid repeated errors
    window.API_EP_PRODUCTS_USE_FALLBACK = true;
    const all = await doFetch(fallback);
    return filterByEntrepreneur(all);
  }
}

window.loadMisProductos = async function loadMisProductos() {
  const container = document.getElementById('myProductsContainer');
  if (!container) return;
  container.innerHTML = '<div class="text-gray-500 text-sm">Cargando productos...</div>';
  try {
    const items = await fetchMyProducts();
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="text-gray-400 text-center py-8">No tienes productos publicados</div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    grid.innerHTML = items.map(productCard).join('');
    container.innerHTML = '';
    container.appendChild(grid);
  } catch (err) {
    container.innerHTML = `<div class="text-red-600 text-sm">${err.message || 'Error al cargar productos'}</div>`;
  }
}
