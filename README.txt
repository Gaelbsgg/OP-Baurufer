# Acompanhamento de Ordens - BAURUFER

## Como usar

1. Extraia o conteúdo em uma pasta, por exemplo: `C:\PainelOP`
2. No computador que vai rodar o painel instale Node.js (v14+).
3. Abra terminal na pasta e rode:
   ```
   npm install
   npm start
   ```
4. O servidor ficará disponível em `http://0.0.0.0:3000`.
   - Na TV ou outro computador da rede acesse `http://IP_DA_MAQUINA:3000`

## Configurações importantes

- O arquivo `server.js` já está configurado para conectar ao Firebird remoto:
  - Host: `172.16.2.1`
  - Database: `C:\TGA\Dados\TGA.FDB`
  - Usuário: `SYSDBA`
  - Senha: `masterkey`

Se precisar ajustar IP/credentials, altere os valores em `server.js`.