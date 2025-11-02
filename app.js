require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// Start server after successful MongoDB connection so mutations can't run before DB is ready
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Movie app is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // exit so the issue is obvious and process manager can restart if configured
    process.exit(1);
  }
}

start();

module.exports = app;