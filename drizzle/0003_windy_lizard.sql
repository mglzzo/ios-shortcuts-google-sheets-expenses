CREATE TABLE "conexoes_bancarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"pluggy_item_id" text NOT NULL,
	"instituicao" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conexoes_bancarias_pluggy_item_id_unique" UNIQUE("pluggy_item_id")
);
--> statement-breakpoint
ALTER TABLE "contas" DROP CONSTRAINT "contas_usuario_id_usuarios_id_fk";
--> statement-breakpoint
ALTER TABLE "contas" ADD COLUMN "conexao_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "conexoes_bancarias" ADD CONSTRAINT "conexoes_bancarias_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas" ADD CONSTRAINT "contas_conexao_id_conexoes_bancarias_id_fk" FOREIGN KEY ("conexao_id") REFERENCES "public"."conexoes_bancarias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "usuario_id";--> statement-breakpoint
ALTER TABLE "contas" DROP COLUMN "instituicao";