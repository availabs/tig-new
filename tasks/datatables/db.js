const { join } = require("path"),
  { Pool, Client } = require("pg");

const HAZMIT_CONFIG = require(join(__dirname, "tigtest2.config.json"));


class DataBase {
  constructor(config) {
    this.database = config.database
    this.pool = new Pool(config);
  }
  query(...args) {
    return this.pool.query(...args)
  }
  end() {
    return this.pool.end();
  }
  promise(...args) {

    return new Promise((resolve, reject) => {
      this.pool.query(...args, (error, result) => {
        if (error) {
          console.log(`<DataBase> ${ this.database } ERROR:`, ...args, error);
          reject(error);
        }
        else {
          resolve(result.rows);
        }
      })
    })
  }
}


module.exports = new DataBase(HAZMIT_CONFIG)
