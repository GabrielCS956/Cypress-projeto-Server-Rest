
describe('Teste de login', () => {
    it('Realizar um login com sucesso', () => {
        cy.visit('https://front.serverest.dev/login');
        cy.get('[data-testid="email"]').type('');
        cy.get('[data-testid="senha"]').type('');
    });
});

