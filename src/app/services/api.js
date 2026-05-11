import apiClient from './apiClient';

// ── Peças (anteriormente: localhost:4000/products) ──────────────────────────
export const pecasService = {
  list:   (params) => apiClient.get('pecas/', { params }),
  get:    (id)     => apiClient.get(`pecas/${id}/`),
  create: (data)   => apiClient.post('pecas/', data),
  update: (id, data) => apiClient.put(`pecas/${id}/`, data),
  patch:  (id, data) => apiClient.patch(`pecas/${id}/`, data),
  delete: (id)     => apiClient.delete(`pecas/${id}/`),
};

// ── Ordens de Serviço (anteriormente: localhost:3000/os) ────────────────────
export const ordensService = {
  // Endpoint otimizado para mobile — campos em camelCase (title, client, status, createdAt)
  list:      (params) => apiClient.get('ordens-servico-app/', { params }),
  // Endpoint admin — campos em snake_case (titulo, cliente, veiculo, mecanico...)
  listAdmin: (params) => apiClient.get('ordens-servico/', { params }),
  get:       (id)     => apiClient.get(`ordens-servico/${id}/`),
  create:    (data)   => apiClient.post('ordens-servico/', data),
  update:    (id, data) => apiClient.put(`ordens-servico/${id}/`, data),
  patch:     (id, data) => apiClient.patch(`ordens-servico/${id}/`, data),
  delete:    (id)     => apiClient.delete(`ordens-servico/${id}/`),
};

// ── Veículos (anteriormente: localhost:5000/veiculos) ───────────────────────
export const veiculosService = {
  list:   (params) => apiClient.get('veiculos/', { params }),
  get:    (id)     => apiClient.get(`veiculos/${id}/`),
  create: (data)   => apiClient.post('veiculos/', data),
  update: (id, data) => apiClient.put(`veiculos/${id}/`, data),
  patch:  (id, data) => apiClient.patch(`veiculos/${id}/`, data),
  delete: (id)     => apiClient.delete(`veiculos/${id}/`),
};

// ── Clientes ────────────────────────────────────────────────────────────────
export const clientesService = {
  list:   (params) => apiClient.get('clientes/', { params }),
  get:    (id)     => apiClient.get(`clientes/${id}/`),
  create: (data)   => apiClient.post('clientes/', data),
  update: (id, data) => apiClient.put(`clientes/${id}/`, data),
  delete: (id)     => apiClient.delete(`clientes/${id}/`),
};

// ── Fornecedores ─────────────────────────────────────────────────────────────
export const fornecedoresService = {
  list: (params) => apiClient.get('fornecedores/', { params }),
  get:  (id)     => apiClient.get(`fornecedores/${id}/`),
};