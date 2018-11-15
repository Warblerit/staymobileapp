var fs = require("fs");
var winston = require("winston");
const moment = require("moment");
const rotate = require('winston-daily-rotate-file');
/*LOGGER MAIN*/

/*Create log directory*/
var logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

//const tsFormat = () => (new Date()).toLocaleTimeString();
var myCustomLevels = {
  levels: {
    critical: 'critical',
    error: 'error',
    info: 'info',
    warning: 'warning',

  },
  colors: {
    critical: 'red',
    error: 'red',
    info: 'green',
    warning: 'yellow'
  }
};
// var transport = new (winston.transports.DailyRotateFile)({
//   filename: 'logs/server-%DATE%.log',
//   datePattern: 'YYYY-MM-DD-HH',
//   zippedArchive: false,
//   maxSize: '20m',
//   maxFiles: '30d',
//   handleExceptions: true
// });

var winlogger = winston.createLogger({

  level: myCustomLevels.levels.error,
  transports: [
    new winston.transports.Console({
      timestamp: () => {
        return moment().format("YYYY-MM-DD hh:mm:ss");
      }
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/server-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
      handleExceptions: true,
      timestamp: () => {
        return moment().format("YYYY-MM-DD hh:mm:ss");
      }
    }),

    // new winston.transports.File({
    //   filename: `${logDir}/server.log`,
    //   timestamp: () => {
    //     return moment().format("YYYY-MM-DD hh:mm:ss");
    //   },
    //   level: 'error',
    //   colorize: true
    // })
  ],
});

module.exports = (winlogger);
