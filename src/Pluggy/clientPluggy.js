"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPluggy = authPluggy;
exports.getAccount = getAccount;
exports.getTransactions = getTransactions;
var Client_js_1 = require("../../db/client/Client.js");
require("dotenv/config");
var schema_js_1 = require("../../db/schema/schema.js");
var URL_PLUGGY = process.env.URL_PLUGGY;
var PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID;
var PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET;
var usuarioId = "94008833-c8bf-49c7-98c2-4b8242d8200a";
if (!URL_PLUGGY) {
    throw new Error("URL_PLUGGY não definida no .env");
}
if (!PLUGGY_CLIENT_ID) {
    throw new Error("PLUGGY_CLIENT_ID não definida no .env");
}
if (!PLUGGY_CLIENT_SECRET) {
    throw new Error("PLUGGY_CLIENT_SECRET não definida no .env");
}
// AUTENTICAÇÃO PLUGGY
function authPluggy() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(URL_PLUGGY, "/auth"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            clientId: PLUGGY_CLIENT_ID,
                            clientSecret: PLUGGY_CLIENT_SECRET,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Erro ao autenticar na Pluggy: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = (_a.sent());
                    if (!data.apiKey) {
                        throw new Error("Falha ao obter token de acesso da Pluggy");
                    }
                    return [2 /*return*/, data.apiKey];
            }
        });
    });
}
// CONEXÃO BANCÁRIA DO USUÁRIO
function buscarConexaoUsuario(usuarioId) {
    return __awaiter(this, void 0, void 0, function () {
        var conexao;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Client_js_1.db.query.conexoesBancarias.findFirst({
                        where: function (conexao, _a) {
                            var eq = _a.eq;
                            return eq(conexao.usuarioId, usuarioId);
                        },
                    })];
                case 1:
                    conexao = _a.sent();
                    if (!conexao) {
                        throw new Error("Conexão bancária não encontrada");
                    }
                    return [2 /*return*/, conexao];
            }
        });
    });
}
// SINCRONIZAR CONTA
function sincronizarContaCorrente(usuarioId) {
    return __awaiter(this, void 0, void 0, function () {
        var conexao, apiKey, url, response, data, contaCorrente, contaSalva;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, buscarConexaoUsuario(usuarioId)];
                case 1:
                    conexao = _c.sent();
                    return [4 /*yield*/, authPluggy()];
                case 2:
                    apiKey = _c.sent();
                    url = new URL("".concat(URL_PLUGGY, "/accounts"));
                    url.searchParams.set("itemId", conexao.pluggyItemId);
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": apiKey,
                            },
                        })];
                case 3:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("Erro ao buscar contas: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = (_c.sent());
                    contaCorrente = data.results.find(function (account) {
                        return account.type === "BANK" &&
                            account.subtype === "CHECKING_ACCOUNT";
                    });
                    if (!contaCorrente) {
                        throw new Error("Conta corrente não encontrada na Pluggy");
                    }
                    return [4 /*yield*/, Client_js_1.db
                            .insert(schema_js_1.contas)
                            .values({
                            conexaoId: conexao.id,
                            pluggyAccountId: contaCorrente.id,
                            nome: (_a = contaCorrente.name) !== null && _a !== void 0 ? _a : "Conta Corrente",
                            tipo: contaCorrente.subtype,
                        })
                            .onConflictDoUpdate({
                            target: schema_js_1.contas.pluggyAccountId,
                            set: {
                                nome: (_b = contaCorrente.name) !== null && _b !== void 0 ? _b : "Conta Corrente",
                                tipo: contaCorrente.subtype,
                            },
                        })
                            .returning()];
                case 5:
                    contaSalva = (_c.sent())[0];
                    if (!contaSalva) {
                        throw new Error("Erro ao salvar conta");
                    }
                    return [2 /*return*/, contaSalva];
            }
        });
    });
}
// OBTER CONTA
function getAccount(usuarioId) {
    return __awaiter(this, void 0, void 0, function () {
        var conexao, contaSalva;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, buscarConexaoUsuario(usuarioId)];
                case 1:
                    conexao = _a.sent();
                    return [4 /*yield*/, Client_js_1.db.query.contas.findFirst({
                            where: function (conta, _a) {
                                var and = _a.and, eq = _a.eq;
                                return and(eq(conta.conexaoId, conexao.id), eq(conta.tipo, "CHECKING_ACCOUNT"));
                            },
                        })];
                case 2:
                    contaSalva = _a.sent();
                    if (contaSalva) {
                        return [2 /*return*/, contaSalva];
                    }
                    return [2 /*return*/, sincronizarContaCorrente(usuarioId)];
            }
        });
    });
}
// SALVAR TRANSAÇÕES
function salvarTransacoes(contaId, transacoesPluggy) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, transacoesPluggy_1, transacao;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, transacoesPluggy_1 = transacoesPluggy;
                    _c.label = 1;
                case 1:
                    if (!(_i < transacoesPluggy_1.length)) return [3 /*break*/, 4];
                    transacao = transacoesPluggy_1[_i];
                    return [4 /*yield*/, Client_js_1.db
                            .insert(schema_js_1.transacoes)
                            .values({
                            contaId: contaId,
                            data: transacao.date.slice(0, 10),
                            estabelecimentoBruto: (_a = transacao.descriptionRaw) !== null && _a !== void 0 ? _a : transacao.description,
                            metodoPagamento: (_b = transacao.operationType) !== null && _b !== void 0 ? _b : transacao.type,
                            categoriaId: null,
                            categoriaPluggy: transacao.category,
                            categoriaPluggyId: transacao.categoryId,
                            valor: transacao.amount.toFixed(2),
                            estabelecimentoId: null,
                            bancoCartaoId: null,
                            origem: "pluggy",
                            idPluggy: transacao.id,
                        })
                            .onConflictDoNothing()];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// BUSCAR + SALVAR TRANSAÇÕES
function getTransactions(usuarioId) {
    return __awaiter(this, void 0, void 0, function () {
        var conta, apiKey, url, response, data, inseridas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccount(usuarioId)];
                case 1:
                    conta = _a.sent();
                    return [4 /*yield*/, authPluggy()];
                case 2:
                    apiKey = _a.sent();
                    url = new URL("".concat(URL_PLUGGY, "/v2/transactions"));
                    url.searchParams.set("accountId", conta.pluggyAccountId);
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": apiKey,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Erro ao buscar transa\u00E7\u00F5es: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = (_a.sent());
                    console.log("".concat(data.results.length, " transa\u00E7\u00F5es recebidas da Pluggy"));
                    return [4 /*yield*/, salvarTransacoes(conta.id, data.results)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, salvarTransacoes(conta.id, data.results)];
                case 6:
                    inseridas = _a.sent();
                    console.log("".concat(data.results.length, " recebidas / ").concat(inseridas, " novas inseridas"));
                    console.log("Transações processadas e salvas");
                    return [2 /*return*/, data.results];
            }
        });
    });
}
getTransactions(usuarioId);
