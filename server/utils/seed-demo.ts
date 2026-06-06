import { db } from '../db'
import { users } from '../db/schema'
import type { TipoUsuario } from '#shared/domain'

interface SeedUser {
  id: string
  name: string
  email: string
  tipoUsuario: TipoUsuario
  cidade?: string
  estado?: string
  cultura?: string
  mes?: string
  quantidade?: string
  demanda?: string
  tonelagem?: string
  cotacao?: string
  bonus?: string
  descontoTransporte?: string
  precoPorTonelada?: string
}

const SEED_USERS: SeedUser[] = [
  {
    id: 'usr_admin',
    name: 'Administrador GLM',
    email: 'admin@glm.app',
    tipoUsuario: 'ADMIN',
  },
  {
    id: 'usr_prod_naometoque',
    name: 'Fazenda Planalto',
    email: 'planalto@glm.app',
    tipoUsuario: 'PRODUTOR',
    cultura: 'Soja',
    quantidade: '1200',
    mes: 'Março',
    cidade: 'Não-Me-Toque',
    estado: 'RS',
  },
  {
    id: 'usr_prod_cruzalta',
    name: 'Agropecuária Cruz Alta',
    email: 'cruzalta@glm.app',
    tipoUsuario: 'PRODUTOR',
    cultura: 'Milho',
    quantidade: '800',
    mes: 'Junho',
    cidade: 'Cruz Alta',
    estado: 'RS',
  },
  {
    id: 'usr_coop_cotrijal',
    name: 'Cotrijal',
    email: 'cotrijal@glm.app',
    tipoUsuario: 'COOPERATIVA',
    cultura: 'Soja',
    quantidade: '50000',
    cotacao: '120',
    mes: 'Março',
    cidade: 'Não-Me-Toque',
    estado: 'RS',
    descontoTransporte: '0',
  },
  {
    id: 'usr_coop_ccgl',
    name: 'CCGL',
    email: 'ccgl@glm.app',
    tipoUsuario: 'COOPERATIVA',
    cultura: 'Soja',
    quantidade: '100000',
    cotacao: '122',
    mes: 'Março',
    cidade: 'Cruz Alta',
    estado: 'RS',
    descontoTransporte: '0',
  },
  {
    id: 'usr_coop_palmeira',
    name: 'Coper Palmeira',
    email: 'palmeira@glm.app',
    tipoUsuario: 'COOPERATIVA',
    cultura: 'Milho',
    quantidade: '35000',
    cotacao: '68',
    mes: 'Junho',
    cidade: 'Palmeira Missões',
    estado: 'RS',
    descontoTransporte: '0',
  },
  {
    id: 'usr_trans_gaucha',
    name: 'Trans. Gaúcha',
    email: 'transgaucha@glm.app',
    tipoUsuario: 'TRANSPORTADOR',
    tonelagem: '50',
    precoPorTonelada: '4.5',
    mes: 'Março',
    cidade: 'Porto Alegre',
    estado: 'RS',
  },
  {
    id: 'usr_trans_planalto',
    name: 'Trans Planalto',
    email: 'transplanalto@glm.app',
    tipoUsuario: 'TRANSPORTADOR',
    tonelagem: '35',
    precoPorTonelada: '4.1',
    mes: 'Março',
    cidade: 'Passo Fundo',
    estado: 'RS',
  },
  {
    id: 'usr_trans_cerealista',
    name: 'Trans Cerealista',
    email: 'transcerealista@glm.app',
    tipoUsuario: 'TRANSPORTADOR',
    tonelagem: '55',
    precoPorTonelada: '4.8',
    mes: 'Março',
    cidade: 'Cruz Alta',
    estado: 'RS',
  },
  {
    id: 'usr_agro_bunge',
    name: 'Bunge Brasil RS',
    email: 'bunge@glm.app',
    tipoUsuario: 'AGROINDUSTRIA',
    cultura: 'Soja',
    demanda: '500000',
    cotacao: '124',
    bonus: '0',
    cidade: 'Passo Fundo',
    estado: 'RS',
  },
  {
    id: 'usr_agro_adm',
    name: 'ADM RS',
    email: 'adm@glm.app',
    tipoUsuario: 'AGROINDUSTRIA',
    cultura: 'Milho',
    demanda: '150000',
    cotacao: '72',
    bonus: '0',
    cidade: 'Cruz Alta',
    estado: 'RS',
  },
  {
    id: 'usr_expo_amaggi',
    name: 'Amaggi Export',
    email: 'amaggi@glm.app',
    tipoUsuario: 'EXPORTADORA',
    cultura: 'Soja',
    demanda: '1000000',
    cotacao: '128',
    cidade: 'Porto Alegre',
    estado: 'RS',
  },
  {
    id: 'usr_expo_glencore',
    name: 'Glencore RS',
    email: 'glencore@glm.app',
    tipoUsuario: 'EXPORTADORA',
    cultura: 'Milho',
    demanda: '500000',
    cotacao: '75',
    cidade: 'Porto Alegre',
    estado: 'RS',
  },
]

export async function seedParticipants(): Promise<void> {
  const existing = await db.select().from(users).limit(1)
  if (existing.length > 0) return

  const senha = await hashPassword('glm12345')
  await db
    .insert(users)
    .values(
      SEED_USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: senha,
        tipoUsuario: u.tipoUsuario,
        cidade: u.cidade ?? null,
        estado: u.estado ?? null,
        cultura: u.cultura ?? null,
        mes: u.mes ?? null,
        quantidade: u.quantidade ?? null,
        demanda: u.demanda ?? null,
        tonelagem: u.tonelagem ?? null,
        cotacao: u.cotacao ?? null,
        bonus: u.bonus ?? null,
        descontoTransporte: u.descontoTransporte ?? null,
        precoPorTonelada: u.precoPorTonelada ?? null,
      })),
    )
    .onConflictDoNothing()
}
