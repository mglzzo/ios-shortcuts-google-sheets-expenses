CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "regras_categorizacao" DROP CONSTRAINT "regras_categorizacao_estabelecimento_normalizado_unique";--> statement-breakpoint
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_id_pluggy_unique";--> statement-breakpoint
ALTER TABLE "regras_categorizacao" ALTER COLUMN "categoria_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transacoes" ALTER COLUMN "banco_cartao_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "usuario_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "regras_categorizacao" ADD COLUMN "usuario_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transacoes" ADD COLUMN "usuario_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transacoes" ADD COLUMN "categoria_pluggy" text;--> statement-breakpoint
ALTER TABLE "transacoes" ADD COLUMN "categoria_pluggy_id" text;--> statement-breakpoint
ALTER TABLE "transacoes" ADD COLUMN "pluggy_account_id" text;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regras_categorizacao" ADD CONSTRAINT "regras_categorizacao_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "regra_usuario_estabelecimento_unique" ON "regras_categorizacao" USING btree ("usuario_id","estabelecimento_normalizado");--> statement-breakpoint
CREATE UNIQUE INDEX "transacao_usuario_pluggy_unique" ON "transacoes" USING btree ("usuario_id","id_pluggy");--> statement-breakpoint
ALTER TABLE "estabelecimentos" ADD CONSTRAINT "estabelecimentos_padrao_busca_unique" UNIQUE("padrao_busca");