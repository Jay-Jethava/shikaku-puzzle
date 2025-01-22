const config = {
  development: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: 3306,
    dialect: "mysql",
    logging: false,
  },
};

module.exports = config;
