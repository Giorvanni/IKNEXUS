@echo off
echo ========================================
echo Setting up CMS with editable content
echo ========================================
echo.

echo Step 1: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generating Prisma client
    exit /b %errorlevel%
)
echo.

echo Step 2: Running database migration...
call npx prisma migrate dev --name add_contact_info_section
if %errorlevel% neq 0 (
    echo Error running migration
    exit /b %errorlevel%
)
echo.

echo Step 3: Seeding database with CMS content...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo Error seeding database
    exit /b %errorlevel%
)
echo.

echo ========================================
echo CMS setup complete!
echo ========================================
echo.
echo You can now:
echo 1. Start the dev server: npm run dev
echo 2. Login at http://localhost:3100/admin (admin@iris.local / admin123)
echo 3. Edit pages at http://localhost:3100/admin/pages
echo.
echo All text content is now editable by the owner!
echo.
pause
