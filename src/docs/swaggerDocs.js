
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for the backend application',
    },
    servers: [
      {
        url: 'https://backend-drab-iota.vercel.app',
      },
    ],
  },
  apis: ['./src/docs/swaggerPaths.js'],
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
