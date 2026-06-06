import { pgTable, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core'

export const tipoUsuario = pgEnum('tipo_usuario', [
  'PRODUTOR',
  'COOPERATIVA',
  'TRANSPORTADOR',
  'AGROINDUSTRIA',
  'EXPORTADORA',
  'ADMIN',
])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  tipoUsuario: tipoUsuario('tipo_usuario'),
  cpfCnpj: text('cpf_cnpj'),
  cidade: text('cidade'),
  estado: text('estado'),
  cultura: text('cultura'),
  mes: text('mes'),
  quantidade: numeric('quantidade', { precision: 14, scale: 3 }),
  demanda: numeric('demanda', { precision: 14, scale: 3 }),
  tonelagem: numeric('tonelagem', { precision: 14, scale: 3 }),
  cotacao: numeric('cotacao', { precision: 14, scale: 2 }),
  bonus: numeric('bonus', { precision: 14, scale: 2 }),
  descontoTransporte: numeric('desconto_transporte', {
    precision: 14,
    scale: 2,
  }),
  precoPorTonelada: numeric('preco_por_tonelada', { precision: 14, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
