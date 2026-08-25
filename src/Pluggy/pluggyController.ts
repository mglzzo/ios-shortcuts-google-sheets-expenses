
function authPluggy (PLUGGY_CLIENT_ID: string, PLUGGY_CLIENT_SECRET: string) {
    fetch(process.env.URL_PLUGGY+'/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            clientId: PLUGGY_CLIENT_ID,
            clientSecret: PLUGGY_CLIENT_SECRET
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.apiKey) {
            console.log('Token de acesso obtido com sucesso:', data.apiKey);
            return data.apiKey;
        } else {
            console.error('Falha ao obter token de acesso:', data);
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}

function getAccounts (accessToken: string) {
    fetch(process.env.URL_PLUGGY+'/v2/connectors?types=PERSONAL_BANK', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': accessToken
            
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Contas obtidas com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}

function getTransactions (accessToken: string) {
    fetch(process.env.URL_PLUGGY+'/v2/transactions', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': accessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Transações obtidas com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}

