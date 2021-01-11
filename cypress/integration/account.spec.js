describe('Login', () => {
    beforeEach(() => {
        cy.server();
        cy.route({
            method: 'GET',
            url: '/api/getUsername',
            status: 401,
            response: []
        }).as('getUsername');

        cy.route({
            method: 'POST',
            url: '/checkLogin',
            status: 401,
            response: []
        }).as('checkLogin');
    });

    it('shows error message for incorrect username/password', () => {
        cy.visit('/home');
        cy.get('#username').type('xxx');
        cy.get('#password').type('xxx');
        cy.get('#login-btn').click();
        cy.wait('@checkLogin');
        cy.get('.notification.is-danger').contains('Incorrect username or password').should('be.visible');
    });

    it('checks login on page load (logged out)', () => {
        cy.visit('/home');
        cy.wait('@getUsername');
        cy.get('.sidebarHeader').contains('Login').should('be.visible');
        cy.get('#username').should('be.visible');
        cy.get('#password').should('be.visible');
        cy.contains('.navbar-item', 'New Entry').should('not.exist');
    });

    it('checks login on page load (logged in)', () => {
        window.localStorage.setItem('authToken', 'xxx');
        cy.route({ method: 'GET', url: '/api/getUsername', status: 200, response: { username: 'test user' } }).as('getUsername');

        cy.visit('/home');
        cy.wait('@getUsername');
        cy.get('.navbar-item').contains('New Entry').should('be.visible');
        cy.get('.navbar-item').contains('test user').should('be.visible');
        cy.get('.sidebarHeader').contains('Login').should('not.exist');
        cy.get('#username').should('not.exist');
        cy.get('#password').should('not.exist');
    });

    it('can login with correct username/password', () => {
        const response = {
            success: true,
            token: { expires: 0, token: 'xxx' },
            username: 'test user'
        };
        cy.route({ method: 'POST', url: '/checkLogin', status: 200, response }).as('checkLogin');
        cy.visit('/home');
        cy.contains('.navbar-item', 'New Entry').should('not.exist');
        cy.get('#username').type('xxx');
        cy.get('#password').type('xxx');
        cy.get('#login-btn').click();
        cy.wait('@checkLogin');
        cy.contains('.navbar-item', 'New Entry').should('be.visible');
        cy.get('.navbar-item').contains('New Entry').should('be.visible');
        cy.get('.navbar-item').contains('test user').should('be.visible');
        cy.get('.sidebarHeader').contains('Login').should('not.exist');
        cy.get('#username').should('not.exist');
        cy.get('#password').should('not.exist');
    });

    describe('mobile login', () => {
        const devices = ['iphone-6', 'ipad-2'];
        devices.forEach((device) => {
            describe(device, () => {
                beforeEach(() => {
                    cy.viewport(device);
                });
        
                it('shows error for incorrect login info', () => {
                    cy.visit('/home');
                    cy.get('.button').contains('Login').click();
                    cy.get('.modal.is-active').should('be.visible');
                    cy.get('.modal-card-title').should('contain', 'Login');
                    cy.get('.modal-card-body').within(() => {
                        cy.get('#username').type('xxx');
                        cy.get('#password').type('xxx');
                    });
        
                    cy.get('.modal-card-foot .button').contains('Login').click();
                    cy.wait('@checkLogin');
                    cy.get('.modal-card-body .notification.is-danger').contains('Incorrect username or password').should('be.visible');
                    cy.get('.modal-card-foot .button').contains('Close').click();
                    cy.get('modal.is-active').should('not.exist');
                    cy.get('.navbar-item').contains('New Entry').should('not.exist');
                    cy.get('.navbar-burger').should('not.exist');
                });
        
                it('can login with correct info', () => {
                    const response = {
                        success: true,
                        token: { expires: 0, token: 'xxx' },
                        username: 'test user'
                    };
                    cy.route({ method: 'POST', url: '/checkLogin', status: 200, response }).as('checkLogin');
                    cy.visit('/home');
        
                    cy.get('.button').contains('Login').click();
                    cy.get('.modal.is-active').should('be.visible');
                    cy.get('.modal-card-title').should('contain', 'Login');
                    cy.get('.modal-card-body').within(() => {
                        cy.get('#username').type('xxx');
                        cy.get('#password').type('xxx');
                    });
                    
                    cy.get('.modal-card-foot .button').contains('Login').click();
                    cy.wait('@checkLogin');
                    cy.get('.modal.is-active').should('not.exist');
                    cy.get('.navbar-item').contains('New Entry').should('be.visible');
                    cy.get('.navbar-burger').should('be.visible');
                });
            });
        });
    });

    it('can logout', () => {
        window.localStorage.setItem('loggedIn', 'true');
        window.localStorage.setItem('username', 'test user');
        cy.route({ method: 'GET', url: '/api/getUsername', status: 200, response: 'test user' }).as('getUsername');
        cy.visit('/home');
        cy.wait('@getUsername');
        cy.get('.navbar-item').contains('New Entry').should('be.visible');
        cy.get('.navbar-item').contains('test user').should('be.visible');
        cy.get('.navbar-item').contains('Logout').click({ force: true });
        cy.get('.navbar-item').contains('New Entry').should('not.exist');
        cy.get('.navbar-item').contains('test user').should('not.exist');
    });

    it('logout from protected page', () => {
        window.localStorage.setItem('loggedIn', 'true');
        window.localStorage.setItem('username', 'test user');
        cy.route({ method: 'GET', url: '/api/getUsername', status: 200, response: 'test user' }).as('getUsername');
        cy.visit('/#/newEntry');
        cy.wait('@getUsername');
        cy.get('.navbar-item').contains('Logout').click({ force: true });
        cy.url().should('not.include', '/newEntry');
    });
});

