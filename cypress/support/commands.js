// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


import { faker } from '@faker-js/faker';

// Comando de cadastro reutilizável
Cypress.Commands.add('cadastro', (emailParam, passwordParam, { administrador = false, waitForCreate = true } = {}) => {
    const first = faker.name.firstName();
    const last = faker.name.lastName();
    const nome = `${first} ${last}`;
    const email = emailParam || faker.internet.email(first, last);
    const senha = passwordParam || faker.internet.password(10);

    cy.visit('https://front.serverest.dev/cadastrarusuarios');

    // Intercepta a requisição de criação de usuário
    cy.intercept('POST', '**/usuarios').as('createUser');

    cy.get('[data-testid="nome"]').clear().type(nome);
    cy.get('[data-testid="email"]').clear().type(email);
    cy.get('[data-testid="password"]').clear().type(senha);
    if (administrador) {
        cy.get('[data-testid="checkbox"]').check();
    }
    cy.get('[data-testid="cadastrar"]').click();

    if (waitForCreate) {
        cy.wait('@createUser', { timeout: 10000 });
    }

    // Retorna os dados usados para asserts no teste
    return cy.wrap({ nome, email, senha });
});

Cypress.Commands.add('cadastroAdm', (emailParam, passwordParam, { administrador = true, waitForCreate = true } = {}) => {
    const first = faker.name.firstName();
    const last = faker.name.lastName();
    const nome = `${first} ${last}`;
    const email = emailParam || faker.internet.email(first, last);
    const senha = passwordParam || faker.internet.password(10);

    cy.visit('https://front.serverest.dev/cadastrarusuarios');

    // Intercepta a requisição de criação de usuário
    cy.intercept('POST', '**/usuarios').as('createUser');

    cy.get('[data-testid="nome"]').clear().type(nome);
    cy.get('[data-testid="email"]').clear().type(email);
    cy.get('[data-testid="password"]').clear().type(senha);
    if (administrador) {
        cy.get('[data-testid="checkbox"]').check();
    }
    cy.get('[data-testid="cadastrar"]').click();

    if (waitForCreate) {
        cy.wait('@createUser', { timeout: 10000 });
    }

    // Retorna os dados usados para asserts no teste
    return cy.wrap({ nome, email, senha });
});

//Comando para login reutilizável
Cypress.Commands.add('login', (email, senha) => {
    cy.visit('https://front.serverest.dev/login');

    cy.get('[data-testid="email"]').clear().type(email);
    cy.get('[data-testid="senha"]').clear().type(senha);
    cy.get('[data-testid="entrar"]').click();
});

// cria usuário via API (retorna chain Cypress)
Cypress.Commands.add('createUserApi', (email, password, { administrador = "false", nome } = {}) => {
  const first = nome ? nome.split(' ')[0] : faker.name.firstName();
  const last = nome ? nome.split(' ').slice(1).join(' ') || faker.name.lastName() : faker.name.lastName();
  const body = {
    nome: nome || `${first} ${last}`,
    email: email || faker.internet.email(first, last),
    password: password || faker.internet.password(10),
    administrador: administrador
  };

  // retorna a chain cy.request
  return cy.request({
    method: 'POST',
    url: 'https://serverest.dev/usuarios',
    body,
    failOnStatusCode: false
  }).then(resp => {
    // retorna um objeto através de cy.wrap para manter a chain Cypress
    return cy.wrap({ ...body, apiResponse: resp });
  });
});

// login programático (retorna chain Cypress)
Cypress.Commands.add('loginApi', (email, password) => {
  return cy.request({
    method: 'POST',
    url: 'https://serverest.dev/login',
    body: { email, password },
    failOnStatusCode: false
 }).then(resp => {
    // se precisar persistir token na UI, faça dentro da chain (não retorne o objeto bruto)
    if (resp.status === 200 && resp.body.authorization) {
      // substitui about:blank por uma URL válida da aplicação
      // se você configurou baseUrl em cypress.config.js pode usar cy.visit('/')
      return cy.visit('https://front.serverest.dev').then(() => {
        return cy.window().then(win => {
          win.localStorage.setItem('token', resp.body.authorization);
          return resp; // retorna resp dentro da chain
        });
      });
    }
    return resp; // retorna resp dentro da chain
  });
});