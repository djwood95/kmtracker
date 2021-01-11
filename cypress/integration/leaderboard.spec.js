describe('Leaderboard page', () => {
    beforeEach(() => {
        cy.clock(new Date('2021-01-01 12:00:00 EST').getTime(), ['Date']);
    });

    beforeEach(() => {
        cy.server();
        const leaderboard = {
            list: [
                { username: 'person 1', kms: 25, lastUpdate: '12/27', colorgroup: 'parent', place: 1 },
                { username: 'person 2', kms: 15, lastUpdate: '12/28', colorgroup: 'red', place: 2 },
                { username: 'person 3', kms: 10, lastUpdate: '12/29', colorgroup: 'red', place: 3 }
            ],
            total: 50
        }
        cy.route('GET', '/leaderboard', leaderboard).as('getLeaderboard');
    });

    it('can navigate to leaderboard page (logged out)', () => {
        cy.route({ method: 'GET', url: '/api/getUsername', status: 401, response: {} }).as('getUsername');
        cy.visit('/#/home');
        cy.wait('@getUsername');
        cy.get('.navbar-item').contains('Leaderboard').click();
        cy.url().should('equal', 'http://localhost:8080/#/leaderboard');
    });

    it('can navigate to leaderboard page (logged in)', () => {
        cy.route({ method: 'GET', url: '/api/getUsername', status: 200, response: 'test user' }).as('getUsername');
        cy.visit('/#/home');
        cy.wait('@getUsername');
        cy.get('.navbar-item').contains('Leaderboard').click();
        cy.url().should('equal', 'http://localhost:8080/#/leaderboard');
    });

    it('shows bars and info correctly', () => {
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('.button').contains('KMTracker.org').should('not.exist');
        cy.get('tbody').find('tr').should('have.length', 3);

        cy.get('tbody tr').eq(0).within(() => {
            cy.get('td').eq(0).should('contain', 1);
            cy.get('td').eq(1).should('contain', 'person 1');
            cy.get('td').eq(2).should('contain', 'parent');
            cy.get('td').eq(3).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 100%');
            });
            cy.get('td').eq(4).within(() => {
                cy.get('span').eq(0).should('contain', '25 km');
                cy.get('span').eq(1).should('contain', '(12/27)');
            });
        });

        cy.get('tbody tr').eq(1).within(() => {
            cy.get('td').eq(0).should('contain', 2);
            cy.get('td').eq(1).should('contain', 'person 2');
            cy.get('td').eq(2).should('contain', 'red');
            cy.get('td').eq(3).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 60%');
            });
            cy.get('td').eq(4).within(() => {
                cy.get('span').eq(0).should('contain', '15 km');
                cy.get('span').eq(1).should('contain', '(12/28)');
            });
        });

        cy.get('tbody tr').eq(2).within(() => {
            cy.get('td').eq(0).should('contain', 3);
            cy.get('td').eq(1).should('contain', 'person 3');
            cy.get('td').eq(2).should('contain', 'red');
            cy.get('td').eq(3).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 40%');
            });
            cy.get('td').eq(4).within(() => {
                cy.get('span').eq(0).should('contain', '10 km');
                cy.get('span').eq(1).should('contain', '(12/29)');
            });
        });

        cy.get('.has-text-right').contains('Total: 50 km').should('be.visible');
    });

    it('sends a new request to the server when the dates change', () => {
        cy.route('GET', '/leaderboard/2021-01-03/2021-01-07', {}).as('getLeaderboardCustomDates');
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('#go-button').should('be.disabled');
        cy.get('#start-date').click();
        cy.get('#start-date-field').within(() => {
            cy.get('.datepicker-cell.is-selectable').contains('3').click();
        });
        cy.get('#end-date').click();
        cy.get('#end-date-field').within(() => {
            cy.get('.datepicker-cell.is-selectable').contains('7').click();
        });
        cy.get('#go-button').should('not.be.disabled');
        cy.get('#go-button').click();
        cy.wait('@getLeaderboardCustomDates');
    });

    it('sends a new request to the server when new tab is selected', () => {
        const leaderboard = {
            list: [
                { username: 'person 1', kms: 25, lastUpdate: '12/27', colorgroup: 'parent', place: 1 },
                { username: 'person 2', kms: 15, lastUpdate: '12/28', colorgroup: 'red', place: 2 },
                { username: 'person 3', kms: 10, lastUpdate: '12/29', colorgroup: 'red', place: 3 }
            ],
            total: 50
        }
        cy.route('GET', '/leaderboard/2020-12-25/2021-01-01', leaderboard).as('getWeeklyLeaderboard');
        cy.route('GET', '/leaderboard/lifetime', leaderboard).as('getLifetimeLeaderboard');
        cy.route('GET', '/leaderboard/allSeasons', leaderboard).as('getAllSeasonsLeaderboard');
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('.button').contains('This Week').click();
        cy.wait('@getWeeklyLeaderboard');
        cy.get('.button').contains('Lifetime').click();
        cy.wait('@getLifetimeLeaderboard');
        cy.get('.button').contains('All Seasons').click();
        cy.wait('@getAllSeasonsLeaderboard');
    });

    it('dates fields are disabled when lifetime/all seasons selected', () => {
        cy.route('GET', '/leaderboard/lifetime', {}).as('getLifetimeLeaderboard');
        cy.route('GET', '/leaderboard/allSeasons', {}).as('getAllSeasonsLeaderboard');
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('#start-date').should('not.be.disabled');
        cy.get('#end-date').should('not.be.disabled');

        cy.get('.button').contains('This Week').click();
        cy.get('#start-date').should('not.be.disabled');
        cy.get('#end-date').should('not.be.disabled');

        cy.get('.button').contains('Lifetime').click();
        cy.get('#start-date').should('be.disabled');
        cy.get('#end-date').should('be.disabled');

        cy.get('.button').contains('All Seasons').click();
        cy.get('#start-date').should('be.disabled');
        cy.get('#end-date').should('be.disabled');
    });

    it('can filter by group', () => {
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('#group-filter').select('red');

        cy.get('tbody').find('tr').should('have.length', 2);

        cy.get('tbody tr').eq(0).within(() => {
            cy.get('td').eq(0).should('contain', 2);
            cy.get('td').eq(1).should('contain', 'person 2');
            cy.get('td').eq(2).should('contain', 'red');
            cy.get('td').eq(3).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 100%');
            });
            cy.get('td').eq(4).within(() => {
                cy.get('span').eq(0).should('contain', '15 km');
                cy.get('span').eq(1).should('contain', '(12/28)');
            });
        });

        cy.get('tbody tr').eq(1).within(() => {
            cy.get('td').eq(0).should('contain', 3);
            cy.get('td').eq(1).should('contain', 'person 3');
            cy.get('td').eq(2).should('contain', 'red');
            cy.get('td').eq(3).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 60%');
            });
            cy.get('td').eq(4).within(() => {
                cy.get('span').eq(0).should('contain', '10 km');
                cy.get('span').eq(1).should('contain', '(12/29)');
            });
        });

        cy.get('.has-text-right').contains('Total: 25 km').should('be.visible');
    });

    it('can navigate to/from group standings', () => {
        const groupStandings = {
            list: [
                { place: 1, colorgroup: 'parent', kms: 25 },
                { place: 2, colorgroup: 'red', kms: 15 },
                { place: 3, colorgroup: 'yellow', kms: 10 }
            ]
        };
        cy.route('GET', '/leaderboard/groupStandings', groupStandings).as('getGroupStandings');
        cy.visit('/#/leaderboard');
        cy.wait('@getLeaderboard');
        cy.get('.button').contains('Group Standings').click();
        cy.wait('@getGroupStandings');
        cy.get('tbody').find('tr').should('have.length', 3);

        cy.get('tbody tr').eq(0).within(() => {
            cy.get('td').eq(0).should('contain', 'parent');
            cy.get('td').eq(1).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 100%');
            });
            cy.get('td').eq(2).should('contain', '25 km');
        });

        cy.get('tbody tr').eq(1).within(() => {
            cy.get('td').eq(0).should('contain', 'red');
            cy.get('td').eq(1).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 60%');
            });
            cy.get('td').eq(2).should('contain', '15 km');
        });

        cy.get('tbody tr').eq(2).within(() => {
            cy.get('td').eq(0).should('contain', 'yellow');
            cy.get('td').eq(1).within(() => {
                cy.get('#progressBar').should('have.attr', 'style').and('include', 'width: 40%');
            });
            cy.get('td').eq(2).should('contain', '10 km');
        });

    });

    it('correctly shows leaderboard with no header', () => {
        cy.visit('/#/leaderboard/noHeader');
        cy.wait('@getLeaderboard');
        cy.get('.navbar').should('not.exist');
        cy.get('#leaderboardSettings').should('not.exist');
        cy.get('.button').contains('KMTracker.org').should('be.visible');
    });

    describe('error messages', () => {
        it('shows message if there is a leaderboard server error', () => {
            cy.route({ method: 'GET', url: '/leaderboard', status: 500, response: '' }).as('getLeaderboard');
            cy.visit('/#/leaderboard');
            cy.wait('@getLeaderboard');
            cy.get('.toast.is-danger').contains('Error loading leaderboard').should('be.visible');
        });

        it('shows message if there is a lifetime leaderboard server error', () => {
            cy.route({ method: 'GET', url: '/leaderboard/lifetime', status: 500, response: '' }).as('getLifetimeLeaderboard');
            cy.visit('/#/leaderboard');
            cy.wait('@getLeaderboard');
            cy.get('.toast.is-danger').should('not.exist');
            cy.get('.button').contains('Lifetime').click();
            cy.wait('@getLifetimeLeaderboard');
            cy.get('.toast.is-danger').contains('Error loading leaderboard').should('be.visible');
        });

        it('shows message if there is an all seasons leaderboard server error', () => {
            cy.route({ method: 'GET', url: '/leaderboard/allSeasons', status: 500, response: '' }).as('getAllSeasonsLeaderboard');
            cy.visit('/#/leaderboard');
            cy.wait('@getLeaderboard');
            cy.get('.toast.is-danger').should('not.exist');
            cy.get('.button').contains('All Seasons').click();
            cy.wait('@getAllSeasonsLeaderboard');
            cy.get('.toast.is-danger').should('be.visible');
        });

        it('shows message if there is a group standings server error', () => {
            cy.route({ method: 'GET', url: '/leaderboard/groupStandings', status: 500, response: '' }).as('getGroupStandings');
            cy.visit('/#/leaderboard');
            cy.wait('@getLeaderboard');
            cy.get('.toast.is-danger').should('not.exist');
            cy.get('.button').contains('Group Standings').click();
            cy.wait('@getGroupStandings');
            cy.get('.toast.is-danger').contains('Error loading group standings').should('be.visible');
        });
    });
});