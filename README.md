# Template Backend de Projetos - {IN} Junior 🐺

## 📋 Sumário:

1. [Visão Geral](#visao-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Tipos de Usuários](#tipos-de-usuarios)
4. [Funcionalidades por Requisito](#funcionalidades-por-requisito)
5. [Requisitos Não Funcionais](#requisitos-nao-funcionais)
6. [Casos de Uso Principais](#casos-de-uso-principais)
7. [Requisitos](#requisitos)
8. [Versões Utilizadas](#versoes-utilizadas)
9. [Como Executar o Servidor](#como-executar-o-servidor)
10. [Links Externos](#links-externos)
11. [Equipe de Desenvolvimento](#equipe-de-desenvolvimento)

---

<a name="visao-geral"></a>

## 🗺️ Visão Geral:

Neste repositório está o template desenvolvido para clonagem durante a criação de novos projetos backend na IN Junior.
Você deve substituir o conteúdo desta seção por uma descrição abrangente e resumida sobre o escopo do projeto que está criando.
Avancemos juntos, lobos, fortalecendo nossa **alcateia** a cada projeto!

---

<a name="estrutura-do-projeto"></a>

## 📂 Estrutura do Projeto:

```bash
├─── .github
├─── .vscode
├─── logs
├─── prisma
└─── src
     ├─── @types
     ├─── constants
     ├─── env
     ├─── http
     │    ├─── controllers
     │    │    ├─── health-check
     │    │    └─── users
     │    ├─── middlewares
     │    └─── schemas
     │         ├───users
     │         └───utils
     ├─── lib
     │    ├─── logger
     │    └─── prisma
     ├─── repositories
     │    └─── prisma
     ├─── templates
     │    └─── forgot-password
     ├─── use-cases
     │    ├─── errors
     │    ├─── factories
     │    ├─── messaging
     │    └─── users
     └─── utils
```

---

<a name="tipos-de-usuarios"></a>

## 👤 Tipos de Usuários:

<div align="center">

| Tipo de Usuário   |            Permissões Principais            |
| :---------------: | :-----------------------------------------: |
|   Admin           |       Gerenciamento global do sistema       |
|   Default         | Usuário do sistema sem permissões especiais |

</div>

---

<a name="funcionalidades-por-requisito"></a>

## ✅ Funcionalidades por Requisito:

### 📌 Requisito 1 – (Nome do Requisito 1):

- [x] 1.1 Cadastro de usuário
- [x] 1.2 Redefinição de senha (esqueci a senha)
- [x] 1.3 Login com email e senha
- [ ] 1.4 Login com CPF

### 📌 Requisito 2 – (Nome do Requisito 2):

- [ ] 2.1 ...
- [ ] 2.2 ...

  - [ ] 2.2.1 ...
  - [ ] 2.2.2 ...
- [ ] 2.3 ...

---

<a name="requisitos-nao-funcionais"></a>

## 🧪 Requisitos Não Funcionais:

- [x] NF.1 - Segurança: controle de acesso por tipo de usuário
- [ ] NF.2 - ...
- [ ] NF.3 - ...

---

<a name="casos-de-uso-principais"></a>

## 🛠️ Casos de Uso Principais:

- [x] 1\. Usuário se cadastra no sistema
- [x] 2\. Administrador gerencia o sistema
- [ ] 3\. ...
- [ ] 4\. ...

---

<a name="requisitos"></a>

## ✔️ Requisitos:
Certifique-se de que você tenha os seguintes softwares instalados antes de continuar:

- [Docker](https://www.docker.com/) (versão mínima: 20.10)
- [Docker Compose](https://docs.docker.com/compose/) (versão mínima: 1.29)

---

<a name="versoes-utilizadas"></a>

## ⚙️ Versões Utilizadas:
- **Node.js**: 22.18.0
- **PostgreSQL**: 17.4.0 (Imagem Docker Bitnami)
- **Prisma**: 6.14.0

---

<a name="como-executar-o-servidor"></a>

## 💻 Como Executar o Servidor:
1. Abra o terminal - `CMD`, `PowerShell`, `Bash` ou similares - em algum diretório de preferência em sua máquina.
2. Clone este repositório com o comando: 

```bash
git clone https://github.com/IN-Junior-UFF/backend-template-reborn
```

3. Navegue para dentro do projeto clonado com o comando: 

```bash
cd backend-template-reborn
```

4. Instale as dependências do projeto ao executar no console o comando:

```bash
npm install
```

5. Crie um arquivo `.env` na raiz do projeto copiando o conteúdo do `.env.example`:

```bash
copy .env.example .env
# Preencha manualmente os valores do arquivo .env que não estiverem definidos.
```

6. Inicialize os contêiners do Docker executando o comando:

```bash
docker compose up -d
```

7. Execute o comando para resetar o banco de dados, populá-lo com dados de teste definidos em `prisma/seed.ts` e habilitar as extensões necessárias:

```bash
npx prisma migrate reset
```

8. Rode o projeto com o comando: 

```bash
npm run start:dev
```

---

<a name="links-externos"></a>

## 🔗 Links Externos:

- **Design Figma do Projeto**: <a href="#" target="_blank">Clique Aqui</a>
- **Template Backend Utilizado**: <a href="https://github.com/IN-Junior-UFF/backend-template-reborn" target="_blank">Clique Aqui</a>
- **Documentação da API**: <a href="#" target="_blank">Clique Aqui</a>

---

<a name="equipe-de-desenvolvimento"></a>

## 👥 Equipe de Desenvolvimento:

- **Product Owner**: <a href="#" target="_blank">\<Nome 1></a>
- **Dev Backend**: <a href="#" target="_blank">\<Nome 2></a>
- **Dev Backend**: <a href="#" target="_blank">\<Nome 3></a>
