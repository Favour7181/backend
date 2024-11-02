const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
// const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerDocs');
const userRoutes = require("./routes/userRoutes")



// Load environment variables
dotenv.config();

// // Connect to MongoDB
// connectDB();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());



app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users', userRoutes)



// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});



// Start server
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}



module.exports = app