import dotenv from 'dotenv';

dotenv.config();

const needsSSL = (host) => host && !['127.0.0.1', 'localhost'].includes(host);

const sslOptions = {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

const common = {
  dialect: 'postgres',
  logging: false
};

export default {
  development: {
    ...common,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'document_finder_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    ...(needsSSL(process.env.DB_HOST) ? sslOptions : {})
  },
  test: {
    ...common,
    username: process.env.DB_TEST_USER || 'postgres',
    password: process.env.DB_TEST_PASSWORD || 'postgres',
    database: process.env.DB_TEST_NAME || 'document_finder_test',
    host: process.env.DB_TEST_HOST || '127.0.0.1',
    ...(needsSSL(process.env.DB_TEST_HOST) ? sslOptions : {})
  },
  production: {
    ...common,
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
