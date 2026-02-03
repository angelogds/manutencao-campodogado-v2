# Manutenção Campo do Gado (v2)

Este repositório contém a base estrutural do novo aplicativo de manutenção do Campo do Gado.
Ele foi organizado em módulos para facilitar a evolução do backend, banco de dados, telas e utilitários.

## Estrutura do projeto

A estrutura segue a árvore definida para o projeto, com módulos separados por domínio de negócio
(autenticação, ordens de serviço, preventiva, compras, estoque, etc.) e suporte a geração de PDFs
padronizados.

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` conforme necessário.
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Próximos passos

- Implementar rotas, controladores e serviços em cada módulo.
- Consolidar migrations e seeds do banco de dados.
- Integrar as views EJS e assets estáticos.

