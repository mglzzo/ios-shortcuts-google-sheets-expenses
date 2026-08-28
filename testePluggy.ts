import "dotenv/config";
import { getAccount, getTransactions } from "./src/Pluggy/pluggyController.js";

async function main() {
  const usuarioId = "94008833-c8bf-49c7-98c2-4b8242d8200a";

  try {
    const conta = await getAccount(usuarioId);
    console.log("Conta encontrada:");
    console.log(conta);
  } catch (error) {
    console.error("Erro:", error);
  }
  try{
    const conta = await getTransactions(usuarioId);
    console.log("Transações encontradas:");
    console.log(conta);
  } catch (error) {
    console.error("Erro:", error);
  }
}

main();