const TAMANHO_DO_CPF = 11

/** Tira pontuação, espaços e o que mais vier colado; guarda no máximo 11 dígitos. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, TAMANHO_DO_CPF)
}

/** 52998224725 → 529.982.247-25; formata também o CPF incompleto, enquanto a pessoa digita. */
export function formatarCpf(digitos: string): string {
  const [, a, b, c, d] = digitos.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/) ?? []
  let formatado = a ?? ''
  if (b) formatado += `.${b}`
  if (c) formatado += `.${c}`
  if (d) formatado += `-${d}`
  return formatado
}

/** O mesmo cálculo da @CPF do servidor: dois dígitos verificadores, e 11 dígitos iguais não valem. */
export function cpfValido(digitos: string): boolean {
  if (!/^\d{11}$/.test(digitos) || /^(\d)\1{10}$/.test(digitos)) return false

  const numeros = digitos.split('').map(Number)
  const digitoVerificador = (quantidade: number) => {
    let soma = 0
    for (let i = 0; i < quantidade; i++) soma += numeros[i] * (quantidade + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digitoVerificador(9) === numeros[9] && digitoVerificador(10) === numeros[10]
}

/**
 * Os dígitos depois de uma edição no campo mascarado. Se o Backspace apagou só um separador
 * ("." ou "-"), os dígitos não mudariam e a máscara voltaria igual, travando o campo; nesse caso
 * apagamos o dígito que vinha antes do separador, que é o que a pessoa quis.
 */
export function digitosAposEdicao(anteriores: string, textoNovo: string, cursor: number | null): string {
  const novos = apenasDigitos(textoNovo)
  const apagouSoSeparador = novos === anteriores && textoNovo.length < formatarCpf(anteriores).length
  if (!apagouSoSeparador || cursor === null) return novos

  const digitosAntesDoCursor = apenasDigitos(textoNovo.slice(0, cursor)).length
  if (digitosAntesDoCursor === 0) return novos
  return novos.slice(0, digitosAntesDoCursor - 1) + novos.slice(digitosAntesDoCursor)
}
