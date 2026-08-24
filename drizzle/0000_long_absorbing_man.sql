CREATE TABLE "cartoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"eh_credito" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	CONSTRAINT "categorias_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "estabelecimentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"apelido" text NOT NULL,
	"padrao_busca" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regras_categorizacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"estabelecimento_normalizado" text NOT NULL,
	"categoria_id" integer,
	"origem" text DEFAULT 'manual' NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regras_categorizacao_estabelecimento_normalizado_unique" UNIQUE("estabelecimento_normalizado")
);
--> statement-breakpoint
CREATE TABLE "transacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"estabelecimento_bruto" text NOT NULL,
	"estabelecimento_id" integer,
	"banco_cartao_id" integer NOT NULL,
	"metodo_pagamento" text NOT NULL,
	"categoria_id" integer,
	"subcategoria" text,
	"valor" numeric(10, 2) NOT NULL,
	"parcela_atual" smallint,
	"parcela_total" smallint,
	"observacao" text,
	"origem" text NOT NULL,
	"id_pluggy" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transacoes_id_pluggy_unique" UNIQUE("id_pluggy")
);
--> statement-breakpoint
ALTER TABLE "regras_categorizacao" ADD CONSTRAINT "regras_categorizacao_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_estabelecimento_id_estabelecimentos_id_fk" FOREIGN KEY ("estabelecimento_id") REFERENCES "public"."estabelecimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_banco_cartao_id_cartoes_id_fk" FOREIGN KEY ("banco_cartao_id") REFERENCES "public"."cartoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;