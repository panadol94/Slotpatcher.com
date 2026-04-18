describe('slotpatcher scan flow', () => {
  it('requires provider selection before scanning', () => {
    cy.visit('/');
    cy.contains('PILIH PROVIDER').should('exist');
    cy.get('#scanButton').click({ force: true });
    cy.contains('Sila pilih provider dulu sebelum mula scan.').should('exist');
  });

  it('can select provider and show results after scan', () => {
    cy.visit('/');
    cy.get('.provider-card').first().click();
    cy.get('#scanButtonLabel').should('contain.text', 'SCAN');
    cy.get('#scanButton').click({ force: true });
    cy.contains(/SCANNING/i, { timeout: 10000 }).should('exist');
    cy.get('#resultsSection', { timeout: 20000 }).should('be.visible');
    cy.get('#top3Section .top3-card').should('have.length.at.least', 1);
  });
});
