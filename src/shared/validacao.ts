// Limite da coluna numeric(10, 2)
const LIMITE_VALOR = 99_999_999.99;

// Aceita número ou texto no formato 1234.56 (ponto como separador).
// Retorna null para valores inválidos, negativos ou acima do limite.
export function lerValorMonetario(
  valor: unknown
): number | null {
  let numero: number;

  if (typeof valor === "number") {
    numero = valor;
  } else if (
    typeof valor === "string" &&
    /^\d+(\.\d{1,2})?$/.test(valor.trim())
  ) {
    numero = Number(valor.trim());
  } else {
    return null;
  }

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > LIMITE_VALOR
  ) {
    return null;
  }

  return Math.round(numero * 100) / 100;
}

const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === "string" && REGEX_UUID.test(valor);
}
