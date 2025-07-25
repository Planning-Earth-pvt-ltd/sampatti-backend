# Sampatti Backend Project

This is a TypeScript backend project for managing user details and properties. It uses Express.js for the server framework and Prisma for database interactions.

## Project Structure

```
sampatti-backend
├── src
│   ├── index.ts                # Entry point of the application
│   ├── prisma.ts               # Prisma client setup for database interactions
│   ├── routes
│   │   ├── propertyRoutes.ts    # Routes for property management
│   │   ├── u_Details.routes.ts   # Routes for user details management
│   │   └── user.route.ts        # Routes for user management
│   ├── middlewares
│   │   └── upload.ts           # Middleware for handling file uploads
│   └── types
│       └── index.ts            # TypeScript types and interfaces
├── package.json                 # NPM configuration file
├── tsconfig.json                # TypeScript configuration file
├── Dockerfile                   # Dockerfile for building the application image
└── README.md                    # Project documentation
```

## Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd sampatti-backend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm run start
   ```

4. **Build the application:**
   ```
   npm run build
   ```

## Docker

To build and run the application using Docker:

1. **Build the Docker image:**
   ```
   docker build -t sampatti-backend .
   ```

2. **Run the Docker container:**
   ```
   docker run -p 4000:4000 sampatti-backend
   ```

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

- `DATABASE_URL`: Your database connection string.
- `DIRECT_URL`: Your direct URL for any external services.
- `TWILIO_ACCOUNT_SID`: Twilio Account SID for messaging services.
- `TWILIO_SERVICE_SID`: Twilio Service SID for messaging services.
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token for authentication.

## License

This project is licensed under the MIT License.