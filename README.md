# Sistema de Gerenciamento de Estacionamento

Sistema web completo para gerenciamento de estacionamentos, desenvolvido com React, TypeScript e Supabase.

## Funcionalidades

- Dashboard financeiro com gráficos e métricas
- Gestão de vagas em tempo real
- Controle de mensalistas
- Emissão de tickets
- Relatórios financeiros
- Gestão de funcionários
- Configurações do estabelecimento

## Tecnologias Utilizadas

- React 18
- TypeScript
- Supabase (Backend as a Service)
- Ant Design (UI Components)
- Recharts (Gráficos)
- React Router DOM
- Context API
- CSS Modules

## Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no Supabase

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/estacionamento-app.git
cd estacionamento-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto e adicione:
```env
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

## Deploy

O projeto está configurado para deploy automático na Vercel.
Cada push na branch main dispara um novo deploy automaticamente.

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── contexts/       # Contextos React
  ├── hooks/         # Custom hooks
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e APIs
  ├── styles/        # Estilos globais
  ├── types/         # Tipos TypeScript
  └── utils/         # Funções utilitárias
```

## Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.
