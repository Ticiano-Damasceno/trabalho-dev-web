"use strict";

const services = window.MercadinhoServices;
const app = document.querySelector("#app");
const notice = document.querySelector("#notice");
const navHome = document.querySelector("#nav-home");
const navSuppliers = document.querySelector("#nav-suppliers");
const navReport = document.querySelector("#nav-report");
const logoutButton = document.querySelector("#logout-button");
const confirmDialog = document.querySelector("#confirm-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMessage = document.querySelector("#dialog-message");
const dialogConfirm = document.querySelector("#dialog-confirm");

let data = { suppliers: [], products: [], sales: [] };
let authenticated = false;
let pendingDelete = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function setPageTitle(title) {
  document.title = `${title} | Mercadinho São José`;
}

function formatCnpj(value) {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length !== 14) return digits;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showNotice(message, isError = false) {
  notice.textContent = message;
  notice.hidden = false;
  notice.classList.toggle("is-error", isError);
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = "";
  notice.classList.remove("is-error");
}

function isAuthenticated() {
  return authenticated;
}

function renderLogin(errorMessage = "") {
  setPageTitle("Acesso do administrador");
  navHome.hidden = true;
  navSuppliers.hidden = true;
  navReport.hidden = true;
  logoutButton.hidden = true;
  app.innerHTML = `
    <section class="login-layout" aria-label="Acesso administrativo">
      <div class="login-brand-panel">
        <div class="login-brand-logo" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <rect width="120" height="120" rx="36" fill="#fff"/>
            <path d="M28 48h64l-6 48H34l-6-48Z" fill="#236b45"/>
            <path d="M43 48V39a17 17 0 0 1 34 0v9" fill="none" stroke="#236b45" stroke-linecap="round" stroke-width="8"/>
            <path d="M60 79V59m0 8c-11 0-17-6-17-15 11 0 17 5 17 15Zm0-5c0-11 6-17 16-17 0 11-5 17-16 17Z" fill="#fff"/>
          </svg>
        </div>
        <p class="eyebrow">Bem-vindo ao</p>
        <h1>Mercadinho<br>São José</h1>
        <p class="login-brand-copy">Organize seus fornecedores e tenha sempre à mão quem entrega cada produto.</p>
        <div class="login-decoration" aria-hidden="true">SJ</div>
      </div>
      <div class="login-card">
        <p class="eyebrow">Área restrita</p>
        <h2>Acesso do administrador</h2>
        <p class="subtitle login-intro">Entre com suas credenciais para gerenciar o mercadinho.</p>
        <form id="login-form" novalidate>
          <div class="field">
            <label for="login-username">Usuário</label>
            <input id="login-username" name="username" type="text" autocomplete="username" required placeholder="Seu usuário">
          </div>
          <div class="field">
            <label for="login-password">Senha</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Sua senha">
          </div>
          <p class="form-error login-error" role="alert" ${errorMessage ? "" : "hidden"}>${escapeHtml(errorMessage)}</p>
          <button class="button button-primary login-submit" type="submit">Entrar no painel <span aria-hidden="true">→</span></button>
        </form>
        ${services.mode === "local" ? `
          <div class="demo-credentials">
            <strong>Acesso para demonstração</strong>
            <span>Usuário: <code>admin</code> · Senha: <code>mercadinho123</code></span>
          </div>
          <p class="login-disclaimer">Este login é demonstrativo e funciona apenas neste navegador. Não use para proteger informações reais.</p>` : ""}
      </div>
    </section>`;
  notice.hidden = true;
  document.querySelector("#login-username").focus();
}

async function renderAuthenticatedHome() {
  authenticated = true;
  navHome.hidden = false;
  navSuppliers.hidden = false;
  navReport.hidden = false;
  logoutButton.hidden = false;
  try {
    data = await services.data.load();
    renderHome();
  } catch (error) {
    app.innerHTML = `<section class="form-card"><p class="eyebrow">Erro ao carregar</p><h1>Não foi possível abrir os cadastros</h1><p class="subtitle">${escapeHtml(error.message)}</p></section>`;
  }
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function salesForMonth(month) {
  return data.sales.filter((sale) => sale.date.slice(0, 7) === month);
}

function monthlyProductTotals(month) {
  const totals = new Map();
  salesForMonth(month).forEach((sale) => {
    const key = sale.productId;
    const existing = totals.get(key) || {
      name: sale.productName,
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += sale.quantity;
    existing.revenue += sale.quantity * sale.unitPrice;
    totals.set(key, existing);
  });
  return [...totals.values()].sort((first, second) =>
    second.quantity - first.quantity || first.name.localeCompare(second.name, "pt-BR")
  );
}

function renderHome() {
  setPageTitle("Início");
  const month = currentMonth();
  const monthSales = salesForMonth(month);
  const unitsSold = monthSales.reduce((total, sale) => total + sale.quantity, 0);
  const quickActions = [
    { action: "suppliers", icon: "▤", title: "Fornecedores", text: "Consultar e cadastrar fornecedores", tone: "green" },
    { action: "new-supplier", icon: "＋", title: "Novo fornecedor", text: "Adicionar um fornecedor ao cadastro", tone: "blue" },
    { action: "sales-report", icon: "▥", title: "Vendas do mês", text: "Ver gráfico e ranking de produtos", tone: "orange" },
    { action: "new-sale", icon: "↗", title: "Registrar venda", text: "Lançar produtos vendidos e atualizar estoque", tone: "purple" },
  ];

  app.innerHTML = `
    <div class="page-heading home-heading">
      <div>
        <p class="eyebrow">Painel de controle</p>
        <h1>Olá, administrador</h1>
        <p class="subtitle">Acompanhe o mercadinho e acesse rapidamente as tarefas do dia.</p>
      </div>
      <span class="today-chip">${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span>
    </div>
    <div class="summary-row home-summary">
      <div class="summary-card"><strong>${data.suppliers.length}</strong><span>Fornecedores</span></div>
      <div class="summary-card"><strong>${data.products.length}</strong><span>Produtos no catálogo</span></div>
      <div class="summary-card"><strong>${unitsSold}</strong><span>Unidades vendidas neste mês</span></div>
    </div>
    <section class="home-section" aria-labelledby="shortcuts-heading">
      <div class="section-heading">
        <div><p class="eyebrow">Acesso rápido</p><h2 id="shortcuts-heading">O que você precisa fazer?</h2></div>
      </div>
      <div class="shortcut-grid">
        ${quickActions.map((item) => `
          <button class="shortcut-card" type="button" data-action="${item.action}">
            <span class="shortcut-icon ${item.tone}" aria-hidden="true">${item.icon}</span>
            <span class="shortcut-copy"><strong>${item.title}</strong><small>${item.text}</small></span>
            <span class="shortcut-arrow" aria-hidden="true">→</span>
          </button>`).join("")}
      </div>
    </section>
    <section class="home-lower-grid">
      <div class="welcome-panel">
        <div class="welcome-mark" aria-hidden="true">SJ</div>
        <p class="eyebrow">Mercadinho São José</p>
        <h2>Organização simples para o dia a dia.</h2>
        <p>Registre as vendas para acompanhar os produtos mais vendidos e manter o estoque atualizado.</p>
        <button class="button button-primary" data-action="new-sale">Registrar uma venda <span aria-hidden="true">→</span></button>
      </div>
      <div class="panel home-activity">
        <div class="panel-top"><h2>Resumo de vendas</h2><button class="button button-link" data-action="sales-report">Ver relatório →</button></div>
        ${monthSales.length ? `
          <div class="activity-summary"><strong>${unitsSold}</strong><span>unidades vendidas em ${new Date(`${month}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long" })}</span></div>
          <p class="activity-note">O relatório mostra os produtos mais vendidos com base nos lançamentos registrados.</p>` : `
          <div class="empty-state compact-empty"><div class="empty-icon" aria-hidden="true">↗</div><h2>Sem vendas registradas neste mês</h2><p>Registre uma venda para começar a acompanhar o desempenho dos produtos.</p></div>`}
      </div>
    </section>`;
  setActiveNavigation("home");
}

function setActiveNavigation(action) {
  navHome.classList.toggle("is-active", action === "home");
  navSuppliers.classList.toggle("is-active", action === "suppliers");
  navReport.classList.toggle("is-active", action === "sales-report");
}

function renderSalesReport(month = currentMonth()) {
  setPageTitle("Produtos mais vendidos");
  const totals = monthlyProductTotals(month);
  const monthSales = salesForMonth(month);
  const totalUnits = monthSales.reduce((total, sale) => total + sale.quantity, 0);
  const totalRevenue = monthSales.reduce((total, sale) => total + sale.quantity * sale.unitPrice, 0);
  const maxQuantity = totals.length ? totals[0].quantity : 0;
  const chartRows = totals.map((item, index) => {
    const width = maxQuantity ? Math.max((item.quantity / maxQuantity) * 100, 4) : 0;
    return `
      <div class="chart-row">
        <span class="chart-rank">${String(index + 1).padStart(2, "0")}</span>
        <span class="chart-product">${escapeHtml(item.name)}</span>
        <span class="chart-track"><span class="chart-bar" style="width:${width}%"></span></span>
        <strong class="chart-value">${item.quantity}</strong>
      </div>`;
  }).join("");
  const tableRows = totals.map((item, index) => `
    <tr>
      <td><span class="rank-pill ${index < 3 ? "top-rank" : ""}">${index + 1}</span></td>
      <td><span class="cell-primary">${escapeHtml(item.name)}</span></td>
      <td><strong>${item.quantity}</strong> ${item.quantity === 1 ? "unidade" : "unidades"}</td>
      <td>${escapeHtml(formatPrice(item.revenue))}</td>
    </tr>`).join("");

  app.innerHTML = `
    <div class="page-heading report-heading">
      <div>
        <p class="eyebrow">Desempenho de vendas</p>
        <h1>Produtos mais vendidos</h1>
        <p class="subtitle">Acompanhe o ranking mensal com base nas vendas registradas.</p>
      </div>
      <button class="button button-primary" data-action="new-sale"><span aria-hidden="true">＋</span> Registrar venda</button>
    </div>
    <section class="report-filter panel">
      <label for="report-month">Mês do relatório</label>
      <input id="report-month" type="month" value="${escapeHtml(month)}" max="${currentMonth()}">
      <span>Os produtos são ordenados pela quantidade de unidades vendidas.</span>
    </section>
    <div class="summary-row report-summary">
      <div class="summary-card"><strong>${totals.length}</strong><span>Produtos vendidos</span></div>
      <div class="summary-card"><strong>${totalUnits}</strong><span>Unidades vendidas</span></div>
      <div class="summary-card"><strong>${escapeHtml(formatPrice(totalRevenue))}</strong><span>Valor registrado</span></div>
    </div>
    ${totals.length ? `
      <section class="panel chart-panel" aria-labelledby="chart-heading">
        <div class="panel-top"><div><h2 id="chart-heading">Ranking de vendas</h2><span class="panel-description">${new Date(`${month}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span></div><span>Unidades</span></div>
        <div class="chart-list" role="img" aria-label="Gráfico de barras dos produtos mais vendidos">
          ${chartRows}
        </div>
      </section>
      <section class="panel sales-table-panel" aria-label="Tabela de produtos mais vendidos">
        <div class="panel-top"><h2>Detalhamento por produto</h2><span>${totals.length} ${totals.length === 1 ? "produto" : "produtos"}</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Posição</th><th>Produto</th><th>Quantidade vendida</th><th>Valor registrado</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </section>` : `
      <section class="panel empty-state report-empty">
        <div class="empty-icon" aria-hidden="true">▥</div>
        <h2>Nenhuma venda registrada neste mês</h2>
        <p>Registre as vendas do período para gerar o gráfico e o ranking dos produtos mais vendidos.</p>
        <button class="button button-primary" data-action="new-sale">Registrar primeira venda</button>
      </section>`}`;
  setActiveNavigation("sales-report");
}

function renderSaleForm() {
  setPageTitle("Registrar venda");
  const availableProducts = data.products.filter((product) => data.suppliers.some((supplier) => supplier.id === product.supplierId));
  const productOptions = availableProducts.map((product) => `
    <option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} — estoque: ${escapeHtml(product.stock)} · ${escapeHtml(formatPrice(product.price))}</option>
  `).join("");

  app.innerHTML = `
    <a class="back-link" href="#" data-action="sales-report">← Voltar para o relatório</a>
    <section class="form-card">
      <p class="eyebrow">Lançamento de saída</p>
      <h1>Registrar venda</h1>
      <p class="subtitle form-intro">Registre os itens vendidos. A quantidade será descontada do estoque automaticamente.</p>
      ${availableProducts.length ? `
        <form id="sale-form" novalidate>
          <div class="form-grid">
            <div class="field field-full">
              <label for="sale-product">Produto <span aria-hidden="true">*</span></label>
              <select id="sale-product" name="productId" required>
                <option value="">Selecione um produto</option>
                ${productOptions}
              </select>
              <p class="field-hint" id="sale-stock-hint">Selecione um produto para consultar o estoque disponível.</p>
            </div>
            <div class="field">
              <label for="sale-quantity">Quantidade vendida <span aria-hidden="true">*</span></label>
              <input id="sale-quantity" name="quantity" type="number" min="1" step="1" required placeholder="1">
            </div>
            <div class="field">
              <label for="sale-date">Data da venda <span aria-hidden="true">*</span></label>
              <input id="sale-date" name="date" type="date" max="${localDateString()}" value="${localDateString()}" required>
            </div>
          </div>
          <p class="form-error" id="form-error" role="alert" hidden></p>
          <div class="form-actions">
            <button class="button button-secondary" type="button" data-action="sales-report">Cancelar</button>
            <button class="button button-primary" type="submit">Salvar venda</button>
          </div>
        </form>` : `
        <div class="empty-state compact-empty">
          <div class="empty-icon" aria-hidden="true">＋</div>
          <h2>Nenhum produto disponível para venda</h2>
          <p>Cadastre um fornecedor e pelo menos um produto antes de lançar vendas.</p>
          <button class="button button-primary" data-action="suppliers">Ver fornecedores</button>
        </div>`}
    </section>`;
  setActiveNavigation("");
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function supplierProducts(supplierId) {
  return data.products.filter((product) => product.supplierId === supplierId);
}

function renderSupplierList() {
  setPageTitle("Fornecedores");
  setActiveNavigation("suppliers");
  const supplierRows = data.suppliers.map((supplier) => {
    const count = supplierProducts(supplier.id).length;
    return `
      <tr>
        <td><span class="cell-primary">${escapeHtml(supplier.name)}</span></td>
        <td>${escapeHtml(formatCnpj(supplier.cnpj))}</td>
        <td>${count} ${count === 1 ? "produto" : "produtos"}</td>
        <td>
          <div class="actions">
            <button class="button button-link" data-action="products" data-id="${escapeHtml(supplier.id)}">Ver produtos</button>
            <button class="button button-link" data-action="edit-supplier" data-id="${escapeHtml(supplier.id)}">Editar</button>
            <button class="button button-link danger-text" data-action="delete-supplier" data-id="${escapeHtml(supplier.id)}">Excluir</button>
          </div>
        </td>
      </tr>`;
  }).join("");

  app.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Cadastros</p>
        <h1>Fornecedores</h1>
        <p class="subtitle">Encontre rapidamente quem fornece cada produto para o mercadinho.</p>
      </div>
      <button class="button button-primary" data-action="new-supplier"><span aria-hidden="true">＋</span> Novo fornecedor</button>
    </div>
    <div class="summary-row">
      <div class="summary-card"><strong>${data.suppliers.length}</strong><span>Fornecedores cadastrados</span></div>
      <div class="summary-card"><strong>${data.products.length}</strong><span>Produtos cadastrados</span></div>
    </div>
    <section class="panel" aria-label="Lista de fornecedores">
      <div class="panel-top"><h2>Todos os fornecedores</h2><span>${data.suppliers.length} registros</span></div>
      ${data.suppliers.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Produtos</th><th style="text-align: right;">Ações</th></tr></thead>
            <tbody>${supplierRows}</tbody>
          </table>
        </div>` : `
        <div class="empty-state">
          <div class="empty-icon" aria-hidden="true">＋</div>
          <h2>Nenhum fornecedor cadastrado</h2>
          <p>Cadastre seu primeiro fornecedor para começar a organizar os produtos e as reposições.</p>
          <button class="button button-primary" data-action="new-supplier">Cadastrar fornecedor</button>
        </div>`}
    </section>`;
}

function renderSupplierForm(supplierId = null) {
  const supplier = supplierId ? data.suppliers.find((item) => item.id === supplierId) : null;
  if (supplierId && !supplier) {
    showNotice("Fornecedor não encontrado.", true);
    renderSupplierList();
    return;
  }
  const editing = Boolean(supplier);
  setPageTitle(editing ? "Editar fornecedor" : "Cadastrar fornecedor");
  app.innerHTML = `
    <a class="back-link" href="#" data-action="suppliers">← Voltar para fornecedores</a>
    <section class="form-card">
      <p class="eyebrow">${editing ? "Atualização" : "Novo cadastro"}</p>
      <h1>${editing ? "Editar fornecedor" : "Cadastrar fornecedor"}</h1>
      <p class="subtitle form-intro">Informe os dados da empresa fornecedora.</p>
      <form id="supplier-form" novalidate data-id="${editing ? escapeHtml(supplier.id) : ""}">
        <div class="form-grid">
          <div class="field field-full">
            <label for="supplier-name">Nome do fornecedor <span aria-hidden="true">*</span></label>
            <input id="supplier-name" name="name" type="text" maxlength="100" required autocomplete="organization" value="${editing ? escapeHtml(supplier.name) : ""}" placeholder="Ex.: Distribuidora São Paulo">
          </div>
          <div class="field field-full">
            <label for="supplier-cnpj">CNPJ <span aria-hidden="true">*</span></label>
            <input id="supplier-cnpj" name="cnpj" type="text" inputmode="numeric" maxlength="18" required autocomplete="off" value="${editing ? escapeHtml(formatCnpj(supplier.cnpj)) : ""}" placeholder="00.000.000/0000-00" aria-describedby="cnpj-hint">
            <p class="field-hint" id="cnpj-hint">Informe os 14 dígitos do CNPJ.</p>
          </div>
        </div>
        <p class="form-error" id="form-error" role="alert" hidden></p>
        <div class="form-actions">
          <button class="button button-secondary" type="button" data-action="suppliers">Cancelar</button>
          <button class="button button-primary" type="submit">${editing ? "Salvar alterações" : "Salvar fornecedor"}</button>
        </div>
      </form>
    </section>`;
  document.querySelector("#supplier-name").focus();
}

function renderProducts(supplierId) {
  setActiveNavigation("suppliers");
  const supplier = data.suppliers.find((item) => item.id === supplierId);
  if (!supplier) {
    showNotice("Fornecedor não encontrado.", true);
    renderSupplierList();
    return;
  }
  const products = supplierProducts(supplierId);
  setPageTitle(`Produtos de ${supplier.name}`);
  const productRows = products.map((product) => `
    <tr>
      <td><span class="cell-primary">${escapeHtml(product.name)}</span></td>
      <td>${escapeHtml(formatPrice(product.price))}</td>
      <td>${escapeHtml(product.stock)}</td>
      <td>
        <div class="actions">
          <button class="button button-link" data-action="edit-product" data-id="${escapeHtml(product.id)}">Editar</button>
          <button class="button button-link danger-text" data-action="delete-product" data-id="${escapeHtml(product.id)}">Excluir</button>
        </div>
      </td>
    </tr>`).join("");

  app.innerHTML = `
    <a class="back-link" href="#" data-action="suppliers">← Voltar para fornecedores</a>
    <div class="page-heading">
      <div>
        <p class="eyebrow">Produtos do fornecedor</p>
        <h1>${escapeHtml(supplier.name)}</h1>
        <p class="subtitle">CNPJ ${escapeHtml(formatCnpj(supplier.cnpj))} · ${products.length} ${products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}</p>
      </div>
      <button class="button button-primary" data-action="new-product" data-supplier-id="${escapeHtml(supplier.id)}"><span aria-hidden="true">＋</span> Novo produto</button>
    </div>
    <section class="panel" aria-label="Produtos de ${escapeHtml(supplier.name)}">
      <div class="panel-top"><h2>Produtos</h2><span>${products.length} registros</span></div>
      ${products.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Preço</th><th>Estoque</th><th style="text-align: right;">Ações</th></tr></thead>
            <tbody>${productRows}</tbody>
          </table>
        </div>` : `
        <div class="empty-state">
          <div class="empty-icon" aria-hidden="true">＋</div>
          <h2>Nenhum produto deste fornecedor</h2>
          <p>Adicione os produtos que este fornecedor entrega para facilitar a próxima reposição.</p>
          <button class="button button-primary" data-action="new-product" data-supplier-id="${escapeHtml(supplier.id)}">Cadastrar produto</button>
        </div>`}
    </section>`;
}

function renderProductForm(supplierId, productId = null) {
  setActiveNavigation("suppliers");
  const supplier = data.suppliers.find((item) => item.id === supplierId);
  const product = productId ? data.products.find((item) => item.id === productId) : null;
  if (!supplier || (productId && (!product || product.supplierId !== supplierId))) {
    showNotice("Fornecedor ou produto não encontrado.", true);
    renderSupplierList();
    return;
  }
  const editing = Boolean(product);
  setPageTitle(editing ? "Editar produto" : "Cadastrar produto");
  app.innerHTML = `
    <a class="back-link" href="#" data-action="products" data-id="${escapeHtml(supplier.id)}">← Voltar para produtos</a>
    <section class="form-card">
      <p class="eyebrow">${editing ? "Atualização" : "Novo cadastro"}</p>
      <h1>${editing ? "Editar produto" : "Cadastrar produto"}</h1>
      <p class="subtitle form-intro">Fornecedor: <strong>${escapeHtml(supplier.name)}</strong></p>
      <form id="product-form" novalidate data-id="${editing ? escapeHtml(product.id) : ""}" data-supplier-id="${escapeHtml(supplier.id)}">
        <div class="form-grid">
          <div class="field field-full">
            <label for="product-name">Nome do produto <span aria-hidden="true">*</span></label>
            <input id="product-name" name="name" type="text" maxlength="100" required value="${editing ? escapeHtml(product.name) : ""}" placeholder="Ex.: Arroz tipo 1 - 5 kg">
          </div>
          <div class="field">
            <label for="product-price">Preço (R$) <span aria-hidden="true">*</span></label>
            <input id="product-price" name="price" type="number" min="0.01" step="0.01" required value="${editing ? escapeHtml(product.price) : ""}" placeholder="0,00">
          </div>
          <div class="field">
            <label for="product-stock">Quantidade em estoque <span aria-hidden="true">*</span></label>
            <input id="product-stock" name="stock" type="number" min="0" step="1" required value="${editing ? escapeHtml(product.stock) : ""}" placeholder="0">
            <p class="field-hint">A quantidade não pode ser negativa.</p>
          </div>
        </div>
        <p class="form-error" id="form-error" role="alert" hidden></p>
        <div class="form-actions">
          <button class="button button-secondary" type="button" data-action="products" data-id="${escapeHtml(supplier.id)}">Cancelar</button>
          <button class="button button-primary" type="submit">${editing ? "Salvar alterações" : "Salvar produto"}</button>
        </div>
      </form>
    </section>`;
  document.querySelector("#product-name").focus();
}

function showFormError(message, fields) {
  const error = document.querySelector("#form-error");
  error.textContent = message;
  error.hidden = false;
  fields.forEach((field) => field.setAttribute("aria-invalid", "true"));
  fields[0].focus();
}

function clearFieldErrors(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
  const error = form.querySelector("#form-error");
  error.hidden = true;
  error.textContent = "";
}

async function handleSupplierSubmit(form) {
  const nameInput = form.elements.name;
  const cnpjInput = form.elements.cnpj;
  clearFieldErrors(form);
  const name = nameInput.value.trim();
  const cnpj = cnpjInput.value.replace(/\D/g, "");
  const invalid = [];
  if (!name) invalid.push(nameInput);
  if (cnpj.length !== 14) invalid.push(cnpjInput);
  if (invalid.length) {
    showFormError(!name ? "Preencha o nome do fornecedor." : "O CNPJ deve conter exatamente 14 dígitos.", invalid);
    return;
  }

  const id = form.dataset.id;
  const duplicate = data.suppliers.find((supplier) => supplier.cnpj === cnpj && supplier.id !== id);
  if (duplicate) {
    showFormError("Já existe um fornecedor cadastrado com este CNPJ.", [cnpjInput]);
    return;
  }

  try {
    const values = { name, cnpj };
    const supplier = id
      ? await services.data.updateSupplier(id, values)
      : await services.data.createSupplier(values);
    if (id) {
      data.suppliers = data.suppliers.map((item) => item.id === id ? supplier : item);
    } else {
      data.suppliers.push(supplier);
    }
  } catch (error) {
    showNotice(error.message, true);
    return;
  }
  clearNotice();
  renderSupplierList();
  showNotice(id ? "Fornecedor atualizado com sucesso." : "Fornecedor cadastrado com sucesso.");
}

async function handleProductSubmit(form) {
  const nameInput = form.elements.name;
  const priceInput = form.elements.price;
  const stockInput = form.elements.stock;
  clearFieldErrors(form);
  const name = nameInput.value.trim();
  const price = priceInput.valueAsNumber;
  const stock = stockInput.valueAsNumber;
  const invalid = [];
  if (!name) invalid.push(nameInput);
  if (!Number.isFinite(price) || price <= 0) invalid.push(priceInput);
  if (!Number.isInteger(stock) || stock < 0) invalid.push(stockInput);
  if (invalid.length) {
    let message = "Verifique os campos informados.";
    if (!name) message = "Preencha o nome do produto.";
    else if (!Number.isFinite(price) || price <= 0) message = "Informe um preço maior que zero.";
    else if (!Number.isInteger(stock) || stock < 0) message = "O estoque deve ser um número inteiro igual ou maior que zero.";
    showFormError(message, invalid);
    return;
  }

  const supplierId = form.dataset.supplierId;
  const id = form.dataset.id;
  try {
    const values = { supplierId, name, price, stock };
    const product = id
      ? await services.data.updateProduct(id, values)
      : await services.data.createProduct(values);
    if (id) {
      data.products = data.products.map((item) => item.id === id ? product : item);
    } else {
      data.products.push(product);
    }
  } catch (error) {
    showNotice(error.message, true);
    return;
  }
  clearNotice();
  renderProducts(supplierId);
  showNotice(id ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
}

async function handleSaleSubmit(form) {
  const productInput = form.elements.productId;
  const quantityInput = form.elements.quantity;
  const dateInput = form.elements.date;
  clearFieldErrors(form);

  const product = data.products.find((item) => item.id === productInput.value);
  const quantity = quantityInput.valueAsNumber;
  const date = dateInput.value;
  const invalid = [];
  if (!product) invalid.push(productInput);
  if (!Number.isInteger(quantity) || quantity < 1 || (product && quantity > product.stock)) invalid.push(quantityInput);
  if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`)) || date > localDateString()) invalid.push(dateInput);
  if (invalid.length) {
    let message = "Confira os dados da venda.";
    if (!product) message = "Selecione um produto cadastrado.";
    else if (!Number.isInteger(quantity) || quantity < 1) message = "A quantidade vendida deve ser um número inteiro maior que zero.";
    else if (quantity > product.stock) message = `Estoque insuficiente. Disponível: ${product.stock} ${product.stock === 1 ? "unidade" : "unidades"}.`;
    else if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`)) || date > localDateString()) message = "Informe uma data válida, que não seja futura.";
    showFormError(message, invalid);
    return;
  }

  let result;
  try {
    result = await services.data.createSale({ productId: product.id, quantity, date });
  } catch (error) {
    showNotice(error.message, true);
    return;
  }
  if (!result.sale) {
    showNotice("A API não retornou a venda criada em um formato válido.", true);
    return;
  }
  data.sales.push(result.sale);
  const updatedProduct = result.product || { ...product, stock: product.stock - quantity };
  data.products = data.products.map((item) => item.id === product.id ? updatedProduct : item);
  renderSalesReport(date.slice(0, 7));
  showNotice("Venda registrada e estoque atualizado com sucesso.");
}

function askDelete(title, message, callback) {
  pendingDelete = callback;
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;
  confirmDialog.showModal();
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  event.preventDefault();
  const { action, id, supplierId } = button.dataset;
  clearNotice();

  if (action === "logout") {
    try {
      await services.auth.logout();
      authenticated = false;
      renderLogin();
    } catch (error) {
      showNotice(error.message, true);
    }
    return;
  }
  if (!isAuthenticated()) return;

  if (action === "home") renderHome();
  if (action === "suppliers") renderSupplierList();
  if (action === "sales-report") renderSalesReport();
  if (action === "new-sale") renderSaleForm();
  if (action === "new-supplier") renderSupplierForm();
  if (action === "edit-supplier") renderSupplierForm(id);
  if (action === "products") renderProducts(id);
  if (action === "new-product") renderProductForm(supplierId);
  if (action === "edit-product") {
    const product = data.products.find((item) => item.id === id);
    if (product) renderProductForm(product.supplierId, id);
  }
  if (action === "delete-supplier") {
    const supplier = data.suppliers.find((item) => item.id === id);
    if (!supplier) return;
    const linkedProducts = supplierProducts(id);
    if (linkedProducts.length) {
      showNotice(`Não é possível excluir "${supplier.name}": remova ou reassocie os ${linkedProducts.length} produtos vinculados primeiro.`, true);
      return;
    }
    askDelete("Excluir fornecedor?", `Tem certeza que deseja excluir "${supplier.name}"? Esta ação não pode ser desfeita.`, async () => {
      await services.data.deleteSupplier(id);
      data.suppliers = data.suppliers.filter((item) => item.id !== id);
      renderSupplierList();
      showNotice("Fornecedor excluído com sucesso.");
    });
  }
  if (action === "delete-product") {
    const product = data.products.find((item) => item.id === id);
    if (!product) return;
    askDelete("Excluir produto?", `Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`, async () => {
      await services.data.deleteProduct(id);
      data.products = data.products.filter((item) => item.id !== id);
      renderProducts(product.supplierId);
      showNotice("Produto excluído com sucesso.");
    });
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "login-form") {
    event.preventDefault();
    const username = event.target.elements.username.value.trim();
    const password = event.target.elements.password.value;
    try {
      await services.auth.login(username, password);
    } catch (error) {
      renderLogin(error.message);
      return;
    }
    clearNotice();
    await renderAuthenticatedHome();
    return;
  }
  if (!isAuthenticated()) return;
  if (event.target.id === "supplier-form") {
    event.preventDefault();
    await handleSupplierSubmit(event.target);
  }
  if (event.target.id === "product-form") {
    event.preventDefault();
    await handleProductSubmit(event.target);
  }
  if (event.target.id === "sale-form") {
    event.preventDefault();
    await handleSaleSubmit(event.target);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "report-month") {
    const selectedMonth = event.target.value;
    if (selectedMonth) renderSalesReport(selectedMonth);
  }
  if (event.target.id === "sale-product") {
    const product = data.products.find((item) => item.id === event.target.value);
    const stockHint = document.querySelector("#sale-stock-hint");
    const quantityInput = document.querySelector("#sale-quantity");
    if (product && stockHint && quantityInput) {
      stockHint.textContent = `Estoque disponível: ${product.stock} ${product.stock === 1 ? "unidade" : "unidades"}.`;
      quantityInput.max = product.stock;
    } else if (stockHint && quantityInput) {
      stockHint.textContent = "Selecione um produto para consultar o estoque disponível.";
      quantityInput.removeAttribute("max");
    }
  }
});

dialogConfirm.addEventListener("click", async (event) => {
  if (event.target.value !== "confirm" || !pendingDelete) return;
  const deleteRecord = pendingDelete;
  pendingDelete = null;
  try {
    await deleteRecord();
  } catch (error) {
    showNotice(error.message, true);
  }
});

confirmDialog.addEventListener("close", () => {
  pendingDelete = null;
});

async function initializeApp() {
  try {
    if (await services.auth.checkSession()) {
      await renderAuthenticatedHome();
    } else {
      renderLogin();
    }
  } catch (error) {
    renderLogin(`Não foi possível conectar ao serviço. ${error.message}`);
  }
}

initializeApp();
