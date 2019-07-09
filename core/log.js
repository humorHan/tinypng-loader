const chalk = require('chalk');

module.exports = {
  success(str) {
    console.log(chalk.green(str));
  },
  warn(str) {
    console.warn(chalk.yellow(str));
  },
  error(str) {
    console.error(chalk.red(str));
  }
};