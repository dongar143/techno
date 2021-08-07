
const socketio = require('socket.io')
const logger = require('winston');
// const authManger = require('./../socket/manager/authManger');
// const responseHandler = require('./../socket/handler/responseHandler');

function openSocketConnection() {

    this.io = global.io;
    this.io.on('connection', function (socket) {
        logger.info("NEW CONNECTION FROM : " + socket.client.conn.remoteAddress);
        logger.info("TOKEN : " + socket.handshake.query.token);
        if (socket.handshake.query.token != undefined || socket.handshake.query.token != "") {
            authManger.attempt(socket, socket.handshake.query.token);
        }
        else {
            logger.error("TOKEN NOT FOUND : Closing connection...");
            responseHandler.sendAuthFail(socket);
            socket.disconnect();
        }
        socket.on("ping-custom", function () {
            socket.emit("pong-custom", socket.id);
        });

    });
}
module.exports = function (server) {
    logger.info("In socket Server")

    const io = socketio(server, {
        allowEIO3: true, cors: {
            origin: '*',
        }
    })

    global.io = io;

    openSocketConnection();
};