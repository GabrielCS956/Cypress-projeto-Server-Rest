import { faker } from '@faker-js/faker';
describe('Fluxo completo de cadastro e login', () => {
    it('FC001 - Fluxo combinado: Cadastro, login e logout com usuário administrador', () => {
        cy.cadastroAdm().then(({ nome, email, senha }) => {
            // usar os dados retornados para login (não retorna a senha por questão de segurança)
            cy.log('Criado:', nome, email);

            cy.visit('https://front.serverest.dev/login');

            cy.get('[data-testid="email"]').type(email);
            cy.get('[data-testid="senha"]').type(senha);
            cy.get('[data-testid="entrar"]').click();

            cy.location('pathname').should('eq', '/admin/home');

            // Realizar logout
            cy.get('[data-testid="logout"]').click();

            cy.location('pathname').should('eq', '/login');
        });
    });

    it('FC002 - Fluxo combinado: Cadastro, login e logout com usuário comum', () => {
        cy.cadastro().then(({ nome, email, senha }) => {
            // usar os dados retornados para login (não retorna a senha por questão de segurança)
            cy.log('Criado:', nome, email);

            cy.visit('https://front.serverest.dev/login');

            cy.get('[data-testid="email"]').type(email);
            cy.get('[data-testid="senha"]').type(senha);
            cy.get('[data-testid="entrar"]').click();

            cy.location('pathname').should('eq', '/home');

            // Realizar logout
            cy.get('[data-testid="logout"]').click();

            cy.location('pathname').should('eq', '/login');
        });
    });
});


describe('Segurança - rotas protegidas', () => {

    // cria usuário uma vez e guarda sessão
    before(() => {
        const first = faker.name.firstName();
        const last = faker.name.lastName();
        const email = faker.internet.email(first, last);
        const senha = faker.internet.password(10);

        // retorna a chain completa: createUserApi -> cy.session (que por sua vez retorna a chain do loginApi)
        return cy.createUserApi(email, senha, { administrador: "false" }).then(user => {
            return cy.session(['user', user.email], () => {
                // retorne a chain do loginApi (não retorne objetos síncronos)
                return cy.loginApi(user.email, user.password).then(() => {
                    cy.visit('https://front.serverest.dev/home');
                    cy.location('pathname').should('eq', '/login');
                });
            });
        });
    });

    it('SEC001 - Tentativa de acesso com usuário comum deslogado', function () {
        // primeiro garante logout (remove token)
        cy.visit('https://front.serverest.dev/login');
        cy.window().then(win => win.localStorage.removeItem('token'));

        // tentativa direta de acesso -> deve redirecionar para /login
        cy.visit('https://front.serverest.dev/home', { failOnStatusCode: false });
        cy.location('pathname').should('eq', '/login');

        // valida que token não existe
        cy.window().then(win => expect(win.localStorage.getItem('token')).to.be.null);
    });

    it('SC002 - Tentativa de acesso com usuário administrador deslogado', () => {
        cy.visit('https://front.serverest.dev/admin/home', { failOnStatusCode: false });
        cy.location('pathname').should('eq', '/login');
    });

    it('SC003 - Acesso direto a API protegida sem token ', () => {
        // exemplo de requisição direta a um endpoint protegido
        cy.request({
            method: 'GET',
            url: 'https://serverest.dev/produtos', // ajuste para endpoint protegido real
            failOnStatusCode: false
        }).then(resp => {
            expect([401, 403]).to.include(resp.status);
        });
    });

    it('SC004 -Realizar logout e revogar acesso', () => {
        // cria e loga via API
        cy.createUserApi().then(u => {
            cy.loginApi(u.email, u.password).then(() => {
                // garante que está logado na UI
                cy.visit('https://front.serverest.dev/home');
                cy.location('pathname').should('eq', '/login');

                // intercepta chamadas que só devem ocorrer autenticadas
                cy.intercept('GET', '**/pedidos').as('protectedCall');

                // logout via UI
                cy.get('[data-testid="logout"]').click();
                cy.location('pathname').should('eq', '/login');

                // força uma ação que a UI faria (ex: visitar /home) para checar se a chamada protegida é bloqueada
                cy.visit('https://front.serverest.dev/home', { failOnStatusCode: false });

                // não deve haver chamadas protegidas autenticadas
                cy.get('@protectedCall.all').should('have.length', 0);

                // garante token removido
                cy.window().then(win => expect(win.localStorage.getItem('token')).to.be.null);
            });
        });
    });

});
