CREATE TABLE "contas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"pluggy_account_id" text NOT NULL,
	"nome" text,
	"instituicao" text,
	"tipo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contas_pluggy_account_id_unique" UNIQUE("pluggy_account_id")
);
--> statement-breakpoint
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_usuario_id_usuarios_id_fk";
--> statement-breakpoint
DROP INDEX "transacao_usuario_pluggy_unique";--> statement-breakpoint
ALTER TABLE "transacoes" ADD COLUMN "conta_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contas" ADD CONSTRAINT "contas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_conta_id_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "transacao_conta_pluggy_unique" ON "transacoes" USING btree ("conta_id","id_pluggy");--> statement-breakpoint
ALTER TABLE "transacoes" DROP COLUMN "usuario_id";--> statement-breakpoint
ALTER TABLE "transacoes" DROP COLUMN "pluggy_account_id";