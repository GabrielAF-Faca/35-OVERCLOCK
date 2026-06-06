CREATE TYPE "public"."status_operacao" AS ENUM('PENDENTE', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."tipo_carga" AS ENUM('GRANEL', 'REFRIGERADO', 'VIVO', 'SACA');--> statement-breakpoint
CREATE TYPE "public"."tipo_usuario" AS ENUM('PRODUTOR', 'COOPERATIVA', 'AGROINDUSTRIA', 'TRANSPORTADOR');--> statement-breakpoint
CREATE TABLE "contratos_operacao" (
	"id" text PRIMARY KEY NOT NULL,
	"oferta_id" text NOT NULL,
	"demanda_id" text NOT NULL,
	"veiculo_id" text NOT NULL,
	"quantidade_negociada" numeric(14, 3) NOT NULL,
	"valor_total_produto" numeric(16, 2) NOT NULL,
	"valor_total_frete" numeric(16, 2) NOT NULL,
	"distancia_rota_km" numeric(10, 2) NOT NULL,
	"status_operacao" "status_operacao" DEFAULT 'PENDENTE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "culturas" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"tipo_carga" "tipo_carga" NOT NULL,
	"unidade_medida" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandas" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"cultura_id" text NOT NULL,
	"quantidade_necessaria" numeric(14, 3) NOT NULL,
	"preco_maximo_aceitavel" numeric(14, 2) NOT NULL,
	"distancia_maxima_km" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ofertas" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"cultura_id" text NOT NULL,
	"quantidade_disponivel" numeric(14, 3) NOT NULL,
	"preco_unitario_desejado" numeric(14, 2) NOT NULL,
	"data_disponibilidade" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "veiculos_transportador" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"capacidade_maxima" numeric(14, 3) NOT NULL,
	"preco_por_km" numeric(14, 2) NOT NULL,
	"tipos_carga_suportados" "tipo_carga"[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tipo_usuario" "tipo_usuario";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cpf_cnpj" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "endereco_formatado" text;--> statement-breakpoint
ALTER TABLE "contratos_operacao" ADD CONSTRAINT "contratos_operacao_oferta_id_ofertas_id_fk" FOREIGN KEY ("oferta_id") REFERENCES "public"."ofertas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos_operacao" ADD CONSTRAINT "contratos_operacao_demanda_id_demandas_id_fk" FOREIGN KEY ("demanda_id") REFERENCES "public"."demandas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos_operacao" ADD CONSTRAINT "contratos_operacao_veiculo_id_veiculos_transportador_id_fk" FOREIGN KEY ("veiculo_id") REFERENCES "public"."veiculos_transportador"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandas" ADD CONSTRAINT "demandas_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandas" ADD CONSTRAINT "demandas_cultura_id_culturas_id_fk" FOREIGN KEY ("cultura_id") REFERENCES "public"."culturas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_cultura_id_culturas_id_fk" FOREIGN KEY ("cultura_id") REFERENCES "public"."culturas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos_transportador" ADD CONSTRAINT "veiculos_transportador_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;