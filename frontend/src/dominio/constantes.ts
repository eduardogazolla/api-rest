import type { Especialidade } from '../api/tipos'

export const ESPECIALIDADES: { valor: Especialidade; rotulo: string }[] = [
  { valor: 'ORTOPEDIA', rotulo: 'Ortopedia' },
  { valor: 'CARDIOLOGIA', rotulo: 'Cardiologia' },
  { valor: 'GINECOLOGIA', rotulo: 'Ginecologia' },
  { valor: 'DERMATOLOGIA', rotulo: 'Dermatologia' },
]

export function rotuloDaEspecialidade(valor: Especialidade): string {
  return ESPECIALIDADES.find((e) => e.valor === valor)?.rotulo ?? valor
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]
