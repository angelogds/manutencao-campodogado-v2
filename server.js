const express = require('express');
const path = require('path');
require('dotenv').config();
require('./database/migrate');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'manutencao-campo-do-gado-v2',
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor ativo na porta ${port}`);
});

