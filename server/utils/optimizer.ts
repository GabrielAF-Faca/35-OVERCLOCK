import { and, eq, gt, arrayContains } from 'drizzle-orm'
import { db } from '../db'
import { users, culturas, ofertas, demandas, veiculos } from '../db/schema'
import { haversineKm } from './geo'

export interface RotaOtimizada {
  ofertaId: string
  veiculoId: string
  produtorId: string
  produtorNome: string
  transportadorId: string
  transportadorNome: string
  quantidadeNegociada: number
  precoUnitario: number
  precoPorKm: number
  distanciaKm: number
  valorProduto: number
  valorFrete: number
  /** Custo total minimizado: C = (Q × Pp) + (D × Pk). */
  custoTotal: number
}

/**
 * Engine de otimização: para uma demanda, varre as ofertas da mesma cultura,
 * cruza com os veículos que suportam o tipo de carga e calcula a triangulação
 * Produtor + Transportador de menor custo total na porta do comprador.
 *
 * Função de custo minimizada: C = (Q × Pp) + (D × Pk)
 *   Q  = quantidade negociada
 *   Pp = preço unitário do produtor
 *   D  = distância (km) entre produtor e comprador
 *   Pk = preço por km do transportador
 */
export async function otimizarDemanda(
  demandaId: string,
  limit = 10,
): Promise<{ rotas: RotaOtimizada[] } | { erro: string }> {
  // Demanda + comprador (nó de destino).
  const [demanda] = await db
    .select({
      id: demandas.id,
      culturaId: demandas.culturaId,
      quantidadeNecessaria: demandas.quantidadeNecessaria,
      precoMaximoAceitavel: demandas.precoMaximoAceitavel,
      distanciaMaximaKm: demandas.distanciaMaximaKm,
      compradorLat: users.latitude,
      compradorLng: users.longitude,
    })
    .from(demandas)
    .innerJoin(users, eq(demandas.usuarioId, users.id))
    .where(eq(demandas.id, demandaId))
    .limit(1)

  if (!demanda) return { erro: 'Demanda não encontrada' }
  if (demanda.compradorLat == null || demanda.compradorLng == null) {
    return { erro: 'O comprador não possui coordenadas cadastradas' }
  }

  const [cultura] = await db
    .select()
    .from(culturas)
    .where(eq(culturas.id, demanda.culturaId))
    .limit(1)
  if (!cultura) return { erro: 'Cultura não encontrada' }

  const comprador = {
    lat: Number(demanda.compradorLat),
    lng: Number(demanda.compradorLng),
  }
  const quantidadeNecessaria = Number(demanda.quantidadeNecessaria)
  const precoMaximo = Number(demanda.precoMaximoAceitavel)

  // Ofertas da mesma cultura + produtor (nós de origem).
  const ofertasDisponiveis = await db
    .select({
      id: ofertas.id,
      quantidade: ofertas.quantidadeDisponivel,
      preco: ofertas.precoUnitarioDesejado,
      produtorId: users.id,
      produtorNome: users.name,
      produtorLat: users.latitude,
      produtorLng: users.longitude,
    })
    .from(ofertas)
    .innerJoin(users, eq(ofertas.usuarioId, users.id))
    .where(
      and(
        eq(ofertas.culturaId, demanda.culturaId),
        gt(ofertas.quantidadeDisponivel, '0'),
      ),
    )

  // Veículos compatíveis com o tipo de carga da cultura.
  const veiculosCompativeis = await db
    .select({
      id: veiculos.id,
      capacidade: veiculos.capacidadeMaxima,
      precoPorKm: veiculos.precoPorKm,
      transportadorId: users.id,
      transportadorNome: users.name,
    })
    .from(veiculos)
    .innerJoin(users, eq(veiculos.usuarioId, users.id))
    .where(arrayContains(veiculos.tiposCargaSuportados, [cultura.tipoCarga]))

  const rotas: RotaOtimizada[] = []

  for (const oferta of ofertasDisponiveis) {
    if (oferta.produtorLat == null || oferta.produtorLng == null) continue

    const precoUnitario = Number(oferta.preco)
    if (precoUnitario > precoMaximo) continue // acima do teto da demanda

    const distanciaKm = haversineKm(comprador, {
      lat: Number(oferta.produtorLat),
      lng: Number(oferta.produtorLng),
    })
    if (distanciaKm > demanda.distanciaMaximaKm) continue // fora do raio

    const quantidadeDisponivel = Number(oferta.quantidade)

    for (const veiculo of veiculosCompativeis) {
      const capacidade = Number(veiculo.capacidade)
      const quantidadeNegociada = Math.min(
        quantidadeDisponivel,
        quantidadeNecessaria,
        capacidade,
      )
      if (quantidadeNegociada <= 0) continue

      const precoPorKm = Number(veiculo.precoPorKm)
      const valorProduto = quantidadeNegociada * precoUnitario
      const valorFrete = distanciaKm * precoPorKm
      const custoTotal = valorProduto + valorFrete

      rotas.push({
        ofertaId: oferta.id,
        veiculoId: veiculo.id,
        produtorId: oferta.produtorId,
        produtorNome: oferta.produtorNome,
        transportadorId: veiculo.transportadorId,
        transportadorNome: veiculo.transportadorNome,
        quantidadeNegociada: round(quantidadeNegociada, 3),
        precoUnitario,
        precoPorKm,
        distanciaKm: round(distanciaKm, 2),
        valorProduto: round(valorProduto, 2),
        valorFrete: round(valorFrete, 2),
        custoTotal: round(custoTotal, 2),
      })
    }
  }

  rotas.sort((a, b) => a.custoTotal - b.custoTotal)
  return { rotas: rotas.slice(0, limit) }
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
