"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estabelecimentosRelations = exports.categoriasRelations = exports.regrasCategorizacaoRelations = exports.transacoesRelations = exports.cartoesRelations = exports.contasRelations = exports.conexoesBancariasRelations = exports.usuariosRelations = exports.transacoes = exports.regrasCategorizacao = exports.cartoes = exports.estabelecimentos = exports.categorias = exports.contas = exports.conexoesBancarias = exports.usuarios = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
// =============================================
// USUARIOS
// =============================================
exports.usuarios = (0, pg_core_1.pgTable)("usuarios", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    nome: (0, pg_core_1.text)("nome").notNull(),
    email: (0, pg_core_1.text)("email")
        .notNull()
        .unique(),
    senhaHash: (0, pg_core_1.text)("senha_hash")
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
// =============================================
// CONEXOES BANCARIAS
// Representa um Item criado na Pluggy
// =============================================
exports.conexoesBancarias = (0, pg_core_1.pgTable)("conexoes_bancarias", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    usuarioId: (0, pg_core_1.uuid)("usuario_id")
        .references(function () { return exports.usuarios.id; }, {
        onDelete: "cascade",
    })
        .notNull(),
    // Item ID / Item UID retornado pela Pluggy
    pluggyItemId: (0, pg_core_1.text)("pluggy_item_id")
        .notNull()
        .unique(),
    // Ex: Nubank, Itaú, Inter
    instituicao: (0, pg_core_1.text)("instituicao"),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});
// =============================================
// CONTAS BANCÁRIAS
// Cada conta da Pluggy pertence a uma conexão bancária
// =============================================
exports.contas = (0, pg_core_1.pgTable)("contas", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    conexaoId: (0, pg_core_1.uuid)("conexao_id")
        .references(function () { return exports.conexoesBancarias.id; }, {
        onDelete: "cascade",
    })
        .notNull(),
    // ID da conta retornado pela Pluggy
    pluggyAccountId: (0, pg_core_1.text)("pluggy_account_id")
        .notNull()
        .unique(),
    nome: (0, pg_core_1.text)("nome"),
    tipo: (0, pg_core_1.text)("tipo"),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});
