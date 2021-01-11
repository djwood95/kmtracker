describe('History Page', () => {
    beforeEach(() => {
        cy.clock(new Date('2021-01-01 12:00:00 EST').getTime(), ['Date']);
    });

    beforeEach(() => {
        cy.server();
        cy.route('GET', '/api/getUsername', 'test user').as('getUsername');
        cy.route('GET', '/api/history/2020-09-01/2021-06-01', 'fixture:pastEntries.json').as('getEntries');
    });

    it('loads this seasons entries by default', () => {
        cy.visit('/#/history');
        cy.wait('@getEntries');
        cy.get('tbody').find('tr').should('have.length', 2);

        cy.get('tbody tr').eq(0).within(() => {
            cy.get('td').eq(0).should('contain', 'Jan 1, 2021');
            cy.get('td').eq(1).should('contain', 'mtu');
            cy.get('td').eq(2).should('contain', '1.2');
            cy.get('td').eq(3).should('contain', 'skate');
            cy.get('td').eq(4).should('contain', 'test comment');
        });

        cy.get('tbody tr').eq(1).within(() => {
            cy.get('td').eq(0).should('contain', 'Jan 2, 2021');
            cy.get('td').eq(1).should('contain', 'swedetown');
            cy.get('td').eq(2).should('contain', '3.2');
            cy.get('td').eq(3).should('contain', 'classic');
            cy.get('td').eq(4).should('have.value', '');
        });

        cy.get('.has-text-centered').contains('Total Distance: 4.4 km');
    });

    it('shows error if there is a server error loading entries', () => {
        cy.route({ method: 'GET', url: '/api/history/2020-09-01/2021-06-01', status: 500, response: {} }).as('getEntries');
        cy.visit('/#/history');
        cy.wait('@getEntries');
        cy.get('.toast.is-danger').contains('Error loading history data').should('be.visible');
    });

    it('can switch to a previous season', () => {
        const entries = [
            { entryId: 1, distance: '1.2', system: 'mtu', date: '2020-01-01', technique: 'skate', comments: 'test' }
        ];
        cy.route('GET', '/api/history/2019-09-01/2020-06-01', entries).as('getEntriesLastYear');
        cy.visit('/#/history');
        cy.wait('@getEntries');
        cy.get('#season').select('2019-2020');
        cy.wait('@getEntriesLastYear');
        cy.get('tbody').find('tr').should('have.length', 1);
    });

    it('shows message if there are no entries to show', () => {
        cy.route('GET', '/api/history/2020-09-01/2021-06-01', []).as('getEntries');
        cy.visit('/#/history');
        cy.wait('@getEntries');
        cy.get('p').contains('Nothing here.').should('be.visible');
    });

    it('clicking edit navigates to edit page', () => {
        cy.route('GET', '/api/loadEntry/1', {});
        cy.route('GET', '/api/testLogin', {});
        cy.visit('/#/history');
        cy.wait('@getEntries');
        cy.get('tbody tr').eq(0).within(() => {
            cy.get('.button').contains('EDIT').click();
        });

        cy.url().should('equal', 'http://localhost:8080/#/newEntry/1');
    });

    describe('delete an entry', () => {
        it('can delete an entry', () => {
            cy.route('GET', '/api/deleteEntry/1', {}).as('deleteEntry');
            cy.visit('/#/history');
            cy.wait('@getEntries');
            cy.get('tbody tr').eq(0).within(() => {
                cy.get('.button').contains('DELETE').click();
            });

            cy.get('.modal.is-active').should('be.visible');
            cy.get('.modal-card-body').should('contain', 'If you press ok, this entry will be permanently deleted!');
            cy.get('.button').contains('OK').click();
            cy.wait('@deleteEntry');
            cy.get('.toast.is-success').contains('Entry deleted!').should('be.visible');
            cy.wait('@getEntries');
        });

        it('shows message if there is a server error', () => {
            cy.route({ method: 'GET', url: '/api/deleteEntry/1', status: 500, response: '' }).as('deleteEntry');
            cy.visit('/#/history');
            cy.wait('@getEntries');
            cy.get('tbody tr').eq(0).within(() => {
                cy.get('.button').contains('DELETE').click();
            });

            cy.get('.modal.is-active').should('be.visible');
            cy.get('.modal-card-body').should('contain', 'If you press ok, this entry will be permanently deleted!');
            cy.get('.button').contains('OK').click();
            cy.wait('@deleteEntry');
            cy.get('.toast.is-danger').contains('Error deleting entry').should('be.visible');
        });
    });
});