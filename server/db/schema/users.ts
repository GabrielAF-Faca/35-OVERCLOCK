import { pgTable, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core'

export const tipoUsuario = pgEnum('tipo_usuario', [
  'PRODUTOR',
  'COOPERATIVA',
  'AGROINDUSTRIA',
  'TRANSPORTADOR',
])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  tipoUsuario: tipoUsuario('tipo_usuario'),
  cpfCnpj: text('cpf_cnpj'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  enderecoFormatado: text('endereco_formatado'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
