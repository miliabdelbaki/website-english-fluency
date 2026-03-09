const mongoose = require('mongoose');

const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_english';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected (${mongoose.connection.host})`);
};

module.exports = connectDb;
