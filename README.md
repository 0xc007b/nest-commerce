<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

# Nest-Clothes E-commerce API

A modern e-commerce REST API built with NestJS for a clothing store application. This project provides a robust backend for managing products, orders, user accounts, and more.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Product Management**: Create, update, and browse clothing products with categories
- **Shopping Cart**: Add products to cart, update quantities, and checkout
- **Order Processing**: Place orders, track status, and manage order history
- **User Management**: Register, login, and manage user profiles
- **Address Management**: Save and manage multiple shipping addresses
- **Notifications**: Send notifications for order updates and other events

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Project Structure

The application follows a modular architecture with the following main components:

```
src/
├── addresses/       # Address management module
├── auth/            # Authentication and authorization
├── carts/           # Shopping cart functionality
├── categories/      # Product categories
├── notifications/   # User notification system
├── orders/          # Order processing and management
├── products/        # Product catalog management
├── users/           # User account management
├── prisma/          # Database connection service
└── main.ts          # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
$ git clone https://github.com/yourusername/nest-clothes.git

# Install dependencies
$ npm install

# Set up environment variables (create .env file)
# DATABASE_URL="postgresql://username:password@localhost:5432/nest_clothes"
# JWT_SECRET="your-secret-key"

# Run database migrations
$ npx prisma migrate dev
```

### Running the Application

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run build
$ npm run start:prod
```

### API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Deployment

This application can be deployed to any Node.js hosting platform. For production deployment, consider using:

- AWS Elastic Beanstalk
- Heroku
- Digital Ocean App Platform
- Docker containers with Kubernetes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
