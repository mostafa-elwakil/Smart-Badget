# Smart Budget

A modern, feature-rich personal finance management application built with the PERN stack (PostgreSQL, Express, React, Node.js).

## Features

*   **Dashboard**: Visual overview of your finances with charts and summaries.
*   **Expense & Income Tracking**: Easily add, edit, and delete transactions.
*   **Shopping List**: Manage your shopping items and track purchases.
*   **User Management**: Role-based access control (Admin/User). Admins can manage user roles and statuses.
*   **Authentication**: Secure registration and login with JWT and Email Verification.
*   **PWA Support**: Installable as a Progressive Web App on mobile and desktop.
*   **Dark Mode**: Fully supported dark theme.
*   **Multi-Currency**: Support for various currencies.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React.
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL.
*   **Security**: Helmet, Rate Limiting, BCrypt, JWT.
*   **Containerization**: Docker & Docker Compose.

## Prerequisites

*   Node.js (v18 or higher)
*   PostgreSQL (or Docker to run the database container)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mostafa-elwakil/Smart-Badget.git
    cd smart-budget
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on the example below:

    ```env
    PORT=3001
    SECRET_KEY=your-secure-random-hex-string
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    PG_USER=postgres
    PG_HOST=localhost
    PG_DATABASE=smart_budget
    PG_PASSWORD=your_db_password
    PG_PORT=5432
    ```

    *   **Note**: For `EMAIL_PASS`, if using Gmail, generate an App Password in your Google Account settings.
    *   **Note**: You can generate a secure `SECRET_KEY` using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Running the Application

### Option 1: Local Development (Requires local PostgreSQL)

1.  Ensure your local PostgreSQL server is running and you have created a database named `smart_budget`.
2.  Start the development server (Frontend + Backend):
    ```bash
    npm run dev
    ```
3.  Access the app at `http://localhost:5173`.

### Option 2: Using Docker (Recommended)

1.  Ensure Docker Desktop is running.
2.  Build and start the containers:
    ```bash
    docker-compose up --build
    ```
3.  Access the app at `http://localhost:3001`.

## Project Structure

*   `src/`: Frontend React application code.
*   `server/`: Backend Express server code.
*   `server/db.cjs`: Database connection and schema initialization.
*   `dist/`: Production build output.

## License

This project is open source and available under the [MIT License](LICENSE).