describe('New Account', () => {
    beforeEach(() => {
        cy.server();
        cy.route('POST', '/usernameExists', { usernameExists: false }).as('usernameExists');
    });

    it('can navigate to New Account page', () => {
        cy.visit('/#/home');
        cy.get('.button').contains('New Account').click();
        cy.get('h2').contains('New Account').should('be.visible');
    });

    describe('username checks', () => {
        it('shows error message if username is taken', () => {
            cy.route('POST', '/usernameExists', { usernameExists: true }).as('usernameExists');
            cy.visit('/#/newAccount');
            cy.get('#username').should('not.have.class', 'is-danger');
            cy.get('#username').should('not.have.class', 'is-success');
            cy.get('#username').type('xxx');
            cy.get('#username').blur();
            cy.wait('@usernameExists');
            cy.get('#username').should('have.class', 'is-danger');
            cy.get('p').contains('This username has already been taken!').should('be.visible');
            cy.get('#password1').type('xxxxxxx');
            cy.get('#password2').type('xxxxxxx');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Create Account').click();
            cy.get('.notification.is-danger').contains('This username has already been taken!').should('be.visible');
        });

        it('shows success message if username is valid', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').should('not.have.class', 'is-danger');
            cy.get('#username').should('not.have.class', 'is-success');
            cy.get('#username').type('xxxx');
            cy.get('#username').blur();
            cy.wait('@usernameExists');
            cy.get('#username').should('have.class', 'is-success');
            cy.get('p').contains('This username has already been taken!').should('not.exist');
        });

        it('shows error message if username is too short or too long', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').should('not.have.class', 'is-danger');
            cy.get('#username').should('not.have.class', 'is-success');
            cy.get('#username').type('xxx');
            cy.get('#username').blur();
            cy.wait('@usernameExists');
            cy.get('#username').should('have.class', 'is-danger');
            cy.get('p').contains('Username is required and must be between 4 and 15 characters').should('be.visible');
            cy.get('#password1').type('xxxxxxx');
            cy.get('#password2').type('xxxxxxx');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Create Account').click();
            cy.get('.notification.is-danger').contains('Username is required and must be between 4 and 15 characters').should('be.visible');
        });
    });

    describe('password checks', () => {
        it('shows error if password is too short/too long', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').type('xxxx');
            cy.get('#password1').type('x');
            cy.get('#password2').type('x');
            cy.get('#password1').should('have.class', 'is-danger');
            cy.get('#password2').should('have.class', 'is-danger');
            cy.get('p').contains('Password is required and must be between 6 and 100 characters').should('be.visible');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Create Account').click();
            cy.get('.notification.is-danger').contains('Password is required and must be between 6 and 100 characters').should('be.visible');
        });

        it('shows error if passwords do not match', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').type('xxxx');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password2');
            cy.get('#password1').should('have.class', 'is-danger');
            cy.get('#password2').should('have.class', 'is-danger');
            cy.get('p').contains('Passwords do not match!').should('be.visible');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Create Account').click();
            cy.get('.notification.is-danger').contains('Passwords do not match!').should('be.visible');
        });

        it('shows success status if password is valid', () => {
            cy.visit('/#/newAccount');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('#password1').should('have.class', 'is-success');
            cy.get('#password2').should('have.class', 'is-success');
            cy.get('p').contains('Passwords do not match!').should('not.exist');
        });
    });

    describe('email checks', () => {
        it('shows error if email is missing', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').type('test user');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('.button').contains('Create Account').click();
            cy.get('#email').focus();
            cy.get('#email').blur();
            cy.get('#email').should('have.class', 'is-danger');
        });

        it('shows error if email if invalid', () => {
            cy.visit('/#/newAccount');
            cy.get('#username').type('test user');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('.button').contains('Create Account').click();
            cy.get('#email').type('xxx');
            cy.get('#email').blur();
            cy.get('#email').should('have.class', 'is-danger');
        });
    });

    it('can handle all the errors at once', () => {
        cy.visit('/#/newAccount');
        cy.get('#username').type('x');
        cy.get('#password1').type('x');
        cy.get('#password2').type('xx');
        cy.get('#email').type('test@test.com');
        cy.get('.button').contains('Create Account').click();
        cy.get('.notification.is-danger').should('be.visible');
        cy.get('.notification.is-danger').should('contain', 'Password is required and must be between 6 and 100 characters');
        cy.get('.notification.is-danger').should('contain', 'Username is required and must be between 4 and 15 characters');
    });

    it('can create a new account', () => {
        cy.route('POST', '/newAccount', {}).as('newAccount');
        cy.visit('/#/newAccount');
        cy.get('#username').type('test user');
        cy.get('#password1').type('test password');
        cy.get('#password2').type('test password');
        cy.get('#email').type('test@test.com');
        cy.get('#colorGroup').select('Green');
        cy.get('.button').contains('Create Account').click();
        cy.wait('@newAccount').its('requestBody').should('deep.equal', {
            info: {
                username: 'test user',
                password1: 'test password',
                password2: 'test password',
                email: 'test@test.com',
                selectedGroup: 'green'
            }
        });
        cy.get('.toast.is-success').contains('Your account was created!').should('be.visible');
        cy.url().should('equal', 'http://localhost:8080/#/');
    });

    it('shows error toast message if there is a server error', () => {
        cy.route({ method: 'POST', url: '/newAccount', status: 500, response: {} }).as('newAccount');
        cy.visit('/#/newAccount');
        cy.get('#username').type('test user');
        cy.get('#password1').type('test password');
        cy.get('#password2').type('test password');
        cy.get('#email').type('test@test.com');
        cy.get('#colorGroup').select('Green');
        cy.get('.button').contains('Create Account').click();
        cy.wait('@newAccount');
        cy.get('.toast.is-danger').contains('Sorry, there was an error creating your account. Please try again.').should('be.visible');
        cy.url().should('equal', 'http://localhost:8080/#/newAccount');
    });

    it('can cancel creating new account', () => {
        cy.visit('/#/newAccount');
        cy.get('.button').contains('Cancel').click();
        cy.url().should('equal', 'http://localhost:8080/#/');
    })
});

