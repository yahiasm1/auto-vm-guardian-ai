
# VM Management System

A complete solution for virtual machine management in educational environments.

## Project Structure

The project is organized into two main directories:
- `client`: Frontend React application
- `server`: Backend Express.js server

## Getting Started

### Prerequisites

- Node.js 16+
- npm 8+

### Installation

1. Install dependencies for both client and server:
```
npm install
```

This will install dependencies for both the client and server projects.

### Development

To run both client and server in development mode:

```
npm run dev
```

This will start:
- Client at http://localhost:8080
- Server at http://localhost:5000

### Building for Production

To build the client:

```
npm run build:client
```

The build output will be in `client/dist`.

### Running in Production

To start the server in production:

```
npm start
```

## Environment Variables

### Server Environment

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:8080
```

### Client Environment

Create a `.env` file in the client directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
```
