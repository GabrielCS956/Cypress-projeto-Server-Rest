import { faker } from '@faker-js/faker';

describe('Cadastro', () => {
    it('CD001 - Realizar um cadastro como administrador com sucesso', () => {
        //Comandos do faker para gerar dados aleatórios        
        const first = faker.name.firstName();
        const last = faker.name.lastName();
        const nome = `${first} ${last}`;
        const email = faker.internet.email(first, last);
        const senha = faker.internet.password(10);

        cy.visit('https://front.serverest.dev/cadastrarusuarios');

        //Intercepta a requisição de criação de usuário para aguardar sua conclusão        
        cy.intercept('POST', '**/usuarios').as('createUser');

        cy.get('[data-testid="nome"]').type(nome);
        cy.get('[data-testid="email"]').type(email);
        cy.get('[data-testid="password"]').type(senha);
        cy.get('[data-testid="checkbox"]').check();
        cy.get('[data-testid="cadastrar"]').click();

        //Valida se o cadastro foi realizado com sucesso pela mensagem exibida e se foi redirecionado para a página inicial do site
        cy.get('.alert-link').should('be.visible').and('contain', 'Cadastro realizado com sucesso');
        //Como há uma chamada assíncrona para criar o usuário, se fez necessário aguardar sua conclusão antes de validar o redirecionamento
        cy.wait('@createUser', { timeout: 10000 });
        cy.location('pathname').should('eq', '/admin/home');
    });

    it('CD002 - Realizar um cadastro como usuário comum com sucesso', () => {
        //Comandos do faker para gerar dados aleatórios        
        const first = faker.name.firstName();
        const last = faker.name.lastName();
        const nome = `${first} ${last}`;
        const email = faker.internet.email(first, last);
        const senha = faker.internet.password(10);

        cy.visit('https://front.serverest.dev/cadastrarusuarios');

        //Intercepta a requisição de criação de usuário para aguardar sua conclusão        
        cy.intercept('POST', '**/usuarios').as('createUser');

        cy.get('[data-testid="nome"]').type(nome);
        cy.get('[data-testid="email"]').type(email);
        cy.get('[data-testid="password"]').type(senha);
        cy.get('[data-testid="cadastrar"]').click();

        //Valida se o cadastro foi realizado com sucesso pela mensagem exibida e se foi redirecionado para a página inicial do site
        cy.get('.alert-link').should('be.visible').and('contain', 'Cadastro realizado com sucesso');
        //Como há uma chamada assíncrona para criar o usuário, se fez necessário aguardar sua conclusão antes de validar o redirecionamento
        cy.wait('@createUser', { timeout: 10000 });
        cy.location('pathname').should('eq', '/home');
    });

    it('CD003 - Validar mensagem de erro ao tentar cadastrar um usuário com email já existente', () => {
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
        cy.visit('https://front.serverest.dev/cadastrarusuarios');

        cy.get('[data-testid="nome"]').type(nome);
        cy.get('[data-testid="email"]').type(email);
        cy.get('[data-testid="password"]').type(senha);

        cy.intercept('POST', '**/usuarios').as('createUserDuplicate');
        cy.get('[data-testid="cadastrar"]').click();

        // Verifica a resposta da requisição — deve ser diferente de 201 (não criado)
        cy.wait('@createUserDuplicate').then((interception) => {
            const status = interception.response?.statusCode;
            expect(status).to.not.equal(201);
        });
        cy.get('.alert').should('be.visible').and('contain', 'Este email já está sendo usado');
        //Mensagem de erro não recomendada, pois revela os emails que estão cadastrados no sistema
    });




    //Fim do describe
});