// =============================================
// CATEGORIAS
// Categorias globais do sistema
// =============================================
exports.categorias = (0, pg_core_1.pgTable)("categorias", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    nome: (0, pg_core_1.text)("nome")
        .notNull()
        .unique(),
});
// =============================================
// ESTABELECIMENTOS
// Cadastro global de estabelecimentos conhecidos
// =============================================
exports.estabelecimentos = (0, pg_core_1.pgTable)("estabelecimentos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    apelido: (0, pg_core_1.text)("apelido")
        .notNull(),
    padraoBusca: (0, pg_core_1.text)("padrao_busca")
        .notNull()
        .unique(),
});
// =============================================
// CARTOES / MEIOS DE PAGAMENTO
// Cada cartão pertence a um usuário
// =============================================
exports.cartoes = (0, pg_core_1.pgTable)("cartoes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    usuarioId: (0, pg_core_1.uuid)("usuario_id")
        .references(function () { return exports.usuarios.id; }, {
        onDelete: "cascade",
    })
        .notNull(),
    nome: (0, pg_core_1.text)("nome")
        .notNull(),
    ehCredito: (0, pg_core_1.boolean)("eh_credito")
        .notNull()
        .default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
// =============================================
// REGRAS DE CATEGORIZACAO
// Cada usuário possui seu próprio aprendizado
// =============================================
exports.regrasCategorizacao = (0, pg_core_1.pgTable)("regras_categorizacao", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    usuarioId: (0, pg_core_1.uuid)("usuario_id")
        .references(function () { return exports.usuarios.id; }, {
        onDelete: "cascade",
    })
        .notNull(),
    estabelecimentoNormalizado: (0, pg_core_1.text)("estabelecimento_normalizado").notNull(),
    categoriaId: (0, pg_core_1.integer)("categoria_id")
        .references(function () { return exports.categorias.id; })
        .notNull(),
    origem: (0, pg_core_1.text)("origem")
        .notNull()
        .default("manual"),
    atualizadoEm: (0, pg_core_1.timestamp)("atualizado_em", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("regra_usuario_estabelecimento_unique").on(table.usuarioId, table.estabelecimentoNormalizado),
]; });
// =============================================
// TRANSACOES
// =============================================
exports.transacoes = (0, pg_core_1.pgTable)("transacoes", {
    id: (0, pg_core_1.uuid)("id")
        .primaryKey()
        .defaultRandom(),
    // Conta responsável pela transação
    contaId: (0, pg_core_1.uuid)("conta_id")
        .references(function () { return exports.contas.id; }, {
        onDelete: "cascade",
    })
        .notNull(),
    data: (0, pg_core_1.date)("data")
        .notNull(),
    // Texto exatamente como veio da Pluggy/Open Finance
    estabelecimentoBruto: (0, pg_core_1.text)("estabelecimento_bruto")
        .notNull(),
    // Estabelecimento identificado pelo nosso sistema
    estabelecimentoId: (0, pg_core_1.integer)("estabelecimento_id")
        .references(function () { return exports.estabelecimentos.id; }),
    bancoCartaoId: (0, pg_core_1.integer)("banco_cartao_id")
        .references(function () { return exports.cartoes.id; }),
    metodoPagamento: (0, pg_core_1.text)("metodo_pagamento")
        .notNull(),
    // Categoria final utilizada pelo nosso sistema
    categoriaId: (0, pg_core_1.integer)("categoria_id")
        .references(function () { return exports.categorias.id; }),
    // Categoria original retornada pela Pluggy
    categoriaPluggy: (0, pg_core_1.text)("categoria_pluggy"),
    categoriaPluggyId: (0, pg_core_1.text)("categoria_pluggy_id"),
    subcategoria: (0, pg_core_1.text)("subcategoria"),
    valor: (0, pg_core_1.numeric)("valor", {
        precision: 10,
        scale: 2,
    }).notNull(),
    parcelaAtual: (0, pg_core_1.smallint)("parcela_atual"),
    parcelaTotal: (0, pg_core_1.smallint)("parcela_total"),
    observacao: (0, pg_core_1.text)("observacao"),
    // pluggy | manual
    origem: (0, pg_core_1.text)("origem")
        .notNull(),
    idPluggy: (0, pg_core_1.text)("id_pluggy"),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("transacao_conta_pluggy_unique").on(table.contaId, table.idPluggy),
]; });
// =============================================
// RELACOES - USUARIOS
// =============================================
exports.usuariosRelations = (0, drizzle_orm_1.relations)(exports.usuarios, function (_a) {
    var many = _a.many;
    return ({
        conexoesBancarias: many(exports.conexoesBancarias),
        cartoes: many(exports.cartoes),
        regrasCategorizacao: many(exports.regrasCategorizacao),
    });
});
// =============================================
// RELACOES - CONEXOES BANCARIAS
// =============================================
exports.conexoesBancariasRelations = (0, drizzle_orm_1.relations)(exports.conexoesBancarias, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        usuario: one(exports.usuarios, {
            fields: [exports.conexoesBancarias.usuarioId],
            references: [exports.usuarios.id],
        }),
        contas: many(exports.contas),
    });
});
// =============================================
// RELACOES - CONTAS
// =============================================
exports.contasRelations = (0, drizzle_orm_1.relations)(exports.contas, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        conexao: one(exports.conexoesBancarias, {
            fields: [exports.contas.conexaoId],
            references: [exports.conexoesBancarias.id],
        }),
        transacoes: many(exports.transacoes),
    });
});
// =============================================
// RELACOES - CARTOES
// =============================================
exports.cartoesRelations = (0, drizzle_orm_1.relations)(exports.cartoes, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        usuario: one(exports.usuarios, {
            fields: [exports.cartoes.usuarioId],
            references: [exports.usuarios.id],
        }),
        transacoes: many(exports.transacoes),
    });
});
// =============================================
// RELACOES - TRANSACOES
// =============================================
exports.transacoesRelations = (0, drizzle_orm_1.relations)(exports.transacoes, function (_a) {
    var one = _a.one;
    return ({
        conta: one(exports.contas, {
            fields: [exports.transacoes.contaId],
            references: [exports.contas.id],
        }),
        categoria: one(exports.categorias, {
            fields: [exports.transacoes.categoriaId],
            references: [exports.categorias.id],
        }),
        cartao: one(exports.cartoes, {
            fields: [exports.transacoes.bancoCartaoId],
            references: [exports.cartoes.id],
        }),
        estabelecimento: one(exports.estabelecimentos, {
            fields: [exports.transacoes.estabelecimentoId],
            references: [exports.estabelecimentos.id],
        }),
    });
});
// =============================================
// RELACOES - REGRAS DE CATEGORIZACAO
// =============================================
exports.regrasCategorizacaoRelations = (0, drizzle_orm_1.relations)(exports.regrasCategorizacao, function (_a) {
    var one = _a.one;
    return ({
        usuario: one(exports.usuarios, {
            fields: [exports.regrasCategorizacao.usuarioId],
            references: [exports.usuarios.id],
        }),
        categoria: one(exports.categorias, {
            fields: [exports.regrasCategorizacao.categoriaId],
            references: [exports.categorias.id],
        }),
    });
});
// =============================================
// RELACOES - CATEGORIAS
// =============================================
exports.categoriasRelations = (0, drizzle_orm_1.relations)(exports.categorias, function (_a) {
    var many = _a.many;
    return ({
        transacoes: many(exports.transacoes),
        regrasCategorizacao: many(exports.regrasCategorizacao),
    });
});
// =============================================
// RELACOES - ESTABELECIMENTOS
// =============================================
exports.estabelecimentosRelations = (0, drizzle_orm_1.relations)(exports.estabelecimentos, function (_a) {
    var many = _a.many;
    return ({
        transacoes: many(exports.transacoes),
    });
});
