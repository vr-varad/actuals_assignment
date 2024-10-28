import chalk from 'chalk'
import moment from 'moment'

class Logger {
    static log(message) {
        console.log(
            `${chalk.blue('[LOG]')} ${chalk.blue(
                moment().format('YYYY-MM-DD HH:mm:ss')
            )} - ${message}`
        )
    }

    static error(message) {
        console.log(
            `${chalk.blue('[LOG]')} ${chalk.blue(
                moment().format('YYYY-MM-DD HH:mm:ss')
            )} - ${chalk.red(message)}`
        )
    }

    static warn(message) {
        console.log(
            `${chalk.blue('[LOG]')} ${chalk.blue(
                moment().format('YYYY-MM-DD HH:mm:ss')
            )} - ${chalk.yellow(message)}`
        )
    }

    static success(message) {
        console.log(
            `${chalk.green('[LOG]')} ${chalk.green(
                moment().format('YYYY-MM-DD HH:mm:ss')
            )} - ${chalk.yellow(message)}`
        )
    }
}

export default Logger