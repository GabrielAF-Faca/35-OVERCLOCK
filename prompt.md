### Diagrama de Banco de Dados Otimizado (Relacional)

Aqui está a estrutura de tabelas idealizada para suportar consultas complexas e algoritmos de grafos:

#### A. Entidades Base (Nós do Grafo)

**Tabela:** `usuarios`

Centraliza a autenticação e os dados de localização essenciais para o cálculo de rotas.

- `id` (PK)

- `tipo_usuario` (ENUM: PRODUTOR, COOPERATIVA, AGROINDUSTRIA, TRANSPORTADOR)

- `email`, `senha`, `cpf_cnpj`, `nome_razao_social`

- `latitude` (Decimal) - _Crucial para o cálculo de distância no grafo_

- `longitude` (Decimal) - _Crucial para o cálculo de distância no grafo_

- `endereco_formatado` (String)

**Tabela:** `culturas` (Catálogo)

- `id` (PK)

- `nome` (ex: Soja, Milho, Gado Nelore)

- `tipo_carga` (ex: GRANEL, REFRIGERADO, VIVO)

- `unidade_medida` (ex: TON, KG, CABECA)

#### B. Intenções de Negócio (Pesos e Arestas Potenciais)

**Tabela:** `ofertas` **(O que os Produtores têm)**

- `id` (PK)

- `usuario_id` (FK -&gt; usuarios) - _Deve ser do tipo Produtor_

- `cultura_id` (FK -&gt; culturas)

- `quantidade_disponivel` (Decimal)

- `preco_unitario_desejado` (Decimal)

- `data_disponibilidade` (Data)

**Tabela:** `demandas` **(O que Cooperativas/Agroindústrias querem)**

- `id` (PK)

- `usuario_id` (FK -&gt; usuarios) - _Deve ser Coop/Agro_

- `cultura_id` (FK -&gt; culturas)

- `quantidade_necessaria` (Decimal)

- `preco_maximo_aceitavel` (Decimal)

- `distancia_maxima_km` (Inteiro) - _Filtro de busca_

#### C. Logística

**Tabela:** `veiculos_transportador`

Detalha a capacidade de quem vai mover a carga.

- `id` (PK)

- `usuario_id` (FK -&gt; usuarios) - _Deve ser Transportador_

- `capacidade_maxima` (Decimal) - _Baseado na unidade_medida, ex: 30 toneladas_

- `preco_por_km` (Decimal)

- `tipos_carga_suportados` (Array/JSON ou Tabela N:M) - _Ex: \[GRANEL, SACA\]_

#### D. O Fechamento (A Rota Otimizada)

**Tabela:** `contratos_operacao` (O "Match")

Esta tabela consolida a triangulação calculada pelo seu algoritmo de otimização.

- `id` (PK)

- `oferta_id` (FK -&gt; ofertas)

- `demanda_id` (FK -&gt; demandas)

- `veiculo_id` (FK -&gt; veiculos_transportador)

- `quantidade_negociada` (Decimal)

- `valor_total_produto` (Decimal)

- `valor_total_frete` (Decimal)

- `distancia_rota_km` (Decimal)

- `status_operacao` (ENUM: PENDENTE, EM_TRANSITO, ENTREGUE, CANCELADO)

### A Lógica de Grafos e Otimização na Prática

Com essa modelagem, a sua engine de otimização (que pode rodar em um serviço separado) funcionará da seguinte maneira:

1. **Nós do Grafo:** Os `usuarios` (Produtores e Compradores) são os nós. As coordenadas (lat/long) definem sua posição no espaço.

2. **Arestas do Grafo:** As rotas rodoviárias entre o Produtor e o Comprador.

3. **Peso da Aresta (Custo Total):** A função de custo (C) que o algoritmo tentará minimizar para atender uma `Demanda` é:

   $$C = (Q \\times P_p) + (D \\times P_k)$$

   Onde:
   - $Q$ = Quantidade da cultura

   - $P_p$ = Preço unitário da oferta (Produtor)

   - $D$ = Distância em Km entre Produtor e Comprador

   - $P_k$ = Preço por Km do Transportador

4. **A Otimização:** O sistema varre as `ofertas` disponíveis de uma `cultura` X, cruza com os `veiculos` que suportam aquela carga e calcula qual combinação de Produtor + Transportador entrega o menor custo $C$ na porta da Agroindústria.

Para a construção do backend e implementação dessa lógica de grafos estruturada, você pretende utilizar alguma linguagem ou framework específico, como Java com Spring Boot, ou prefere focar primeiro no design do banco usando ferramentas como PostgreSQL e PostGIS para os cálculos espaciais?
