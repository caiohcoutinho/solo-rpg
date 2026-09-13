import { createLogger, format, transports } from 'winston';

import dotenv from "dotenv";
const env = dotenv.config();

class LoggerFactory {
  static createLogger(service = "solo-rpg", providedlevel){

    const level = providedlevel || process.env["logger_" + service];

    if(!level) throw new Error(`Logger level for service ${service} is not defined in environment variables.`);

    return createLogger({
      level: level,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: service },
      transports: [
        //new transports.File({ filename: 'error.log', level: 'error' }),
        //new transports.File({ filename: 'logs.log' }),
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(options => `[${options.service}][${options.level}]${options.message}`)
          )
        })
      ]
    });
  }
}


export { LoggerFactory };