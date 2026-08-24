export const APELIDOS_ESTABELECIMENTO: Record<string, string> = {
  // DELIVERY
  IFD: "iFood",
  IFOOD: "iFood",
  RAPPI: "Rappi",

  // TRANSPORTE
  UBER: "Uber",
  "UBER TRIP": "Uber",
  "99APP": "99",
  "99 APP": "99",

  // TELECOM
  "CLARO S A": "Claro",
  CLARO: "Claro",
  VIVO: "Vivo",
  TIM: "TIM",

  // STREAMING / ASSINATURAS
  NETFLIX: "Netflix",
  SPOTIFY: "Spotify",
  "AMAZON PRIME": "Amazon Prime",
  "PRIME VIDEO": "Amazon Prime",
  DISNEY: "Disney+",

  // E-COMMERCE
  AMAZON: "Amazon",
  "MERCADO PAGO": "Mercado Pago",
  MERCADOLIVRE: "Mercado Livre",
  "MERCADO LIVRE": "Mercado Livre",
  SHOPEE: "Shopee",

  // ESTABELECIMENTOS LOCAIS
  "NOSSO MERCADINHO": "Nosso Mercadinho",
  "NOVO SHOP": "Novo Shop",
  DYLLE: "Dylle",
};

export const PESSOAS_CONHECIDAS: Record<
  string,
  { apelido: string; categoria: string }
> = {
  "YASMIM BEATRIZ DA SILVA LIMA": { apelido: "Yas <3", categoria: "Lazer" },
  "MARIA EDUARDA DE CASTRO MOREIRA": { apelido: "Duda", categoria: "Outros" },
  "DANIEL SANTOS SILVA": { apelido: "Daniel", categoria: "Trevo" },
  "JULIA ALMEIDA FERREIRA BARBOSA": { apelido: "Julia", categoria: "Outros" },
  "GABRIEL BERARDO MAZZO DOS SANTOS": { apelido: "Gabriel", categoria: "Contas/Utilidades" },
};

export const MAPA_CATEGORIAS: Record<string, string> = {
  // ALIMENTAÇÃO
  "Food and Drink": "Mercado",
  Supermarket: "Mercado",
  Groceries: "Mercado",

  Restaurants: "Lazer",
  Ifood: "Lazer",
  iFood: "Lazer",

  // TRANSPORTE
  Transport: "Transporte",
  Uber: "Transporte",
  "Taxi and ride-hailing": "Transporte",
  "Gas Station": "Transporte",

  // SAÚDE
  Health: "Saúde",
  Pharmacy: "Saúde",

  // EDUCAÇÃO
  Education: "Educação",

  // LAZER
  Entertainment: "Lazer",

  // COMPRAS
  Shopping: "Vestuário",
  Electronics: "Eletrônicos",

  // CASA
  Utilities: "Contas/Utilidades",
  Housing: "Moradia",
  Rent: "Moradia",

  // ASSINATURAS
  Subscription: "Assinaturas",

  // GENÉRICOS
  Transfer: "Outros",
  Payment: "Outros",
};

export const PLUGGY_API_URL = "https://api.pluggy.ai";