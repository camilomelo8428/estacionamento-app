# Manual do Sistema de Gerenciamento de Estacionamento
**Versão 1.2**

## Sumário
1. [Introdução](#1-introdução)
2. [Acesso ao Sistema](#2-acesso-ao-sistema)
3. [Módulos do Sistema](#3-módulos-do-sistema)
4. [Operações Diárias](#4-operações-diárias)
5. [Gestão Administrativa](#5-gestão-administrativa)
6. [Relatórios e Consultas](#6-relatórios-e-consultas)
7. [Configurações](#7-configurações)
8. [Solução de Problemas](#8-solução-de-problemas)
9. [Procedimentos de Emergência](#9-procedimentos-de-emergência)
10. [Boas Práticas](#10-boas-práticas)
11. [Manutenção do Sistema](#11-manutenção-do-sistema)

## 1. Introdução

### 1.1 Sobre o Sistema
O Sistema de Gerenciamento de Estacionamento é uma solução completa para controle e administração de estacionamentos, oferecendo funcionalidades para gestão de vagas, controle financeiro e administração de clientes.

### 1.2 Requisitos do Sistema
- Navegador web atualizado (Chrome, Firefox, Edge)
- Conexão com internet estável
- Impressora térmica para tickets (recomendado)
- Resolução mínima: 1366x768

## 2. Acesso ao Sistema

### 2.1 Login
1. Acesse o endereço do sistema
2. Insira suas credenciais:
   - Email
   - Senha
3. Clique em "Entrar"

### 2.2 Níveis de Acesso
- **Administrador**
  - Acesso total ao sistema
  - Gerenciamento de usuários
  - Configurações avançadas
  
- **Operador**
  - Gestão de entrada/saída
  - Emissão de tickets
  - Recebimento de pagamentos

## 3. Módulos do Sistema

### 3.1 Gestão de Vagas

#### 3.1.1 Painel de Vagas
- **Visualização em Tempo Real**
  - Verde: Vaga livre
  - Vermelho: Vaga ocupada
  - Azul: Vaga reservada (mensalista)

- **Categorias de Vagas**
  1. Veículos Pequenos (P1-P10)
  2. Veículos Grandes (G1-G10)
  3. Veículos Especiais (E1-E10)
  4. Motos (M1-M10)

#### 3.1.2 Ocupação de Vaga
1. Clique na vaga desejada
2. Preencha os dados do veículo:
   - Placa
   - Modelo
   - Cor
3. Confirme a entrada
4. Imprima o ticket

### 3.2 Gestão de Tickets

#### 3.2.1 Emissão de Tickets
1. Selecione "Novo Ticket"
2. Preencha os dados:
   ```
   - Placa do veículo
   - Categoria
   - Número da vaga
   - Hora de entrada (automático)
   ```
3. Clique em "Emitir Ticket"
4. Entregue o comprovante ao cliente

#### 3.2.2 Baixa de Tickets
1. Localize o ticket pela placa
2. Confira os dados:
   ```
   - Tempo de permanência
   - Valor calculado
   - Forma de pagamento
   ```
3. Receba o pagamento
4. Clique em "Finalizar"
5. Imprima o comprovante

### 3.3 Gestão de Mensalistas

#### 3.3.1 Cadastro de Mensalistas
1. Acesse "Mensalistas" > "Novo"
2. Preencha os dados:
   ```
   - Nome completo
   - CPF/CNPJ
   - Endereço
   - Telefone
   - Email
   - Placa(s) do(s) veículo(s)
   - Categoria do plano
   ```
3. Salve o cadastro

#### 3.3.2 Controle de Mensalidades
- **Registro de Pagamento**
  1. Localize o mensalista
  2. Selecione o mês
  3. Registre o pagamento
  4. Emita o recibo

- **Renovação de Plano**
  1. Acesse a ficha do mensalista
  2. Clique em "Renovar"
  3. Confirme o período
  4. Processe o pagamento

### 3.4 Gestão de Preços e Tarifas

#### 3.4.1 Configuração de Preços
- **Preços por Categoria**
  ```
  - Valor primeira hora
  - Valor hora adicional
  - Valor diária
  - Valor pernoite
  - Valor mensalidade
  ```

#### 3.4.2 Regras de Cobrança
- **Tolerância**
  - Tempo de tolerância na entrada
  - Tempo de tolerância para pagamento
  - Desconto hora cheia

- **Períodos Especiais**
  - Tarifas de fim de semana
  - Tarifas para feriados
  - Promoções e descontos

### 3.5 Controle de Acesso

#### 3.5.1 Níveis de Permissão
- **Administrador Master**
  - Acesso total ao sistema
  - Gerenciamento de outros administradores
  - Configurações avançadas do sistema

- **Administrador**
  - Gerenciamento de usuários
  - Relatórios financeiros
  - Configurações básicas

- **Operador**
  - Entrada e saída de veículos
  - Recebimento de pagamentos
  - Consultas básicas

- **Caixa**
  - Recebimento de pagamentos
  - Fechamento de caixa
  - Emissão de recibos

#### 3.5.2 Registro de Atividades
- Log de ações por usuário
- Histórico de alterações
- Registro de acessos

### 3.6 Backup e Segurança

#### 3.6.1 Backup Automático
- Backup diário dos dados
- Armazenamento em nuvem
- Retenção por 30 dias

#### 3.6.2 Recuperação de Dados
- Procedimento de restauração
- Pontos de recuperação
- Verificação de integridade

### 3.7 Integração com Equipamentos

#### 3.7.1 Impressoras
- **Configuração**
  ```
  - Modelo: [Especificações da impressora térmica]
  - Porta: USB/Serial
  - Velocidade: 9600bps
  - Buffer: 64KB
  ```

- **Manutenção**
  - Limpeza periódica
  - Troca de papel
  - Calibração

#### 3.7.2 Câmeras (Se disponível)
- Captura de placas
- Registro de imagens
- Armazenamento

## 4. Operações Diárias

### 4.1 Abertura do Dia
1. Faça login no sistema
2. Verifique o status das vagas
3. Confirme funcionamento da impressora
4. Verifique pendências do dia anterior

### 4.2 Rotinas de Operação
- **Entrada de Veículos**
  1. Identifique vaga disponível
  2. Registre dados do veículo
  3. Emita ticket
  4. Oriente o cliente

- **Saída de Veículos**
  1. Receba ticket do cliente
  2. Calcule valor
  3. Receba pagamento
  4. Libere a vaga
  5. Entregue comprovante

### 4.3 Fechamento do Dia
1. Confira movimentação
2. Gere relatório diário
3. Faça fechamento de caixa
4. Backup dos dados (automático)

## 5. Gestão Administrativa

### 5.1 Controle Financeiro
- **Relatórios Disponíveis**
  - Movimento diário
  - Fechamento mensal
  - Receitas por categoria
  - Mensalidades recebidas
  - Inadimplência

### 5.2 Gestão de Funcionários
- **Cadastro de Usuários**
  1. Acesse "Funcionários"
  2. Clique em "Novo"
  3. Preencha:
     ```
     - Nome
     - CPF
     - Cargo
     - Nível de acesso
     - Email
     - Senha inicial
     ```

### 5.3 Configurações do Sistema
- **Dados da Empresa**
  - Razão social
  - CNPJ
  - Endereço
  - Telefone
  - Logo para impressão

- **Tabela de Preços**
  1. Acesse "Configurações"
  2. Selecione "Preços"
  3. Configure por categoria:
     ```
     - Valor hora
     - Valor diária
     - Valor mensalidade
     - Tolerância
     ```

## 6. Relatórios e Consultas

### 6.1 Relatórios Operacionais
- **Ocupação**
  - Taxa de ocupação
  - Tempo médio
  - Rotatividade

- **Financeiro**
  - Faturamento por período
  - Tickets emitidos
  - Forma de pagamento

### 6.2 Consultas
- **Tickets**
  - Por data
  - Por placa
  - Por status

- **Mensalistas**
  - Ativos/Inativos
  - Pagamentos
  - Vencimentos

## 7. Configurações

### 7.1 Personalização
- **Impressão**
  - Layout dos tickets
  - Dados do cabeçalho
  - Informações do rodapé

- **Sistema**
  - Tempo de sessão
  - Backup automático
  - Notificações

### 7.2 Integrações
- Impressora térmica
- Sistema fiscal
- Câmeras (se disponível)

## 8. Solução de Problemas

### 8.1 Problemas Comuns
1. **Sistema não atualiza**
   - Verifique conexão
   - Recarregue a página
   - Limpe o cache

2. **Erro na impressão**
   - Verifique conexão USB
   - Confira papel
   - Reinicie impressora

3. **Lentidão**
   - Verifique internet
   - Limpe histórico
   - Contate suporte

### 8.2 Suporte Técnico
- Email: suporte@sistema.com
- Tel: (XX) XXXX-XXXX
- Horário: 8h às 18h

## 9. Procedimentos de Emergência

### 9.1 Falha no Sistema
1. **Sistema Offline**
   - Use tickets manuais numerados
   - Registre entradas em planilha
   - Anote horários precisamente

2. **Recuperação**
   - Insira dados acumulados
   - Confira numeração
   - Valide informações

### 9.2 Falha de Energia
- Sistema em UPS
- Procedimento manual
- Registro em contingência

### 9.3 Problemas de Rede
- Modo offline temporário
- Sincronização posterior
- Validação de dados

## 10. Boas Práticas

### 10.1 Atendimento ao Cliente
- Cordialidade
- Agilidade
- Resolução de problemas

### 10.2 Organização
- Manter documentação em dia
- Backup de tickets manuais
- Organização do caixa

### 10.3 Segurança
- Troca regular de senhas
- Logout ao se ausentar
- Verificação dupla em operações críticas

## 11. Manutenção do Sistema

### 11.1 Manutenção Preventiva
- **Diária**
  ```
  - Verificar impressora
  - Testar conexão
  - Conferir backup
  ```

- **Semanal**
  ```
  - Limpar cache
  - Verificar logs
  - Atualizar preços se necessário
  ```

- **Mensal**
  ```
  - Backup manual
  - Verificar relatórios
  - Validar configurações
  ```

### 11.2 Atualizações
- Novas versões
- Correções de bugs
- Melhorias de segurança

## Anexos

### A. Atalhos do Teclado
```
F2 - Novo ticket
F3 - Buscar ticket
F4 - Pagamento
F5 - Atualizar tela
F8 - Abrir caixa
F9 - Fechar caixa
```

### B. Códigos de Erro
```
E001 - Erro de conexão
E002 - Impressora não encontrada
E003 - Sessão expirada
E004 - Dados inválidos
```

### C. Manutenção Preventiva
1. Limpeza de cache semanal
2. Verificação de impressora
3. Backup manual mensal
4. Atualização de sistema

---

**Observações Importantes:**
1. Mantenha suas credenciais seguras
2. Faça logout ao se ausentar
3. Reporte problemas imediatamente
4. Mantenha sistema atualizado

**Contatos Úteis:**
- Suporte Técnico: (XX) XXXX-XXXX
- Administração: (XX) XXXX-XXXX
- Email: contato@sistema.com

**Apêndice A: Glossário**

- **Ticket Avulso**: Comprovante para clientes não mensalistas
- **Mensalista**: Cliente com contrato mensal
- **Pernoite**: Período noturno com tarifa especial
- **Tolerância**: Tempo adicional sem cobrança
- **UPS**: No-break, sistema de energia ininterrupta

**Apêndice B: Formulários**

1. **Cadastro de Mensalista**
2. **Registro Manual de Entrada**
3. **Fechamento de Caixa**
4. **Relatório de Ocorrências** 