import "dotenv/config";
import { getTransactions } from "./src/Pluggy/clientPluggy.js";

async function main() {
  const usuarioId = "94008833-c8bf-49c7-98c2-4b8242d8200a";

  const resultado = await getTransactions(usuarioId);

  console.log(
    `Teste concluído: ${resultado.totalRecebidas} transações recebidas e ${resultado.totalInseridas} novas inseridas`
  );
}

main().catch(console.error);