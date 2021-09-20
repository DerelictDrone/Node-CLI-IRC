// This file is only necessary for compilation to an executable format(if you don't want to install node)
const {
   readFileSync
} = require('fs')

let code
if (process.argv.length < 5) {
    code = readFileSync(__dirname + '/server.js')
} else if (process.argv.length > 2) {
    code = readFileSync(__dirname + '/client.js')
}
if (process.argv.length < 3) {
    process.stdout.write('\nThis program needs either 1 argument, or 3 arguments.\n')
    process.stdout.write('For Client: IP, Port, Username\n       127.0.0.1, 30, Steve\n')
    process.stdout.write('For Server: Port\n             30\n')
    process.exit(0)
}

eval( code.toString() )
