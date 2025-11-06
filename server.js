const express = require('express');
const Firebird = require('node-firebird');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

// 🔧 CONFIGURAÇÃO DO BANCO DE DADOS FIREBIRD
const dbOptions = {
  host: 'localhost',          // ou o IP do servidor Firebird
  port: 3050,                 // porta padrão
  database: 'C:\\TGA\\Dados\\TGA.FDB', // ✅ caminho corrigido
  user: 'SYSDBA',             // usuário do banco
  password: 'masterkey',      // senha do banco
  lowercase_keys: false,
  role: null,
  pageSize: 4096
};

// Helper para rodar queries
function runQuery(query, params, res) {
  Firebird.attach(dbOptions, function(err, db) { // ✅ corrigido Firebird.attach
    if (err) {
      console.error("❌ Erro ao conectar ao Firebird:", err.message);
      return res.status(500).json({ error: "Erro ao conectar ao banco: " + err.message });
    }

    db.query(query, params, function(err, result) {
  if (err) {
    console.error("Firebird query error:", err);
    db.detach();
    return res.status(500).json({ error: "Erro na query: " + err.message });
  }

  // 🔹 Conversão dos campos do Firebird para texto legível
  const formatted = result.map(row => {
    const obj = {};
    for (const key in row) {
      let value = row[key];

      // Converte buffers (como os de CODACAO)
      if (Buffer.isBuffer(value)) {
        value = value.toString('utf8').trim();
      }

      // Converte datas em formato ISO para dd/mm/yyyy
      if (value instanceof Date) {
        value = new Date(value).toLocaleDateString('pt-BR');
      }

      // Converte valores nulos para traço
      if (value === null || value === undefined || value === '') {
        value = '-';
      }

      obj[key] = value;
    }
    return obj;
  });

  db.detach();
  res.json(formatted);
});

  });
}

// Endpoint para buscar ordens com filtros
app.get('/ordens', (req, res) => {
  const status = req.query.status;
  const dataEntrega = req.query.dataEntrega;

  let query = `
  SELECT
    M.IDMOV,
    R.CODACAO AS STATUS_SERVICO,
    F.NOMEFANTASIA AS NOME_CLIENTE,
    M.DATAEMISSAO AS DATA_ABERTURA,
    M.DATAENTREGA AS DATA_ENTREGA,
    M.CODVEN1 AS FUNCIONARIO
  FROM TMOV M
  LEFT JOIN TMOVREGISTRO R ON R.IDMOV = M.IDMOV
  LEFT JOIN FCFO F ON F.CODCFO = M.CODCFO
  WHERE M.CODTMV = '2.2.02'
`;


  const params = [];
  if (status) {
    query += ` AND R.CODACAO = ?`;
    params.push(status);
  }
  if (dataEntrega) {
    query += ` AND CAST(M.DATAENTREGA AS DATE) = CAST(? AS DATE)`;
    params.push(dataEntrega);
  }

  query += ` ORDER BY M.DATAEMISSAO DESC`;
  runQuery(query, params, res);
});

// Endpoint para listar status
app.get('/statuses', (req, res) => {
  const q = `
    SELECT DISTINCT R.CODACAO AS STATUS
    FROM TMOV M
    LEFT JOIN TMOVREGISTRO R ON R.IDMOV = M.IDMOV
    WHERE M.CODTMV = '2.2.02'
    ORDER BY R.CODACAO
  `;
  runQuery(q, [], res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});