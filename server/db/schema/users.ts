import { pgTable, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core'

/** Papel do usuário na cadeia produtiva (nós do grafo). */
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
  // Nulo para participantes cadastrados pelo operador (sem login próprio).
  password: text('password'),
  tipoUsuario: tipoUsuario('tipo_usuario'),
  cpfCnpj: text('cpf_cnpj'),
  // Coordenadas: posição do nó no grafo, base para o cálculo de distância.
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  enderecoFormatado: text('endereco_formatado'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
