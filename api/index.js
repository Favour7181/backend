// api/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../src/docs/swaggerDocs');
const userRoutes = require('../src/routes/userRoutes');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Export the app for Vercel
module.exports = app;
