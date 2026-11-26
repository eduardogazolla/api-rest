import { describe, expect, it } from 'vitest'
import { apenasDigitos, cpfValido, formatarCpf } from './cpf'

describe('cpf', () => {
  it('deveFormatarCpfCompleto', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })

  it('deveFormatarCpfParcialEnquantoDigita', () => {
    expect(formatarCpf('')).toBe('')
    expect(formatarCpf('529')).toBe('529')
    expect(formatarCpf('5299')).toBe('529.9')
    expect(formatarCpf('529982247')).toBe('529.982.247')
    expect(formatarCpf('5299822472')).toBe('529.982.247-2')
  })

  it('deveGuardarSoDigitosAteOnze', () => {
    expect(apenasDigitos('529.982.247-25')).toBe('52998224725')
    expect(apenasDigitos(' 529 982 247 25 99')).toBe('52998224725')
  })

  it('deveAceitarCpfComDigitosValidos', () => {
    expect(cpfValido('52998224725')).toBe(true)
    expect(cpfValido('11144477735')).toBe(true)
  })

  it('deveRecusarDigitoVerificadorErrado', () => {
    expect(cpfValido('52998224724')).toBe(false)
    expect(cpfValido('5299822472')).toBe(false)
  })

  it('deveRecusarOnzeDigitosIguais', () => {
    // 111.111.111-11 passa no cálculo, mas não é um CPF real; o @CPF do servidor também recusa
    expect(cpfValido('11111111111')).toBe(false)
  })
})
