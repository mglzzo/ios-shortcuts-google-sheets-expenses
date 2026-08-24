import {
  pgTable,
  serial,
  uuid,
  text,
  date,
  numeric,
  smallint,
  boolean,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// =============================================
// USUARIOS
// =============================================

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),

  nome: text("nome").notNull(),

  email: text("email")
    .notNull()
    .unique(),

  senhaHash: text("senha_hash")
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =============================================
// CONTAS BANCÁRIAS
// Cada conta da Pluggy pertence a um usuário
// =============================================

export const contas = pgTable("contas", {
  id: uuid("id").primaryKey().defaultRandom(),

  usuarioId: uuid("usuario_id")
    .references(() => usuarios.id, {
      onDelete: "cascade",
    })
    .notNull(),

  // ID da conta retornado pela Pluggy
  pluggyAccountId: text("pluggy_account_id")
    .notNull()
    .unique(),

  // Ex: "Conta Corrente", "Conta Nubank"
  nome: text("nome"),

  // Ex: "Nubank", "Itaú", "Inter"
  instituicao: text("instituicao"),

  // Ex: CHECKING_ACCOUNT, SAVINGS_ACCOUNT etc.
  tipo: text("tipo"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

// =============================================
// CATEGORIAS
// Categorias globais do sistema
// =============================================

export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),

  nome: text("nome")
    .notNull()
    .unique(),
});

// =============================================
// ESTABELECIMENTOS
// Cadastro global de estabelecimentos conhecidos
// =============================================

export const estabelecimentos = pgTable("estabelecimentos", {
  id: serial("id").primaryKey(),

  apelido: text("apelido")
    .notNull(),

  padraoBusca: text("padrao_busca")
    .notNull()
    .unique(),
});

// =============================================
// CARTOES / MEIOS DE PAGAMENTO
// Cada cartão pertence a um usuário
// =============================================

export const cartoes = pgTable("cartoes", {
  id: serial("id").primaryKey(),

  usuarioId: uuid("usuario_id")
    .references(() => usuarios.id, {
      onDelete: "cascade",
    })
    .notNull(),

  nome: text("nome")
    .notNull(),

  ehCredito: boolean("eh_credito")
    .notNull()
    .default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =============================================
// REGRAS DE CATEGORIZACAO
// Cada usuário possui seu próprio aprendizado
// =============================================

export const regrasCategorizacao = pgTable(
  "regras_categorizacao",
  {
    id: serial("id").primaryKey(),

    usuarioId: uuid("usuario_id")
      .references(() => usuarios.id, {
        onDelete: "cascade",
      })
      .notNull(),

    estabelecimentoNormalizado: text(
      "estabelecimento_normalizado"
    ).notNull(),

    categoriaId: integer("categoria_id")
      .references(() => categorias.id)
      .notNull(),

    origem: text("origem")
      .notNull()
      .default("manual"),

    atualizadoEm: timestamp("atualizado_em", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("regra_usuario_estabelecimento_unique").on(
      table.usuarioId,
      table.estabelecimentoNormalizado
    ),
  ]
);

// =============================================
// TRANSACOES
// =============================================

export const transacoes = pgTable(
  "transacoes",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    // Conta responsável pela transação
    contaId: uuid("conta_id")
      .references(() => contas.id, {
        onDelete: "cascade",
      })
      .notNull(),

    data: date("data")
      .notNull(),

    // Texto exatamente como veio da Pluggy/Open Finance
    estabelecimentoBruto: text("estabelecimento_bruto")
      .notNull(),

    // Estabelecimento identificado pelo nosso sistema
    estabelecimentoId: integer("estabelecimento_id")
      .references(() => estabelecimentos.id),

    bancoCartaoId: integer("banco_cartao_id")
      .references(() => cartoes.id),

    metodoPagamento: text("metodo_pagamento")
      .notNull(),

    // Categoria final utilizada pelo nosso sistema
    categoriaId: integer("categoria_id")
      .references(() => categorias.id),

    // Categoria original retornada pela Pluggy
    categoriaPluggy: text("categoria_pluggy"),

    categoriaPluggyId: text("categoria_pluggy_id"),

    subcategoria: text("subcategoria"),

    valor: numeric("valor", {
      precision: 10,
      scale: 2,
    }).notNull(),

    parcelaAtual: smallint("parcela_atual"),

    parcelaTotal: smallint("parcela_total"),

    observacao: text("observacao"),

    // pluggy | manual
    origem: text("origem")
      .notNull(),

    idPluggy: text("id_pluggy"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("transacao_conta_pluggy_unique").on(
      table.contaId,
      table.idPluggy
    ),
  ]
);

// =============================================
// RELACOES - USUARIOS
// =============================================

export const usuariosRelations = relations(
  usuarios,
  ({ many }) => ({
    contas: many(contas),
    cartoes: many(cartoes),
    regrasCategorizacao: many(regrasCategorizacao),
  })
);

// =============================================
// RELACOES - CONTAS
// =============================================

export const contasRelations = relations(
  contas,
  ({ one, many }) => ({
    usuario: one(usuarios, {
      fields: [contas.usuarioId],
      references: [usuarios.id],
    }),

    transacoes: many(transacoes),
  })
);

// =============================================
// RELACOES - CARTOES
// =============================================

export const cartoesRelations = relations(
  cartoes,
  ({ one, many }) => ({
    usuario: one(usuarios, {
      fields: [cartoes.usuarioId],
      references: [usuarios.id],
    }),

    transacoes: many(transacoes),
  })
);

// =============================================
// RELACOES - TRANSACOES
// =============================================

export const transacoesRelations = relations(
  transacoes,
  ({ one }) => ({
    conta: one(contas, {
      fields: [transacoes.contaId],
      references: [contas.id],
    }),

    categoria: one(categorias, {
      fields: [transacoes.categoriaId],
      references: [categorias.id],
    }),

    cartao: one(cartoes, {
      fields: [transacoes.bancoCartaoId],
      references: [cartoes.id],
    }),

    estabelecimento: one(estabelecimentos, {
      fields: [transacoes.estabelecimentoId],
      references: [estabelecimentos.id],
    }),
  })
);

// =============================================
// RELACOES - REGRAS DE CATEGORIZACAO
// =============================================

export const regrasCategorizacaoRelations = relations(
  regrasCategorizacao,
  ({ one }) => ({
    usuario: one(usuarios, {
      fields: [regrasCategorizacao.usuarioId],
      references: [usuarios.id],
    }),

    categoria: one(categorias, {
      fields: [regrasCategorizacao.categoriaId],
      references: [categorias.id],
    }),
  })
);

// =============================================
// RELACOES - CATEGORIAS
// =============================================

export const categoriasRelations = relations(
  categorias,
  ({ many }) => ({
    transacoes: many(transacoes),
    regrasCategorizacao: many(regrasCategorizacao),
  })
);

// =============================================
// RELACOES - ESTABELECIMENTOS
// =============================================

export const estabelecimentosRelations = relations(
  estabelecimentos,
  ({ many }) => ({
    transacoes: many(transacoes),
  })
);