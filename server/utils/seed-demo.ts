import { db } from '../db'
import { users, culturas, ofertas, demandas, veiculos } from '../db/schema'

/**
 * Popula um mercado de exemplo (região de Mato Grosso) caso o catálogo de
 * culturas esteja vazio. Idempotente: usa IDs fixos + onConflictDoNothing.
 */
export async function seedMarketplace(): Promise<void> {
  const existing = await db.select().from(culturas).limit(1)
  if (existing.length > 0) return

  await db
    .insert(culturas)
    .values([
      {
        id: 'cul_soja',
        nome: 'Soja',
        tipoCarga: 'GRANEL',
        unidadeMedida: 'TON',
      },
      {
        id: 'cul_milho',
        nome: 'Milho',
        tipoCarga: 'GRANEL',
        unidadeMedida: 'TON',
      },
      {
        id: 'cul_gado',
        nome: 'Gado Nelore',
        tipoCarga: 'VIVO',
        unidadeMedida: 'CABECA',
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(users)
    .values([
      // Produtores
      {
        id: 'usr_prod_sorriso',
        name: 'Fazenda Boa Esperança',
        email: 'boaesperanca@glm.app',
        tipoUsuario: 'PRODUTOR',
        cpfCnpj: '12.345.678/0001-90',
        latitude: '-12.5453',
        longitude: '-55.7211',
        enderecoFormatado: 'Sorriso - MT',
      },
      {
        id: 'usr_prod_lucas',
        name: 'Agropecuária Vale Verde',
        email: 'valeverde@glm.app',
        tipoUsuario: 'PRODUTOR',
        cpfCnpj: '23.456.789/0001-01',
        latitude: '-13.0584',
        longitude: '-55.9112',
        enderecoFormatado: 'Lucas do Rio Verde - MT',
      },
      {
        id: 'usr_prod_nova',
        name: 'Sítio Santa Luzia',
        email: 'santaluzia@glm.app',
        tipoUsuario: 'PRODUTOR',
        cpfCnpj: '34.567.890/0001-12',
        latitude: '-13.8211',
        longitude: '-56.0867',
        enderecoFormatado: 'Nova Mutum - MT',
      },
      // Compradores
      {
        id: 'usr_agro_cuiaba',
        name: 'Agroindústria Cuiabá Grãos',
        email: 'cuiabagraos@glm.app',
        tipoUsuario: 'AGROINDUSTRIA',
        cpfCnpj: '45.678.901/0001-23',
        latitude: '-15.6014',
        longitude: '-56.0979',
        enderecoFormatado: 'Cuiabá - MT',
      },
      {
        id: 'usr_coop_sinop',
        name: 'Cooperativa Sinop',
        email: 'coopsinop@glm.app',
        tipoUsuario: 'COOPERATIVA',
        cpfCnpj: '56.789.012/0001-34',
        latitude: '-11.8642',
        longitude: '-55.5025',
        enderecoFormatado: 'Sinop - MT',
      },
      // Transportadores
      {
        id: 'usr_trans_norte',
        name: 'TransNorte Logística',
        email: 'transnorte@glm.app',
        tipoUsuario: 'TRANSPORTADOR',
        cpfCnpj: '67.890.123/0001-45',
        latitude: '-12.6819',
        longitude: '-55.7553',
        enderecoFormatado: 'Sorriso - MT',
      },
      {
        id: 'usr_trans_boi',
        name: 'BoiExpress Transportes',
        email: 'boiexpress@glm.app',
        tipoUsuario: 'TRANSPORTADOR',
        cpfCnpj: '78.901.234/0001-56',
        latitude: '-13.0584',
        longitude: '-55.9112',
        enderecoFormatado: 'Lucas do Rio Verde - MT',
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(ofertas)
    .values([
      {
        id: 'ofr_soja_1',
        usuarioId: 'usr_prod_sorriso',
        culturaId: 'cul_soja',
        quantidadeDisponivel: '1500.000',
        precoUnitarioDesejado: '1850.00',
        dataDisponibilidade: '2026-06-15',
      },
      {
        id: 'ofr_soja_2',
        usuarioId: 'usr_prod_lucas',
        culturaId: 'cul_soja',
        quantidadeDisponivel: '900.000',
        precoUnitarioDesejado: '1790.00',
        dataDisponibilidade: '2026-06-20',
      },
      {
        id: 'ofr_milho_1',
        usuarioId: 'usr_prod_nova',
        culturaId: 'cul_milho',
        quantidadeDisponivel: '2000.000',
        precoUnitarioDesejado: '720.00',
        dataDisponibilidade: '2026-07-01',
      },
      {
        id: 'ofr_gado_1',
        usuarioId: 'usr_prod_lucas',
        culturaId: 'cul_gado',
        quantidadeDisponivel: '120.000',
        precoUnitarioDesejado: '2900.00',
        dataDisponibilidade: '2026-06-10',
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(demandas)
    .values([
      {
        id: 'dmd_soja_cuiaba',
        usuarioId: 'usr_agro_cuiaba',
        culturaId: 'cul_soja',
        quantidadeNecessaria: '800.000',
        precoMaximoAceitavel: '1900.00',
        distanciaMaximaKm: 500,
      },
      {
        id: 'dmd_milho_sinop',
        usuarioId: 'usr_coop_sinop',
        culturaId: 'cul_milho',
        quantidadeNecessaria: '1200.000',
        precoMaximoAceitavel: '780.00',
        distanciaMaximaKm: 350,
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(veiculos)
    .values([
      {
        id: 'veh_granel_1',
        usuarioId: 'usr_trans_norte',
        capacidadeMaxima: '36.000',
        precoPorKm: '8.50',
        tiposCargaSuportados: ['GRANEL', 'SACA'],
      },
      {
        id: 'veh_granel_2',
        usuarioId: 'usr_trans_norte',
        capacidadeMaxima: '50.000',
        precoPorKm: '11.20',
        tiposCargaSuportados: ['GRANEL'],
      },
      {
        id: 'veh_boi_1',
        usuarioId: 'usr_trans_boi',
        capacidadeMaxima: '40.000',
        precoPorKm: '9.80',
        tiposCargaSuportados: ['VIVO'],
      },
    ])
    .onConflictDoNothing()
}
