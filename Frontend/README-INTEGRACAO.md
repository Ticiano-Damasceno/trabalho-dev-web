# Integração do frontend — Mercadinho São José

Arquivos finais para substituir na branch `Dupla1-frontend`, sem alterar o backend:

- Copie `app.js`, `services.js`, `config.js` e `index.html` para `Frontend/`.
- `styles.css` é uma cópia de referência do ZIP recebido. Para preservar a versão mais recente da branch GitHub, NÃO é necessário sobrescrevê-lo.
- Copie `.github/workflows/deploy-frontend.yml` para o mesmo caminho na raiz do repositório.
- O workflow somente publica alterações da branch `main`, após o merge do pull request. Ele também tem execução manual por `workflow_dispatch`.
- Configure `CORS_ORIGINS=https://ticiano-damasceno.github.io` no projeto Vercel e faça redeploy.
- Verifique localmente por servidor HTTP em `Frontend/`, por exemplo `python3 -m http.server 5500 --bind 0.0.0.0`.

A API não possui login ou vendas; não há controle de acesso. Evite dados sensíveis e não disponibilize escrita pública sem controles adicionais.
