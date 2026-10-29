function tratamentoErros(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      mensagem: 'JSON inválido. Verifique o corpo da requisição.'
    });
  }

  if (error.code === '23503') {
    return res.status(409).json({
      mensagem: 'A operação não pôde ser concluída devido ao vínculo entre fornecedor e produto.'
    });
  }

  const status = (
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
  ) ? error.status : 500;

  const mensagens = {
    400: 'Requisição inválida.',
    413: 'O corpo da requisição excede o tamanho permitido.',
    415: 'Codificação do conteúdo não suportada.',
    500: 'Erro interno do servidor. Tente novamente.'
  };

  if (status === 500) {
    console.error('Erro não esperado:', error);
  }

  return res.status(status).json({
    mensagem: mensagens[status] || 'Requisição inválida.'
  });
}

module.exports = tratamentoErros;