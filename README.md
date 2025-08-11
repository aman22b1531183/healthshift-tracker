HealthShift Tracker
A full-stack web application for healthcare organizations to manage staff shift tracking with location-based (geofenced) clock-in/out functionality. The system features distinct roles for Care Workers and Managers, a real-time dashboard, and secure authentication handled by Auth0.

✨ Features
For Care Workers
✅ Secure login via Auth0.

✅ Location-based clock-in/out validated against manager-defined work perimeters.

✅ Real-time shift duration tracking.

✅ Viewable personal shift history with filtering capabilities. 

✅ Ability to add optional notes to clock-in/out events. 

✅ A dedicated profile page to view account details.

For Managers
✅ A comprehensive dashboard with key analytics: average hours, daily clock-ins, currently active staff, and total staff count. 

✅ Visual charts for weekly hours worked by each staff member. 

✅ Real-time table of all currently clocked-in employees. 

✅ Staff management page to view all users and manage their roles (promote Care Workers to Managers).

✅ Location perimeter management (geofencing) to create, edit, and activate/deactivate work areas.

Security & Authentication
✅ Auth0 integration for robust and secure user authentication.

✅ Role-based access control (RBAC) separating Care Worker and Manager privileges. 

✅ Protection of all sensitive API endpoints via JWT access token validation.

✅ Use of Auth0 Actions to add custom claims (like email) to tokens for seamless integration with the backend.

🛠️ Tech Stack
Frontend: React, TypeScript, Vite, Ant Design, Tailwind CSS

Backend: Node.js, Express, TypeScript, Prisma ORM

Database: PostgreSQL

Authentication: Auth0

📁 Project Structure
healthcare-shift-tracker/
├── backend/                 # Node.js API server
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API route handlers
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
│   └── package.json
└── README.md


🚀 Getting Started
Follow these instructions to get the project running on your local machine.

Prerequisites
Node.js (v18 or later)

A running PostgreSQL database

An Auth0 account

1. Backend Setup
Navigate to the backend directory:

Bash

cd backend
Install dependencies:

Bash

npm install
Set up your environment variables by copying the example file:

Bash

cp .env.example .env
Edit the .env file with your specific credentials (see Configuration section below).

Apply the database schema:

Bash

npm run db:migrate
Start the backend server:

Bash

npm run dev
The server will be running on the port specified in your .env file (e.g., http://localhost:3001).

2. Frontend Setup
Navigate to the frontend directory:

Bash

cd frontend
Install dependencies:

Bash

npm install
Set up your environment variables by copying the example file:

Bash

cp .env.example .env
Edit the .env file with your specific credentials (see Configuration section below).

Start the frontend development server:

Bash

npm run dev
The application will be available at http://localhost:5173.

⚙️ Configuration
Backend (backend/.env)
Your backend requires the following environment variables.

Variable	Description	Example
DATABASE_URL	Your full PostgreSQL connection string.		
postgresql://user:password@localhost:5432/mydb?schema=public 

AUTH0_DOMAIN	Your Auth0 tenant domain (without https:// or trailing /).		
dev-xxxxxxxx.us.auth0.com 

AUTH0_AUDIENCE	The Audience (Identifier) of the API you created in Auth0.		
https://lief-healthcare-api 

PORT	The port for the backend server to run on.		
3001 

FRONTEND_URL	The URL of your frontend application (for CORS).		
http://localhost:5173 

Frontend (frontend/.env)
Your frontend requires the following environment variables.

Variable	Description	Example
VITE_AUTH0_DOMAIN	Your Auth0 tenant domain.	dev-xxxxxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID	The Client ID of your Auth0 SPA Application.	AbcDeFg12345...
VITE_AUTH0_AUDIENCE	The Audience (Identifier) of your API in Auth0.	https://lief-healthcare-api
VITE_API_URL	The full URL to your running backend API.	http://localhost:3001/api
🔑 Auth0 Setup Guide
To get authentication working, you need to configure three things in your Auth0 dashboard:

Create an Application:

Go to Applications -> Applications and create a new application.

Choose Single Page Application (SPA) as the type.

In the application's settings, add http://localhost:5173 to the Allowed Callback URLs and Allowed Logout URLs.

Copy the Client ID and Domain for your frontend .env file.

Create an API:

Go to Applications -> APIs and create a new API.

Give it a name (e.g., "HealthShift Tracker API").

Set the Identifier (also known as Audience). This value must be used for AUTH0_AUDIENCE and VITE_AUTH0_AUDIENCE.

Leave the signing algorithm as RS256.

Create an Action (to add email to token):

Go to Actions -> Library and click "Build Custom".

Name the action Add Email and Name to Token.

Use the following code:

JavaScript

exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://lief-healthcare-api'; // Use your API Audience here
  if (event.authorization) {
    api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
    api.accessToken.setCustomClaim(`${namespace}/name`, event.user.name);
  }
};
Click Deploy.

Go to Actions -> Triggers -> Post Login.

Drag your new action from the right panel into the flow and click Apply.

📜 Available Scripts
Backend
npm run dev: Starts the development server with hot-reloading.

npm run build: Compiles the TypeScript code to JavaScript.

npm run start: Starts the compiled application for production.

npm run db:migrate: Applies pending database migrations.

npm run db:generate: Generates the Prisma Client based on your schema.

npm run db:studio: Opens the Prisma Studio GUI to view and edit your database.

Frontend

npm run dev: Starts the Vite development server. 


npm run build: Builds the application for production. 


npm run preview: Previews the production build locally. 

<!--  -->
<!--  -->

<!--  -->
<!--  -->
📄 License
This project is licensed under the MIT License.