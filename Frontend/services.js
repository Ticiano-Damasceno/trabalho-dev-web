"use strict";

(function () {
  const STORAGE_KEY = "mercadinho-sao-jose-data";
  const AUTH_KEY = "mercadinho-sao-jose-admin-session";
  const DEMO_USERNAME = "admin";
  const DEMO_PASSWORD = "mercadinho123";
  const config = window.MERCADINHO_CONFIG;

  function readLocalData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return { suppliers: [], products: [], sales: [] };

    const data = JSON.parse(stored);
    if (!data || !Array.isArray(data.suppliers) || !Array.isArray(data.products)) {
      throw new Error("Os dados salvos não estão em um formato válido.");
    }
    if (data.sales === undefined) data.sales = [];
    if (!Array.isArray(data.sales)) throw new Error("O histórico de vendas salvo não está em um formato válido.");
    return data;
  }

  function writeLocalData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function localChange(change) {
    const data = readLocalData();
    const result = change(data);
    writeLocalData(data);
    return result;
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    const response = await fetch(`${config.apiBaseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok) {
      const error = new Error(result?.message || `A API retornou o erro ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return result;
  }

  function apiResource(collection, method, id, body) {
    const suffix = id === undefined ? "" : `/${encodeURIComponent(id)}`;
    return request(`/${collection}${suffix}`, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  const localData = {
    async load() {
      return readLocalData();
    },
    async createSupplier(values) {
      return localChange((data) => {
        const supplier = { id: crypto.randomUUID(), ...values };
        data.suppliers.push(supplier);
        return supplier;
      });
    },
    async updateSupplier(id, values) {
      return localChange((data) => {
        const supplier = data.suppliers.find((item) => item.id === id);
        if (!supplier) throw new Error("Fornecedor não encontrado.");
        Object.assign(supplier, values);
        return supplier;
      });
    },
    async deleteSupplier(id) {
      return localChange((data) => {
        if (data.products.some((product) => product.supplierId === id)) {
          throw new Error("Não é possível excluir um fornecedor que ainda possui produtos.");
        }
        data.suppliers = data.suppliers.filter((item) => item.id !== id);
      });
    },
    async createProduct(values) {
      return localChange((data) => {
        const product = { id: crypto.randomUUID(), ...values };
        data.products.push(product);
        return product;
      });
    },
    async updateProduct(id, values) {
      return localChange((data) => {
        const product = data.products.find((item) => item.id === id);
        if (!product) throw new Error("Produto não encontrado.");
        Object.assign(product, values);
        return product;
      });
    },
    async deleteProduct(id) {
      return localChange((data) => {
        data.products = data.products.filter((item) => item.id !== id);
      });
    },
    async createSale(values) {
      return localChange((data) => {
        const product = data.products.find((item) => item.id === values.productId);
        if (!product) throw new Error("Produto não encontrado.");
        if (values.quantity > product.stock) throw new Error(`Estoque insuficiente. Disponível: ${product.stock}.`);
        const sale = {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          quantity: values.quantity,
          unitPrice: Number(product.price),
          date: values.date,
        };
        product.stock -= values.quantity;
        data.sales.push(sale);
        return { sale, product };
      });
    },
  };

  const apiData = {
    async load() {
      const [suppliers, products, sales] = await Promise.all([
        apiResource("suppliers", "GET"),
        apiResource("products", "GET"),
        apiResource("sales", "GET"),
      ]);
      if (!Array.isArray(suppliers) || !Array.isArray(products) || !Array.isArray(sales)) {
        throw new Error("A API retornou listas em um formato inválido.");
      }
      return { suppliers, products, sales };
    },
    createSupplier: (values) => apiResource("suppliers", "POST", undefined, values),
    updateSupplier: (id, values) => apiResource("suppliers", "PUT", id, values),
    deleteSupplier: (id) => apiResource("suppliers", "DELETE", id),
    createProduct: (values) => apiResource("products", "POST", undefined, values),
    updateProduct: (id, values) => apiResource("products", "PUT", id, values),
    deleteProduct: (id) => apiResource("products", "DELETE", id),
    createSale: async (values) => ({
      sale: await apiResource("sales", "POST", undefined, values),
    }),
  };

  const localAuth = {
    async checkSession() {
      return sessionStorage.getItem(AUTH_KEY) === "active";
    },
    async login(username, password) {
      if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
        throw new Error("Usuário ou senha incorretos.");
      }
      sessionStorage.setItem(AUTH_KEY, "active");
    },
    async logout() {
      sessionStorage.removeItem(AUTH_KEY);
    },
  };

  const apiAuth = {
    async checkSession() {
      try {
        const result = await request("/auth/session");
        return result?.authenticated === true;
      } catch (error) {
        if (error.status === 401) return false;
        throw error;
      }
    },
    async login(username, password) {
      await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    async logout() {
      await request("/auth/logout", { method: "POST" });
    },
  };

  const useApi = config.useApi === true;
  window.MercadinhoServices = {
    mode: useApi ? "api" : "local",
    auth: useApi ? apiAuth : localAuth,
    data: useApi ? apiData : localData,
  };
})();
