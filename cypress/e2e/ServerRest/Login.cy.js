import { faker } from '@faker-js/faker';

describe('Teste de login', () => {
    it('LG001 - Realizar login como administrador com sucesso', () => {
        //Comandos do faker para gerar dados aleatórios        
        const first = faker.name.firstName();
        const last = faker.name.lastName();
        const nome = `${first} ${last}`;
        const email = faker.internet.email(first, last);
        const senha = faker.internet.password(10);
        // Faz uma requisição direta para criar o usuário via API
        cy.request({
            method: 'POST',
            url: 'https://serverest.dev/usuarios',
            body: {
                nome: nome,
                email: email,
                password: senha,
                administrador: "true"
            },
            failOnStatusCode: false
        }).then((resp) => {
            // Garante que a criação via API foi aceita (201/200) ou que já existia
            expect([200, 201, 400, 409]).to.include(resp.status);
        });

        // Tenta cadastrar pelo front com o email que retornou da requisição
        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="email"]').type(email);
        cy.get('[data-testid="senha"]').type(senha);
        cy.get('[data-testid="entrar"]').click();

        cy.location('pathname').should('eq', '/admin/home');
    });

    it('LG002 - Realizar login como usuário comum com sucesso', () => {
        //Comandos do faker para gerar dados aleatórios        
        const first = faker.name.firstName();
        const last = faker.name.lastName();
        const nome = `${first} ${last}`;
        const email = faker.internet.email(first, last);
        const senha = faker.internet.password(10);
        // Faz uma requisição direta para criar o usuário via API
        cy.request({
            method: 'POST',
            url: 'https://serverest.dev/usuarios',
            body: {
                nome: nome,
                email: email,
                password: senha,
                administrador: "false"
            },
            failOnStatusCode: false
        }).then((resp) => {
            // Garante que a criação via API foi aceita (201/200) ou que já existia
            expect([200, 201, 400, 409]).to.include(resp.status);
        });

        // Tenta cadastrar pelo front com o email que retornou da requisição
        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="email"]').type(email);
        cy.get('[data-testid="senha"]').type(senha);
        cy.get('[data-testid="entrar"]').click();

        cy.location('pathname').should('eq', '/home');
    });

    it('LG003 - Tentativa de login com todos os campos vazios', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="entrar"]').click();

        cy.get('.form > :nth-child(3)').should('be.visible').and('contain', 'Email é obrigatório');
        cy.get('.form > :nth-child(4)').should('be.visible').and('contain', 'Password é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    it('LG004 - Tentativa de login com o campo de email vazio', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="senha"]').type('senhaTeste');
        cy.get('[data-testid="entrar"]').click();

        cy.get('.alert').should('be.visible').and('contain', 'Email é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    it('LG005 - Tentativa de login com o campo de senha vazio', () => {

        cy.visit('https://front.serverest.dev/login');

        cy.get('[data-testid="email"]').type('email@teste.com');
        cy.get('[data-testid="entrar"]').click();

        cy.get('.alert').should('be.visible').and('contain', 'Password é obrigatório');

        cy.location('pathname').should('eq', '/login');
    });

    //Fim do describe
});

