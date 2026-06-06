import { z } from 'zod'

export const tipoParticipanteEnum = z.enum([
  'PRODUTOR',
  'COOPERATIVA',
  'TRANSPORTADOR',
  'AGROINDUSTRIA',
  'EXPORTADORA',
])

const roleEnum = z.enum([
  'produtor',
  'cooperativa',
  'transportador',
  'agroindustria',
  'exportadora',
])

const nodeEntitySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough()

export const flowNodeSchema = z.object({
  id: z.string(),
  type: roleEnum,
  x: z.number(),
  y: z.number(),
  dbId: z.string().nullable(),
  dbData: nodeEntitySchema.nullable(),
})

export const flowEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  frete: z
    .object({
      qtd: z.number(),
      custo: z.number(),
      label: z.string(),
    })
    .nullable(),
})

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0).optional(),
)

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.string().max(max).optional(),
  )

/** Atributos econômicos/de cadeia, todos opcionais (variam por papel). */
export const participantAttrsSchema = z.object({
  cpfCnpj: optionalText(20),
  cidade: optionalText(120),
  estado: optionalText(40),
  cultura: optionalText(40),
  mes: optionalText(20),
  quantidade: optionalNumber,
  demanda: optionalNumber,
  tonelagem: optionalNumber,
  cotacao: optionalNumber,
  bonus: optionalNumber,
  descontoTransporte: optionalNumber,
  precoPorTonelada: optionalNumber,
})
