const express = require('express');
const Firebird = require('node-firebird');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

// 🔧 CONFIG FIREBIRD
const dbOptions = {
  host: 'localhost',
  port: 3050,
  database: 'C:\\TGA\\Dados\\BAURU.FDB',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
  charset: 'none'
};

// 🔧 Executa queries no Firebird
function runQuery(query, params = [], res) {
  Firebird.attach(dbOptions, (err, db) => {
    if (err) {
      console.error("❌ Erro ao conectar ao Firebird:", err);
      return res.status(500).json({ error: "Erro ao conectar ao banco." });
    }

    db.query(query, params, (err, result) => {

      if (err) {
        console.error("❌ Erro na query Firebird:", err);
        db.detach();
        return res.status(500).json({ error: "Erro ao executar a consulta." });
      }

      // 🔄 Formatar saída para evitar buffers e datas mal formatadas
      const formatted = result.map(row => {
        const data = {};

        for (let key in row) {
          let value = row[key];

          if (Buffer.isBuffer(value)) {
            value = value.toString("latin1").trim();
          }

          // Formata datas
          if (value instanceof Date) {
            value = value.toLocaleDateString("pt-BR");
          }

          // Mantém NULL se vier do banco
          if (value === null) value = null;

          data[key] = value;
        }

        return data;
      });

      db.detach();
      return res.json(formatted);
    });
  });
}

// 📌 Endpoint: Buscar ordens de serviço
app.get('/ordens', (req, res) => {
  const { status, dataEntrega } = req.query;

  let query = `
      SELECT
        M.IDMOV,
        COALESCE(A.DESCRICAO, 'SEM STATUS') AS STATUS_SERVICO,
        F.NOMEFANTASIA AS NOME_CLIENTE,
        M.DATAEMISSAO AS DATA_ABERTURA,
        M.DATAENTREGA AS DATA_ENTREGA,
        M.CODVEN1 AS FUNCIONARIO
      FROM TMOV M
      LEFT JOIN TMOVREGISTRO R ON R.IDMOV = M.IDMOV
      LEFT JOIN TACAO A ON A.CODACAO = R.CODACAO
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

// 📌 Endpoint: Listar TODOS os status existentes no banco (TACAO)
app.get('/statuses', (req, res) => {
  const query = `
      SELECT 
        CODACAO,
        DESCRICAO
      FROM TACAO
      ORDER BY DESCRICAO
  `;
  runQuery(query, [], res);
});


// 📡 Porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em 0.0.0.0:${PORT}`);
});
