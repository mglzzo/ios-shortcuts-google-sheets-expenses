import "dotenv/config";
import { getTransactions } from "./src/Pluggy/clientPluggy.js";
import { categorizarTransacoesPendentes } from "./categorizar.js";

async function main() {
  const usuarioId = "94008833-c8bf-49c7-98c2-4b8242d8200a";

  // const resultado = await getTransactions(usuarioId);

  const resultado =
  await categorizarTransacoesPendentes(
    usuarioId
  );

console.log(resultado);
}

main().catch(console.error);