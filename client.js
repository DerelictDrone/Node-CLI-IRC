const udp = require('dgram');
const inp = process.stdin
const out = process.stdout
args = process.argv
fileName = args[1].split('\\');
msg = `This program needs at least 3 arguments\nIP Port Username\n\nExample:\n${fileName[fileName.length-1]} 127.0.0.1 30 Steve\n\n`
try {
  if (args.length < 5) {
    process.stderr.write(msg)
    process.exit();
  }
} catch {
  process.stderr.write(msg)
  process.exit()
} // shut up
msg = null;

ip = process.argv[2]
port = process.argv[3]
username = process.argv[4]
port = parseInt(port)

inp.setRawMode(true);
inp.resume();
inp.setEncoding('utf8');

const irc = udp.createSocket('udp4')

irc.bind(port + 1)

console.log(port, ip)
irc.connect(port, ip, function () {
  login = Buffer.allocUnsafe(3)
  login[0] = 0x01
  login[1] = 0x02
  login[2] = 0x03
  bufferedUsername = Buffer.from(username)
  hello = login + bufferedUsername
  irc.send(hello, [port])
})

received = Buffer.allocUnsafe(2)
received[0] = 0x03
received[1] = 0x01

goodbye = Buffer.allocUnsafe(2)
goodbye[0] = 0x01
goodbye[1] = 0x2F

userNameDiv = Buffer.allocUnsafe(1)
userNameDiv[0] = 0x02

irc.on('message', (msg, rinfo) => {
  let userNameParsed = false
  let userNameOffSet = 0
  for (let i = 0; i < msg.length; i++) {
    if (msg[i] === 2) {
      userNameParsed = true
      i = 99999
    } else {
      userNameOffSet++
    }
  }
  if (userNameParsed == false) {
    out.write('\n\033[1A\033[2K')
    out.write('\7' + msg + '\n')
    out.write(message.join('')) // rewrite our message so we know what we were trying to say
  } else {
    out.write('\n\033[1A\033[2K')
    out.write(msg.slice(0, userNameOffSet) + ': ' + msg.slice(userNameOffSet + 1) + '\n\7')
    out.write(message.join(''))
  }
  irc.send(received, [port, ip])
})

let message = [];

inp.on('data', function (key) {

  switch (Buffer.from(key)[0]) {
    case 0x0d: { // ENTER
      msg = Buffer.from(message.join(''))
      out.write('\n\033[1A\033[2K') // delete input line for cleaner interface.
      irc.send(msg, [port, ip])
      message = []
      break;
    }
    case 0x03: { // CTRL+C/Command interrupt
      irc.send(goodbye, [port, ip])
        out.write('\n\nDisconnected gracefully.\n')
        process.exit(0)
    }
    case 0x08: {
      message.splice(message.length - 1, 1)
      out.write('\033[1D\033[0K')
      break;
    }
    case 0x1B: { // Can't have it doing something we REALLY don't want it to.
      break;
    }
    default: {
      message.push(key)
      out.write(key)
    }
  }
})

process.on('SIGTERM', function() {
  irc.send(goodbye, [port, ip],function() {
    process.exit(0)
  })
})