describe('Forgot Password', () => {
    beforeEach(() => {
        cy.server();
        cy.route('POST', '/resetPass/checkEmail', { userId: 1 }).as('checkEmail');
    });

    describe('page load', () => {
        it('can navigate to forgot password page', () => {
            cy.visit('/#/');
            cy.get('.button').contains('Forgot Password').click();
            cy.url().should('equal', 'http://localhost:8080/#/forgotPassword');
        });
    
        it('can cancel forgot password', () => {
            cy.visit('/#/forgotPassword');
            cy.get('.button').contains('Cancel').click();
            cy.url().should('equal', 'http://localhost:8080/#/');
        });
    });

    describe('step 1: username and email', () => {
        it('shows error if username/email combo is incorrect', () => {
            cy.route({ method: 'POST', url: '/resetPass/checkEmail', status: 500, response: {} }).as('checkEmail');
            cy.visit('/#/forgotPassword');
            cy.get('#username').type('test user');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkEmail');
            cy.get('.notification.is-danger').contains('Username/email not found. Please try again.').should('be.visible');
        });
    
        it('shows success message and new page if username/email combo matches', () => {
            cy.visit('/#/forgotPassword');
            cy.get('#username').type('test user');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkEmail');
            cy.get('.notification.is-success').contains('Success! You should receive an email with a password reset code.').should('be.visible');
            cy.get('h3').contains('A reset code has been emailed to test@test.com. Please enter it below to continue.').should('be.visible');
        });
    });

    describe('step 2: reset code', () => {
        beforeEach(() => {
            cy.visit('/#/forgotPassword');
            cy.get('#username').type('test user');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkEmail');
        });

        it('shows success message if code is correct', () => {
            cy.route('POST', '/resetPass/checkCode', {}).as('checkCode');
            cy.get('#code').type('xxx');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkCode');
            cy.get('.notification.is-success').contains('Success! You can now enter a new password.');
        });

        it('shows error if code does not match', () => {
            cy.route({ method: 'POST', url: '/resetPass/checkCode', status: 500, response: {} }).as('checkCode');
            cy.get('#code').type('xxx');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkCode');
            cy.get('.notification.is-danger').contains('Error: The code did not match or was expired.');
        });

        it('can resent reset email', () => {
            cy.get('#code').type('xxx');
            cy.get('.button').contains('Resend Email').click();
            cy.wait('@checkEmail');
            cy.get('.notification.is-success').contains('Success! You should receive an email with a password reset code.');
        });
    });

    describe('step 3: password reset', () => {
        beforeEach(() => {
            cy.route('POST', '/resetPass/checkCode', {}).as('checkCode');
            cy.route('POST', '/resetPass/saveNewPass', {}).as('saveNewPass');
            cy.visit('/#/forgotPassword');
            cy.get('#username').type('test user');
            cy.get('#email').type('test@test.com');
            cy.get('.button').contains('Continue').click();
            cy.wait('@checkEmail');
            cy.get('#code').type('xxx');
            cy.get('.button').contains('Continue').click();
        });

        it('shows error message if password is too short/too long', () => {
            cy.get('#password1').type('x');
            cy.get('#password2').type('x');
            cy.get('.button').contains('Continue').click();
            cy.get('.notification.is-danger').contains('Password must be between 6 and 100 characters.').should('be.visible');
        });

        it('shows error message if passwords do not match', () => {
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password2');
            cy.get('.button').contains('Continue').click();
            cy.get('.notification.is-danger').contains('Error: The passwords do not match.').should('be.visible');
        });

        it('shows error message if there is a server error', () => {
            cy.route({ method: 'POST', url: '/resetPass/saveNewPass', status: 500, response: {}}).as('saveNewPass');
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('.button').contains('Continue').click();
            cy.get('.notification.is-danger').contains('Error saving password. Please try again.').should('be.visible');
        });

        it('can reset password', () => {
            cy.get('#password1').type('test password');
            cy.get('#password2').type('test password');
            cy.get('.button').contains('Continue').click();
            cy.wait('@saveNewPass').its('requestBody').should('deep.equal', {
                newPass: 'test password',
                userId: 1
            });
            cy.url().should('equal', 'http://localhost:8080/#/');
        });
    });
});