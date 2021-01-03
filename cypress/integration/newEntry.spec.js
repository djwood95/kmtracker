describe('New Entry Page', () => {
    beforeEach(() => {
        cy.clock(new Date('2021-01-01 12:00:00 EST').getTime(), ['Date']);
    });

    beforeEach(() => {
        cy.server();
        cy.route('GET', '/api/testLogin', []).as('testLogin');
        window.localStorage.setItem('loggedIn', 'true');
        window.localStorage.setItem('username', 'test user');
        window.onbeforeunload = null;
    });

    it('can navigate to New Entry page', () => {
        cy.visit('/#/home');
        cy.get('.navbar-item').contains('New Entry').click();
        cy.url().should('equal', 'http://localhost:8080/#/newEntry');
    });

    it('can switch between trail systems', () => {
        cy.visit('/#/newEntry');
        cy.get('#trail-system').select('mtu');
        cy.get('#trail-system-input').should('have.value', 'mtu');
        cy.get('.tabs').should('contain', 'Upper Trails');
        cy.get('.tabs').should('contain', 'Competition Trails');
        cy.get('.tabs').should('contain', 'Nara Trails');
        cy.get('.tabs').should('contain', 'Tolkien Trails');
        cy.get('.tabs').should('contain', 'Custom Trail');
        cy.get('.image').should('be.visible');
        cy.get('.column .trailButton').contains('Birch Loop').should('be.visible');

        cy.get('#trail-system').select('swedetown');
        cy.get('#trail-system-input').should('have.value', 'swedetown');
        cy.get('.tabs').should('contain', 'Main Trails');
        cy.get('.tabs').should('contain', 'Bear Trails');
        cy.get('.tabs').should('contain', 'Multi-Use Trails');
        cy.get('.tabs').should('contain', 'Custom Trail');
        cy.get('.image').should('be.visible');
        cy.get('.column .trailButton').contains('Valley Trail').should('be.visible');
    });

    it('can switch between trail category tabs', () => {
        cy.visit('/#/newEntry');
        cy.get('#trail-system').select('mtu');
        cy.get('.trailButton').contains('Birch Loop').should('be.visible');
        cy.get('li').contains('Nara Trails').click();
        cy.get('.image').should('be.visible');
        cy.get('.trailButton').contains('Down Under Loop').should('be.visible');
    });

    it('can add regular trail to list', () => {
        cy.visit('/#/newEntry');
        cy.get('#trail-system').select('mtu');
        cy.get('li').contains('Competition Trails').click();
        cy.get('b').contains('0 km').should('exist');
        cy.get('.trailButton').contains('Hairpin Loop').click();
        cy.get('b').contains('1.2 km').should('exist');
        cy.get('.trailButton').contains('Skidder Loop').click();
        cy.get('.trailsList').find('.trail-list-item').should('have.length', 2);
        cy.get('.trail-list-item').eq(0).within(() => {
            cy.get('.trailName').should('contain', 'Hairpin Loop');
            cy.get('.trailDist').should('contain', '1.2 km')
        });
        cy.get('.trail-list-item').eq(1).within(() => {
            cy.get('.trailName').should('contain', 'Skidder Loop');
            cy.get('.trailDist').should('contain', '1.7 km')
        });
        cy.get('b').contains('2.9 km').should('exist');
    });

    it('can delete trail from list', () => {
        cy.visit('/#/newEntry');
        cy.get('#trail-system').select('mtu');
        cy.get('li').contains('Competition Trails').click();
        cy.get('.trailButton').contains('Hairpin Loop').click();
        cy.get('.trailButton').contains('Skidder Loop').click();
        cy.get('b').contains('2.9 km').should('exist');
        cy.get('.trail-list-item').eq(1).within(() => {
            cy.get('.delete').click();
        });

        cy.get('.trailsList').find('.trail-list-item').should('have.length', 1);
        cy.get('b').contains('1.2 km').should('exist');
    });

    describe('custom trail', () => {
        beforeEach(() => {
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('li').contains('Custom Trail').click();
        });

        it('shows errors for invalid trail name/distance', () => {
            cy.get('.button').contains('Add Trail').click();
            cy.get('.notification.is-danger').contains('Custom trail name must be between 5 and 100 characters').should('be.visible');

            cy.get('#custom-trail-dist').clear().type('-10000');
            cy.get('.button').contains('Add Trail').click();
            cy.get('.notification.is-danger').should('be.visible');
            cy.get('.notification.is-danger').should('contain', 'Custom trail name must be between 5 and 100 characters');
            cy.get('.notification.is-danger').should('contain', 'Custom trail distance must be between -1000 and 1000 km');

            cy.get('#custom-trail-name').type('test trail');
            cy.get('.button').contains('Add Trail').click();
            cy.get('.notification.is-danger').should('be.visible');
            cy.get('.notification.is-danger').should('not.contain', 'Custom trail name must be between 5 and 100 characters');
            cy.get('.notification.is-danger').should('contain', 'Custom trail distance must be between -1000 and 1000 km');
        });

        it('can add custom trail to list', () => {
            cy.get('#custom-trail-name').type('test trail');
            cy.get('#custom-trail-dist').clear().type('10');
            cy.get('.button').contains('Add Trail').click();

            cy.get('.trailsList').find('.trail-list-item').should('have.length', 1);
            cy.get('.trail-list-item').eq(0).within(() => {
                cy.get('.trailName').should('contain', 'test trail');
                cy.get('.trailDist').should('contain', '10 km')
            });
            cy.get('b').contains('10 km').should('exist');

            cy.get('#custom-trail-name').should('have.value', '');
            cy.get('#custom-trail-dist').should('have.value', '0');
        });
    });

    describe('new entry submission', () => {
        beforeEach(() => {
            cy.route('POST', '/api/newEntry', {}).as('newEntry');
        });

        it('shows error when required fields are empty', () => {
            cy.visit('/#/newEntry');
            cy.get('.button').contains('Submit!').click();
            cy.get('.notification.is-danger').should('be.visible');
            cy.get('.notification.is-danger').should('contain', 'You must have at least one trail');
            cy.get('.notification.is-danger').should('contain', 'Technique is a required field');
            cy.get('.notification.is-danger').should('contain', 'Trail system must be between 1 and 100 characters');
        });

        it('shows error if there is a server error', () => {
            cy.route({ method: 'POST', url: '/api/newEntry', status: 500, response: {} }).as('newEntry');
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();
            cy.get('#technique').select('skate');
            cy.get('.button').contains('Submit!').click();
            cy.wait('@newEntry');
            cy.get('.toast.is-danger').contains('Error saving entry').should('be.visible');
        });

        it('has default date of today', () => {
            cy.visit('/#/newEntry');
            cy.get('#date-picker').should('have.value', '1/1/2021');
        });

        it('can submit new entry', () => {
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();
            cy.get('.trailButton').contains('Oak Loop').click();
            cy.get('#technique').select('skate');
            cy.get('#comments').type('test comment');
            cy.get('.button').contains('Submit!').click();
            cy.wait('@newEntry').its('requestBody').should('deep.equal', {
                entryId: -1,
                info: {
                    comments: 'test comment',
                    date: '2021-01-01T17:00:00.000Z',
                    date2: '2021-01-01',
                    system: 'mtu',
                    technique: 'skate'
                },
                trails: [
                    { name: 'Birch Loop', distance: 1.2, color: 'green' },
                    { name: 'Oak Loop', distance: 1.1, color: 'green' }
                ]
            });

            cy.url().should('equal', 'http://localhost:8080/#/leaderboard');
            cy.get('.toast.is-success').contains('Your entry has been saved!').should('be.visible');
        });
    });

    describe('new entry submission - mobile', () => {
        beforeEach(() => {
            cy.viewport('iphone-6');
            cy.route('POST', '/api/newEntry', {}).as('newEntry');
        });

        it('shows new entry submission bar at bottom', () => {
            cy.visit('/#/newEntry');
            cy.get('.button').contains('0 Trails Added (0 km) - tap to submit').should('be.visible');

            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();
            cy.get('.trailButton').contains('Oak Loop').click();
            cy.get('.button').contains('2 Trails Added (2.3 km) - tap to submit').should('be.visible');
        });

        it('can click on the bar to view entry details', () => {
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();
            cy.get('.trailButton').contains('Oak Loop').click();
            cy.get('.button').contains('2 Trails Added (2.3 km) - tap to submit').click();
            cy.get('.modal.is-active').should('be.visible');
            cy.get('.trailsList').find('.trail-list-item').should('have.length', 2);
            cy.get('b').contains('2.3 km').should('exist');
        });

        it('shows errors', () => {
            cy.visit('/#/newEntry');
            cy.get('.button').contains('0 Trails Added (0 km) - tap to submit').click();
            cy.get('.modal.is-active').should('be.visible');
            cy.get('.button').contains('Submit!').click();
            cy.get('.notification.is-danger').should('be.visible');
        });

        it('can submit new entry', () => {
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();
            cy.get('.trailButton').contains('Oak Loop').click();
            cy.get('.button').contains('2 Trails Added (2.3 km) - tap to submit').click();
            cy.get('.modal.is-active').should('be.visible');
            cy.get('#technique').select('classic');
            cy.get('.button').contains('Submit!').click();
            cy.wait('@newEntry').its('requestBody').should('deep.equal', {
                entryId: -1,
                info: {
                    comments: '',
                    date: '2021-01-01T17:00:00.000Z',
                    date2: '2021-01-01',
                    system: 'mtu',
                    technique: 'classic'
                },
                trails: [
                    { name: 'Birch Loop', distance: 1.2, color: 'green' },
                    { name: 'Oak Loop', distance: 1.1, color: 'green' }
                ]
            });

            cy.url().should('equal', 'http://localhost:8080/#/leaderboard');
            cy.get('.toast.is-success').contains('Your entry has been saved!').should('be.visible');
            cy.get('.modal.is-active').should('not.exist');
        });
    });

    describe('unsaved changes warning', () => {
        it('does not show warning if there are no changes', () => {
            cy.visit('/#/newEntry');
            cy.get('.navbar-item').contains('Home').click();
            cy.url().should('equal', 'http://localhost:8080/#/home');
        });

        it('shows warning after adding trails', () => {
            cy.visit('/#/newEntry');
            cy.get('#trail-system').select('mtu');
            cy.get('.trailButton').contains('Birch Loop').click();

            cy.get('.navbar-item').contains('Home').click();
            cy.get('.modal.is-active').should('be.visible');
            cy.get('.modal-card-title').should('contain', 'Are you sure?');
            cy.get('.modal-card-body').should('contain', 'If you leave this page, your entry will not be saved.');
            cy.get('.button').contains('Cancel').click();
            cy.url().should('equal', 'http://localhost:8080/#/newEntry');

            cy.get('.navbar-item').contains('Home').click();
            cy.get('.modal.is-active').should('be.visible');
            cy.get('.button').contains('OK').click();
            cy.url().should('equal', 'http://localhost:8080/#/home');
        });

        it('shows warning after submit details are changed', () => {
            cy.visit('/#/newEntry');
            cy.get('#comments').type('test');
            cy.get('.navbar-item').contains('Home').click();
            cy.get('.modal-card-title').should('contain', 'Are you sure?');
            cy.get('.modal-card-body').should('contain', 'If you leave this page, your entry will not be saved.');
        });
    });

    describe('Edit existing entry', () => {
        beforeEach(() => {
            const testEntry = {
                date: '2021-01-02',
                system: 'mtu',
                technique: 'skate',
                comments: 'test comment',
                trailsList: [
                    { name: 'Birch Loop', distance: '1.2' },
                    { name: 'Oak Loop', distance: '1.1' }
                ]
            };
            cy.route('GET', '/api/loadEntry/1', testEntry).as('loadEntry');
        });

        it.only('can load existing entry', () => {
            cy.visit('/#/newEntry/1');
            cy.wait('@loadEntry');
            cy.get('#date-picker').should('have.value', '1/2/2021');
            cy.get('#technique').should('have.value', 'skate');
            cy.get('#trail-system').should('have.value', 'mtu');
            cy.get('.trailsList').find('.trail-list-item').should('have.length', 2);
            cy.get('.trail-list-item').eq(0).within(() => {
                cy.get('.trailName').should('contain', 'Birch Loop');
                cy.get('.trailDist').should('contain', '1.2 km')
            });
            cy.get('.trail-list-item').eq(1).within(() => {
                cy.get('.trailName').should('contain', 'Oak Loop');
                cy.get('.trailDist').should('contain', '1.1 km')
            });
            cy.get('b').contains('2.3 km').should('exist');
            });
    });
});