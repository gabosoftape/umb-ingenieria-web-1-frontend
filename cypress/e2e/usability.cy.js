describe('Prueba de usabilidad - Full', () => {
    it('Debe permitir ingresar con credenciales válidas', () => {
        cy.visit('https://arpadine.com/en');

        // Verifica que los inputs estén visibles
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');

        // Simula escribir email y password
        cy.get('input[name="email"]').type('gabosoft.ape@gmail.com');
        cy.get('input[name="password"]').type('123456');

        // Clic en botón "Entrar"
        cy.contains('Iniciar sesión').click({ force: true });

        // Verifica que haya navegación a página principal o dashboard
        cy.url({ timeout: 10000 }).should('include', '/dashboard');

        // Verifica que el usuario vea su nombre, por ejemplo
        cy.contains('Bienvenido', { timeout: 10000 }).should('be.visible');



    });
    it('Debe permitir crear un nuevo blog', () => {
        cy.visit('https://arpadine.com/en');

        // Verifica que los inputs estén visibles
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');

        // Simula escribir email y password
        cy.get('input[name="email"]').type('gabosoft.ape@gmail.com');
        cy.get('input[name="password"]').type('123456');

        // Clic en botón "Entrar"
        cy.contains('Iniciar sesión').click({ force: true });

        // Verifica que haya navegación a página principal o dashboard
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        ///en/settings/blogs
        cy.contains('Blogs',{ timeout: 10000 }).click({ force: true });
        // Ir a sección de blogs o clic en botón "Nuevo blog"
        cy.contains('Agregar',{ timeout: 15000 }).click({ force: true });

        // Llenar el formulario
        cy.get('input[name="name"]').type('Nuevo blog desde Cypress');
        cy.get('input[name="description"]').type('Descripcion blog desde Cypress');
        cy.get('textarea[name="text"]').type('Este es el contenido del blog automatizado.');

        // Guardar
        cy.contains('Crear', { timeout: 10000 }).click({ force: true });

        // Verificar que aparezca en la lista o con mensaje de éxito
        cy.contains('Blog creado exitosamente').should('be.visible');
        cy.contains('Nuevo blog desde Cypress').should('exist');
    });
    it('Debe permitir cerrar sesión correctamente', () => {
        cy.visit('https://arpadine.com/en');

        // Verifica que los inputs estén visibles
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');

        // Simula escribir email y password
        cy.get('input[name="email"]').type('gabosoft.ape@gmail.com');
        cy.get('input[name="password"]').type('123456');

        // Clic en botón "Entrar"
        cy.contains('Iniciar sesión').click({ force: true });

        // Verifica que haya navegación a página principal o dashboard
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        // Verifica que el usuario vea su nombre, por ejemplo
        cy.get('#radix-«rg»',{ timeout: 15000 }).click({ force: true });
        // Abre menú o clic en botón de logout
        cy.contains('Cerrar sesión').click({ force: true });

        // Verifica redirección a login o página pública
        cy.url({ timeout: 10000 }).should('include', '/login');

        // Verifica que los inputs de login estén visibles
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
    });
});