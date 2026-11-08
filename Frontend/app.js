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
let data = { fornecedores: [], produtos: [] };
let pendingDelete = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
function setPageTitle(title) { document.title = `${title} | Mercadinho São José`; }
function formatCnpj(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 14 ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : digits;
}
function showNotice(message, isError = false) {
  notice.textContent = message;
  notice.hidden = false;
  notice.classList.toggle("is-error", isError);
}
function clearNotice() { notice.hidden = true; notice.textContent = ""; notice.classList.remove("is-error"); }
function setActiveNavigation(action) {
  navHome.classList.toggle("is-active", action === "home");
  navSuppliers.classList.toggle("is-active", action === "suppliers");
}
function produtosDoFornecedor(fornecedorId) {
  return data.produtos.filter(produto => produto.fornecedor_id === Number(fornecedorId));
}
function renderHome() {
  setPageTitle("Início");
  setActiveNavigation("home");
  const estoqueTotal = data.produtos.reduce((total, produto) => total + Number(produto.quantidade_estoque || 0), 0);
  app.innerHTML = `
    <div class="page-heading home-heading">
      <div><p class="eyebrow">Painel de controle</p><h1>Mercadinho São José</h1>
        <p class="subtitle">Gerencie fornecedores, produtos e estoque com dados da API de produção.</p></div>
      <span class="today-chip">${new Date().toLocaleDateString("pt-BR", {day:"numeric",month:"long",year:"numeric"})}</span>
    </div>
    <div class="summary-row home-summary">
      <div class="summary-card"><strong>${data.fornecedores.length}</strong><span>Fornecedores</span></div>
      <div class="summary-card"><strong>${data.produtos.length}</strong><span>Produtos cadastrados</span></div>
      <div class="summary-card"><strong>${estoqueTotal}</strong><span>Unidades em estoque</span></div>
    </div>
    <section class="home-section">
      <div class="section-heading"><div><p class="eyebrow">Acesso rápido</p><h2>O que você precisa fazer?</h2></div></div>
      <div class="shortcut-grid">
        <button class="shortcut-card" type="button" data-action="suppliers"><span class="shortcut-icon green">▤</span><span class="shortcut-copy"><strong>Fornecedores</strong><small>Consultar fornecedores e seus produtos</small></span><span class="shortcut-arrow">→</span></button>
        <button class="shortcut-card" type="button" data-action="new-supplier"><span class="shortcut-icon blue">＋</span><span class="shortcut-copy"><strong>Novo fornecedor</strong><small>Adicionar fornecedor ao cadastro</small></span><span class="shortcut-arrow">→</span></button>
        <button class="shortcut-card" type="button" data-action="reload"><span class="shortcut-icon orange">↻</span><span class="shortcut-copy"><strong>Atualizar dados</strong><small>Consultar novamente o banco de dados</small></span><span class="shortcut-arrow">→</span></button>
      </div>
    </section>`;
}
function renderSupplierList() {
  setPageTitle("Fornecedores"); setActiveNavigation("suppliers");
  const rows = data.fornecedores.map(fornecedor => {
    const count = produtosDoFornecedor(fornecedor.id).length;
    return `<tr>
      <td><span class="cell-primary">${escapeHtml(fornecedor.nome)}</span></td>
      <td>${escapeHtml(formatCnpj(fornecedor.cnpj))}</td>
      <td>${escapeHtml(fornecedor.telefone || "—")}</td>
      <td>${escapeHtml(fornecedor.email || "—")}</td>
      <td>${count}</td>
      <td><div class="actions">
        <button class="button button-link" data-action="products" data-id="${fornecedor.id}">Ver produtos</button>
        <button class="button button-link" data-action="edit-supplier" data-id="${fornecedor.id}">Editar</button>
        <button class="button button-link danger-text" data-action="delete-supplier" data-id="${fornecedor.id}">Excluir</button>
      </div></td></tr>`;
  }).join("");
  app.innerHTML = `<div class="page-heading"><div><p class="eyebrow">Cadastros</p><h1>Fornecedores</h1><p class="subtitle">Gerencie os fornecedores cadastrados.</p></div>
    <button class="button button-primary" data-action="new-supplier">＋ Novo fornecedor</button></div>
    <div class="summary-row"><div class="summary-card"><strong>${data.fornecedores.length}</strong><span>Fornecedores</span></div><div class="summary-card"><strong>${data.produtos.length}</strong><span>Produtos cadastrados</span></div></div>
    <section class="panel"><div class="panel-top"><h2>Todos os fornecedores</h2><span>${data.fornecedores.length} registros</span></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Telefone</th><th>E-mail</th><th>Produtos</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : `<div class="empty-state"><h2>Nenhum fornecedor cadastrado</h2><button class="button button-primary" data-action="new-supplier">Cadastrar fornecedor</button></div>`}</section>`;
}
function renderSupplierForm(id = null) {
  const fornecedor = id ? data.fornecedores.find(item => item.id === Number(id)) : null;
  if (id && !fornecedor) return showNotice("Fornecedor não encontrado.", true);
  const editing = Boolean(fornecedor);
  setPageTitle(editing ? "Editar fornecedor" : "Cadastrar fornecedor");
  app.innerHTML = `<a class="back-link" href="#" data-action="suppliers">← Voltar para fornecedores</a>
  <section class="form-card"><p class="eyebrow">${editing ? "Atualização" : "Novo cadastro"}</p>
  <h1>${editing ? "Editar fornecedor" : "Cadastrar fornecedor"}</h1>
  <form id="supplier-form" novalidate data-id="${fornecedor?.id ?? ""}"><div class="form-grid">
    <div class="field field-full"><label for="supplier-name">Nome do fornecedor *</label><input id="supplier-name" name="nome" maxlength="100" required value="${escapeHtml(fornecedor?.nome)}"></div>
    <div class="field field-full"><label for="supplier-cnpj">CNPJ *</label><input id="supplier-cnpj" name="cnpj" inputmode="numeric" maxlength="18" required value="${escapeHtml(formatCnpj(fornecedor?.cnpj))}" placeholder="00.000.000/0000-00"></div>
    <div class="field"><label for="supplier-phone">Telefone</label><input id="supplier-phone" name="telefone" maxlength="30" type="tel" value="${escapeHtml(fornecedor?.telefone)}" placeholder="(85) 99999-9999"></div>
    <div class="field"><label for="supplier-email">E-mail</label><input id="supplier-email" name="email" maxlength="254" type="email" value="${escapeHtml(fornecedor?.email)}"></div>
  </div><p class="form-error" id="form-error" role="alert" hidden></p><div class="form-actions">
    <button class="button button-secondary" type="button" data-action="suppliers">Cancelar</button>
    <button class="button button-primary" type="submit">${editing ? "Salvar alterações" : "Salvar fornecedor"}</button>
  </div></form></section>`;
  document.querySelector("#supplier-name").focus();
}
function renderProducts(fornecedorId) {
  const fornecedor = data.fornecedores.find(item => item.id === Number(fornecedorId));
  if (!fornecedor) return showNotice("Fornecedor não encontrado.", true);
  setActiveNavigation("suppliers"); setPageTitle(`Produtos de ${fornecedor.nome}`);
  const produtos = produtosDoFornecedor(fornecedorId);
  const rows = produtos.map(produto => `<tr>
    <td><span class="cell-primary">${escapeHtml(produto.nome)}</span></td>
    <td>${escapeHtml(produto.descricao || "—")}</td><td>${escapeHtml(produto.quantidade_estoque)}</td>
    <td><div class="actions"><button class="button button-link" data-action="edit-product" data-id="${produto.id}">Editar</button><button class="button button-link danger-text" data-action="delete-product" data-id="${produto.id}">Excluir</button></div></td>
  </tr>`).join("");
  app.innerHTML = `<a class="back-link" href="#" data-action="suppliers">← Voltar para fornecedores</a>
    <div class="page-heading"><div><p class="eyebrow">Produtos do fornecedor</p><h1>${escapeHtml(fornecedor.nome)}</h1><p class="subtitle">CNPJ ${escapeHtml(formatCnpj(fornecedor.cnpj))} · ${produtos.length} produtos cadastrados</p></div>
    <button class="button button-primary" data-action="new-product" data-supplier-id="${fornecedor.id}">＋ Novo produto</button></div>
    <section class="panel"><div class="panel-top"><h2>Produtos</h2><span>${produtos.length} registros</span></div>
    ${rows ? `<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Descrição</th><th>Estoque</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : `<div class="empty-state"><h2>Nenhum produto deste fornecedor</h2><button class="button button-primary" data-action="new-product" data-supplier-id="${fornecedor.id}">Cadastrar produto</button></div>`}</section>`;
}
function renderProductForm(fornecedorId, productId = null) {
  const fornecedor = data.fornecedores.find(item => item.id === Number(fornecedorId));
  const produto = productId ? data.produtos.find(item => item.id === Number(productId)) : null;
  if (!fornecedor || (productId && (!produto || produto.fornecedor_id !== fornecedor.id))) return showNotice("Fornecedor ou produto não encontrado.", true);
  const editing = Boolean(produto);
  setPageTitle(editing ? "Editar produto" : "Cadastrar produto");
  app.innerHTML = `<a class="back-link" href="#" data-action="products" data-id="${fornecedor.id}">← Voltar para produtos</a>
    <section class="form-card"><p class="eyebrow">${editing ? "Atualização" : "Novo cadastro"}</p>
    <h1>${editing ? "Editar produto" : "Cadastrar produto"}</h1><p class="subtitle form-intro">Fornecedor: <strong>${escapeHtml(fornecedor.nome)}</strong></p>
    <form id="product-form" novalidate data-id="${produto?.id ?? ""}" data-supplier-id="${fornecedor.id}"><div class="form-grid">
      <div class="field field-full"><label for="product-name">Nome do produto *</label><input id="product-name" name="nome" maxlength="100" required value="${escapeHtml(produto?.nome)}"></div>
      <div class="field field-full"><label for="product-description">Descrição</label><textarea id="product-description" name="descricao" rows="3">${escapeHtml(produto?.descricao)}</textarea></div>
      <div class="field"><label for="product-stock">Quantidade em estoque *</label><input id="product-stock" name="quantidade_estoque" type="number" min="0" max="2147483647" step="1" required value="${produto?.quantidade_estoque ?? ""}"></div>
    </div><p class="form-error" id="form-error" role="alert" hidden></p><div class="form-actions">
      <button class="button button-secondary" type="button" data-action="products" data-id="${fornecedor.id}">Cancelar</button>
      <button class="button button-primary" type="submit">${editing ? "Salvar alterações" : "Salvar produto"}</button>
    </div></form></section>`;
  document.querySelector("#product-name").focus();
}
function showFormError(message, fields) {
  const error = document.querySelector("#form-error");
  error.textContent = message; error.hidden = false;
  fields.forEach(field => field.setAttribute("aria-invalid", "true"));
  fields[0]?.focus();
}
function clearFieldErrors(form) {
  form.querySelectorAll("[aria-invalid='true']").forEach(field => field.removeAttribute("aria-invalid"));
  const error = form.querySelector("#form-error"); error.hidden = true; error.textContent = "";
}
async function refreshData() { data = await services.data.load(); }
async function handleSupplierSubmit(form) {
  clearFieldErrors(form);
  const nome = form.elements.nome.value.trim();
  const cnpj = form.elements.cnpj.value.replace(/\D/g, "");
  const telefone = form.elements.telefone.value.trim();
  const email = form.elements.email.value.trim();
  if (!nome) return showFormError("Preencha o nome do fornecedor.", [form.elements.nome]);
  if (cnpj.length !== 14) return showFormError("O CNPJ deve conter 14 dígitos.", [form.elements.cnpj]);
  if (telefone && (!/^\+?[0-9()\s.-]+$/.test(telefone) || !/^\d{10,15}$/.test(telefone.replace(/\D/g, ""))))
    return showFormError("Informe um telefone válido, com 10 a 15 dígitos.", [form.elements.telefone]);
  if (email && !form.elements.email.checkValidity()) return showFormError("Informe um e-mail válido.", [form.elements.email]);
  const id = form.dataset.id;
  if (data.fornecedores.some(item => item.cnpj === cnpj && item.id !== Number(id)))
    return showFormError("Já existe fornecedor com esse CNPJ.", [form.elements.cnpj]);
  try {
    const valores = { nome, cnpj, telefone, email };
    if (id) await services.data.updateSupplier(id, valores);
    else await services.data.createSupplier(valores);
    await refreshData(); renderSupplierList();
    showNotice(id ? "Fornecedor atualizado com sucesso." : "Fornecedor cadastrado com sucesso.");
  } catch (error) { showNotice(error.message, true); }
}
async function handleProductSubmit(form) {
  clearFieldErrors(form);
  const nome = form.elements.nome.value.trim();
  const descricao = form.elements.descricao.value.trim();
  const quantidade_estoque = form.elements.quantidade_estoque.valueAsNumber;
  const fornecedor_id = Number(form.dataset.supplierId);
  const id = form.dataset.id;
  if (!nome) return showFormError("Preencha o nome do produto.", [form.elements.nome]);
  if (!Number.isSafeInteger(quantidade_estoque) || quantidade_estoque < 0 || quantidade_estoque > 2147483647)
    return showFormError("O estoque deve ser um inteiro entre 0 e 2147483647.", [form.elements.quantidade_estoque]);
  try {
    const valores = { nome, descricao, quantidade_estoque, fornecedor_id };
    if (id) await services.data.updateProduct(id, valores);
    else await services.data.createProduct(valores);
    await refreshData(); renderProducts(fornecedor_id);
    showNotice(id ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
  } catch (error) { showNotice(error.message, true); }
}
function askDelete(title, message, callback) {
  pendingDelete = callback;
  dialogTitle.textContent = title; dialogMessage.textContent = message;
  confirmDialog.showModal();
}
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  event.preventDefault();
  const { action, id, supplierId } = button.dataset;
  clearNotice();
  if (action === "home") renderHome();
  if (action === "suppliers") renderSupplierList();
  if (action === "new-supplier") renderSupplierForm();
  if (action === "edit-supplier") renderSupplierForm(id);
  if (action === "products") renderProducts(id);
  if (action === "new-product") renderProductForm(supplierId);
  if (action === "edit-product") {
    const produto = data.produtos.find(item => item.id === Number(id));
    if (produto) renderProductForm(produto.fornecedor_id, id);
  }
  if (action === "reload") {
    try { await refreshData(); renderHome(); showNotice("Dados atualizados."); }
    catch (error) { showNotice(error.message, true); }
  }
  if (action === "delete-supplier") {
    const fornecedor = data.fornecedores.find(item => item.id === Number(id));
    if (!fornecedor) return;
    if (produtosDoFornecedor(id).length) return showNotice("Remova os produtos vinculados antes de excluir este fornecedor.", true);
    askDelete("Excluir fornecedor?", `Deseja excluir ${fornecedor.nome}?`, async () => {
      await services.data.deleteSupplier(id); await refreshData(); renderSupplierList(); showNotice("Fornecedor excluído.");
    });
  }
  if (action === "delete-product") {
    const produto = data.produtos.find(item => item.id === Number(id));
    if (!produto) return;
    askDelete("Excluir produto?", `Deseja excluir ${produto.nome}?`, async () => {
      await services.data.deleteProduct(id); await refreshData(); renderProducts(produto.fornecedor_id); showNotice("Produto excluído.");
    });
  }
});
document.addEventListener("submit", async event => {
  if (event.target.id === "supplier-form") { event.preventDefault(); await handleSupplierSubmit(event.target); }
  if (event.target.id === "product-form") { event.preventDefault(); await handleProductSubmit(event.target); }
});
dialogConfirm.addEventListener("click", async event => {
  if (event.target.value !== "confirm" || !pendingDelete) return;
  const callback = pendingDelete; pendingDelete = null;
  try { await callback(); } catch (error) { showNotice(error.message, true); }
});
confirmDialog.addEventListener("close", () => { pendingDelete = null; });
async function initializeApp() {
  navHome.hidden = false;
  navSuppliers.hidden = false;
  navReport.hidden = true;
  logoutButton.hidden = true;
  app.innerHTML = `<section class="form-card"><h1>Carregando dados...</h1></section>`;
  try { await refreshData(); renderHome(); }
  catch (error) {
    app.innerHTML = `<section class="form-card"><h1>Não foi possível carregar os dados</h1><p class="subtitle">${escapeHtml(error.message)}</p><button class="button button-primary" data-action="reload">Tentar novamente</button></section>`;
    showNotice("Verifique o acesso à API e a configuração de CORS.", true);
  }
}
initializeApp();
