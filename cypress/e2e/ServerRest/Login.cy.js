import { faker } from '@faker-js/faker';

describe('Teste de login', () => {
    it('LG001 - Realizar login como administrador com sucesso', () => {
        cy.cadastroAdm().then(({ nome, email, senha }) => {
            // usar os dados retornados para login (não retorna a senha por questão de segurança)
            cy.log('Criado:', nome, email);

            cy.visit('https://front.serverest.dev/login');

            cy.get('[data-testid="email"]').type(email);
            cy.get('[data-testid="senha"]').type(senha);
            cy.get('[data-testid="entrar"]').click();

            cy.location('pathname').should('eq', '/admin/home');
        });
    });

    it('LG002 - Realizar login como usuário comum com sucesso', () => {
        cy.cadastro().then(({ nome, email, senha }) => {
            // usar os dados retornados para login (não retorna a senha por questão de segurança)
            cy.log('Criado:', nome, email);

            cy.visit('https://front.serverest.dev/login');

            cy.get('[data-testid="email"]').type(email);
            cy.get('[data-testid="senha"]').type(senha);
            cy.get('[data-testid="entrar"]').click();

            cy.location('pathname').should('eq', '/home');
        });
    });

    it('LG003 - Tentativa de login com senha incorreta', () => {
        cy.cadastro().then(({ nome, email, senha }) => {
            // usar os dados retornados para login (não retorna a senha por questão de segurança)
            cy.log('Criado:', nome, email);

            cy.visit('https://front.serverest.dev/login');

            cy.get('[data-testid="email"]').type(email);
            cy.get('[data-testid="senha"]').type('senhaIncorreta');
            cy.get('[data-testid="entrar"]').click();

            cy.get('.alert').should('be.visible').and('contain', 'Email e/ou senha inválidos');

            cy.location('pathname').should('eq', '/login');
        });
    });

    it('LG004 - Tentativa de login com um e-mail não cadastrado', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="email"]').type('email@teste.com');
        cy.get('[data-testid="senha"]').type('senha123');
        cy.get('[data-testid="entrar"]').click();

        cy.get('.alert').should('be.visible').and('contain', 'Email e/ou senha inválidos');

        cy.location('pathname').should('eq', '/login');
    });

    it('LG005 - Tentativa de login com todos os campos vazios', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="entrar"]').click();

        cy.get('.form > :nth-child(3)').should('be.visible').and('contain', 'Email é obrigatório');
        cy.get('.form > :nth-child(4)').should('be.visible').and('contain', 'Password é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    it('LG006 - Tentativa de login com o campo de email vazio', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="senha"]').type('senhaTeste');
        cy.get('[data-testid="entrar"]').click();

        cy.get('.alert').should('be.visible').and('contain', 'Email é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    it('LG007 - Tentativa de login com o campo de senha vazio', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="email"]').type('email@teste.com');
        cy.get('[data-testid="entrar"]').click();

        cy.get('.alert').should('be.visible').and('contain', 'Password é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    //Fim do describe
});

