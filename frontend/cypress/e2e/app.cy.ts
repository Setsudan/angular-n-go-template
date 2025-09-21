describe('Angular App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display welcome message', () => {
    cy.contains('Hello, frontend!').should('be.visible');
  });

  it('should have proper page title', () => {
    cy.title().should('not.be.empty');
  });

  it('should be responsive', () => {
    cy.viewport(320, 568);
    cy.get('body').should('be.visible');
    
    cy.viewport(768, 1024);
    cy.get('body').should('be.visible');
    
    cy.viewport(1920, 1080);
    cy.get('body').should('be.visible');
  });
});

