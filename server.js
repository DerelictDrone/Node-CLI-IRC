const udp = require('dgram');

args = process.argv
fileName = args[1].split('\\');
msg = `This program needs at least 1 argument\nPorts\n\nExample:\n${fileName[fileName.length-1]} 30\n\n`
  try {
    if (args.length < 3) {
      process.stderr.write(msg)
      process.exit();
    }
  } catch {
    process.stderr.write(msg)
    process.exit()
  } // shut up
  msg = null;

port = process.argv[2]
port = parseInt(port)
const out = process.stdout

messagingList = [];
names = [];

const irc = udp.createSocket('udp4')

irc.bind(port)

loginMsg = Buffer.allocUnsafe(3)
loginMsg[0] = 0x01
loginMsg[1] = 0x02
loginMsg[2] = 0x03

goodbye = Buffer.allocUnsafe(2)
goodbye[0] = 0x01
goodbye[1] = 0x2F

userNameDiv = Buffer.allocUnsafe(1)
userNameDiv[0] = 0x02

received = Buffer.allocUnsafe(2)
received[0] = 0x03
received[1] = 0x01

irc.on('message', (msg, rinfo) => {
    let system = false;
    if(msg.toString() === received.toString()) {

    } else {
    if(msg.slice(0,3).toString() === loginMsg.toString()) {
        if(messagingList.indexOf(rinfo.address) === -1) {
            messagingList.push(rinfo.address)
            names.push(msg.slice(3))
        }
        msg = msg.slice(3)+' has connected!'
        system = true;
} else if(msg.toString() === goodbye.toString()) {
    msg = names[messagingList.indexOf(rinfo.address)]+' has disconnected.'
    names.splice(messagingList.indexOf(rinfo.address),1)
    messagingList.splice(messagingList.indexOf(rinfo.address),1)
    system = true;
}
    sender = names[messagingList.indexOf(rinfo.address)]
    out.write(sender +' sent: '+msg+'\n')
    for(let i = 0; i < messagingList.length;) {
            if(system) {
            irc.send(msg,port+1,messagingList[i])
            } else {
            irc.send(sender+userNameDiv+msg,port+1,messagingList[i])
            }
            i++

    }
}
    })
