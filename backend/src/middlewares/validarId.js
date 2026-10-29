function validarId(req, res, next, valor) {
  const id = Number(valor);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    String(id) !== valor
  ) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  req.idValidado = id;

  return next();
}

module.exports = validarId;