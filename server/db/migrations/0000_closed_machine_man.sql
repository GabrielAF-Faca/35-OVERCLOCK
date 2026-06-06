CREATE TYPE "public"."tipo_usuario" AS ENUM('PRODUTOR', 'COOPERATIVA', 'TRANSPORTADOR', 'AGROINDUSTRIA', 'EXPORTADORA', 'ADMIN');--> statement-breakpoint
CREATE TABLE "fluxos" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"user_id" text NOT NULL,
	"user_role" text NOT NULL,
	"nodes" jsonb NOT NULL,
	"edges" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"tipo_usuario" "tipo_usuario",
	"cpf_cnpj" text,
	"cidade" text,
	"estado" text,
	"cultura" text,
	"mes" text,
	"quantidade" numeric(14, 3),
	"demanda" numeric(14, 3),
	"tonelagem" numeric(14, 3),
	"cotacao" numeric(14, 2),
	"bonus" numeric(14, 2),
	"desconto_transporte" numeric(14, 2),
	"preco_por_tonelada" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "fluxos" ADD CONSTRAINT "fluxos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;