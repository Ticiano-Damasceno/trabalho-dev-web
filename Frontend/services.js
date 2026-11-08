"use strict";
(function () {
  const API_URL = window.MERCADINHO_CONFIG.apiBaseUrl.replace(/\/$/, "");

  async function request(rota, options = {}) {
    const headers = {
      ...options.headers
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${rota}`, {
      ...options,
      headers
    });

    if (response.status === 204) return null;

    const resultado = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        resultado?.mensagem ||
        `Erro na API: ${response.status}`
      );
    }

    return resultado;
  }

  const data = {
    async load() {
      const fornecedores = await request("/fornecedores");
      if (!Array.isArray(fornecedores)) throw new Error("Lista de fornecedores inválida.");
      const listas = await Promise.all(fornecedores.map(fornecedor => request(`/fornecedores/${fornecedor.id}/produtos`)));
      if (listas.some(lista => !Array.isArray(lista))) throw new Error("Lista de produtos inválida.");
      return { fornecedores, produtos: listas.flat() };
    },
    createSupplier(valores) { return request("/fornecedores", { method: "POST", body: JSON.stringify(valores) }); },
    updateSupplier(id, valores) { return request(`/fornecedores/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(valores) }); },
    deleteSupplier(id) { return request(`/fornecedores/${encodeURIComponent(id)}`, { method: "DELETE" }); },
    createProduct(valores) { return request("/produtos", { method: "POST", body: JSON.stringify(valores) }); },
    updateProduct(id, valores) { return request(`/produtos/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(valores) }); },
    deleteProduct(id) { return request(`/produtos/${encodeURIComponent(id)}`, { method: "DELETE" }); }
  };

  window.MercadinhoServices = { data };
})();
