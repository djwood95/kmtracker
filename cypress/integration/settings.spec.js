describe('Settings Page', () => {
    beforeEach(() => {
        cy.server();
        cy.route('GET', '/api/settings/getColorGroup', 'green').as('getColorGroup');
        cy.route('GET', '/api/getUsername', 'test user').as('getUsername');
    });

    describe('change password', () => {
        beforeEach(() => {
            cy.route('POST', '/api/settings/saveNewPass', {}).as('savePassword');
        });

        it('shows error if password is too short', () => {
            cy.visit('/#/settings');
            cy.get('#password1').type('x');
            cy.get('#password2').type('x');
            cy.get('#save-pass-button').click();
            cy.get('.toast.is-danger').contains('Password must be between 6 and 100 characters');
        });

        it('shows error if passwords do not match', () => {
            cy.visit('/#/settings');
            cy.get('#password1').type('test password1');
            cy.get('#password2').type('test password2');
            cy.get('#save-pass-button').click();
            cy.get('.toast.is-danger').contains('Passwords do not match');
        });

        it('shows error if there is a server error while saving', () => {
            cy.route({ method: 'POST', url: '/api/settings/saveNewPass', status: 500, response: '' }).as('savePassword');
            cy.visit('/#/settings');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('#save-pass-button').click();
            cy.wait('@savePassword');
            cy.get('.toast.is-danger').contains('Error saving password').should('be.visible');
        });

        it('can change password successfully', () => {
            cy.visit('/#/settings');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('#save-pass-button').click();
            cy.wait('@savePassword').its('requestBody').should('deep.equal', {
                newPass: 'test password'
            });
            cy.get('.toast.is-success').contains('New password saved!').should('be.visible');
            cy.get('#password1').should('have.value', '');
            cy.get('#password2').should('have.value', '');
        });

        it('can trigger save using enter key', () => {
            cy.visit('/#/settings');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password{enter}');
            cy.wait('@savePassword').its('requestBody').should('deep.equal', {
                newPass: 'test password'
            });
            cy.get('.toast.is-success').contains('New password saved!').should('be.visible');
            cy.get('#password1').should('have.value', '');
            cy.get('#password2').should('have.value', '');
        });
    });

    describe('change colorgroup', () => {
        beforeEach(() => {
            cy.route('POST', '/api/settings/saveColorGroup', {}).as('saveColorGroup');
        });

        it('loads colorgroup on pageload', () => {
            cy.visit('/#/settings');
            cy.wait('@getColorGroup');
            cy.get('#color-group').should('have.value', 'green');
            cy.get('#color-group').select('Blue');
            cy.get('#save-group-button').click();
        });

        it('shows error if there is a server error loading the color group', () => {
            cy.route({ method: 'GET', url: '/api/settings/getColorGroup', status: 500, response: '' }).as('getColorGroup');
            cy.visit('/#/settings');
            cy.wait('@getColorGroup');
            cy.get('.toast.is-danger').contains('Error loading color group').should('be.visible');
        });

        it('shows error if there is a server error saving the color group', () => {
            cy.route({ method: 'POST', url: '/api/settings/saveColorGroup', status: 500, response: '' }).as('saveColorGroup');
            cy.visit('/#/settings');
            cy.wait('@getColorGroup');
            cy.get('#save-group-button').click();
            cy.wait('@saveColorGroup');
            cy.get('.toast.is-danger').contains('Error saving color group').should('be.visible');
        });

        it('can change colorgroup successfully', () => {
            cy.visit('/#/settings');
            cy.wait('@getColorGroup');
            cy.get('#color-group').should('have.value', 'green');
            cy.get('#color-group').select('Blue');
            cy.get('#save-group-button').click();
            cy.wait('@saveColorGroup').its('requestBody').should('deep.equal', {
                colorgroup: 'blue'
            });
            cy.get('.toast.is-success').contains('New color group saved!').should('be.visible');
        });
    });
});