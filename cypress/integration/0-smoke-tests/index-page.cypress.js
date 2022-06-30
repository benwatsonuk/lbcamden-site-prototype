specify('index page', () => {
  cy.visit('/')
  cy.contains('CAMDEN.GOV.UK redesign prototypes')
})
