const userCollection = require('./../collection/user').UserCollection();

const { SocketEventConstant, ChatEventConstant } = require("../../utils/const");
const HelperUtils = require("../../utils/helpers");

const logger = require('winston');
/**
 * Get user object from userManager
 */
function getUserObject(userId) {
    return userCollection.users[userId];// This is due to not working of below commented code
}

// Send auth fail
function sendAuthFail(socket) {
    let data = {
        data: "Invalid Token."
    };

    onlyEmitToSocket(socket, SocketEventConstant.ON_ERROR, data);
}
// Send auth success
function sendAuthSuccess(socket) {
    let data = { msg: "Auth Success" };


    onlyEmitToSocket(socket, SocketEventConstant.ON_AUTH_SUCCESS, data);
}

/**
 * Emit event to user via socket without callback
 */
function onlyEmitToUser(receiver, event, data) {
    let user = getUserObject(receiver);
    if (user) {
        user.emitToAllSockets(event, data);
    }
}
/**
 * Emit event to socket via socket without callback
 */
function onlyEmitToSocket(socket, event, data) {
    socket.emit(event, data);
}
function emitUserStatusEvent(currUser, status) {


    var data = {
        "status": status,
        "id": currUser.id,
        "lastSeen": (new Date()).getTime()
    };


    for (var key in userCollection.users) {
        var user = userCollection.users[key];

        // if (user.id != currUser.id) {
        for (var key in user.sockets) {

            var socket = user.sockets[key];
            user.emitToSocketWithoutCache(socket, SocketEventConstant.USER_ONLINE_STATUS_CHANGED, data, function () {
                logger.info('Emit status to User', { evt: SocketEventConstant.USER_ONLINE_STATUS_CHANGED, data: data });
            });
        }
        //}
    }
}

function emitResponseEventToAllOnline(currUser, eventName, data) {

    let responseData = HelperUtils.prepareSocketResponse(data, eventName)

    for (var key in userCollection.users) {
        var user = userCollection.users[key];

        if (user.id != currUser.id) {
            for (var key in user.sockets) {

                var socket = user.sockets[key];
                user.emitToSocketWithoutCache(socket, SocketEventConstant.SOCKET_RESPONSE, responseData, function () {
                    logger.info('Emit Response to User : ' + stringify(responseData));
                });
            }
        }
    }
}
function emitResponseEventToUserOnline(currUser, eventName, data) {

    let responseData = HelperUtils.prepareSocketResponse(data, eventName)

    let user = getUserObject(currUser);

    user.emitToSocketWithoutCache(socket, SocketEventConstant.SOCKET_RESPONSE, responseData, function () {
        logger.info('Emit Response to User : ' + stringify(responseData));
    });

}
function emitToSocket(socket, eventName, data) {
    // console.log(data);
    // console.log(eventName);
    logger.info("Response emitToSocket", { evtName: eventName, resData: data })
    let responseData = HelperUtils.prepareSocketResponse(data, eventName)

    socket.emit(SocketEventConstant.SOCKET_RESPONSE, responseData, function () {
        logger.info('Emit Response to Socket : ' + stringify(responseData));
    });

}



/**
 * Emit event to user via socket
 */

function emitToUser(user, event, data, token, sender) {

    if (user && sender && user.id == sender.id) {
        sender.emitToAllSockets(event, data, function () {
            logger.info('Emit to sender other devices : ' + stringify(data));
        });
    } else {
        user.emitToAllSockets(event, data, function () {
            logger.info('Emit to User : ' + stringify(data));
        });
    }

}

/**
 * Send data to user
 *
 * via Socket - If user is online
 * via Push   - If user is offline
 */
function sendToUser(to, event, data, token, from_send) {


    var user = getUserObject(to);
    var sender = getUserObject(from_send);
    logger.info('send To User', { data: data });
    if (user) {
        emitToUser(user, event, data, token, sender);
    }
    // else {
    //     pushNotification.sendNotificationToUser(to, data, event, token);
    // }
    // if (!sender && from_send && from_send != '')
    //     pushNotification.sendNotificationToUser(from_send, data, event, token);
}





/**
 * Emit event to room (receiverRoom = group) using socket
 */
function emitToRoom(room, subscribers, event, data, token) {
    var receiver;
    data.room = room;
    subscribers.forEach(function (subscriber) {
        if (subscriber != data.sender) {
            receiver = getUserObject(subscriber);
            if (receiver) {
                receiver.emitToAllSockets(event, data, function () {
                    logger.info('Emit to :' + subscriber + ' : ' + stringify(data) + ' from: ' + room);
                });
            }

        } else if (subscriber == data.sender) {

            receiver = getUserObject(subscriber);
            if (receiver) {
                receiver.emitToAllSockets(event, data, function () {
                    logger.info('Emit to :' + subscriber + ' : ' + stringify(data) + ' from: ' + room);
                });
            }

        }
    });
}




/**
 * Send message to Group
 *
 * via Socket - for online users
 * via Push   - for offline users
 */
function sendToGroup(groupId, event, data, token, from_send) {
    var groupObj = getGroupObject(groupId);
    if (groupObj && groupObj.online) {
        var subscribers = groupObj.online;
        data.eventId = HelperUtils.generateUUID();
        emitToRoom(groupId, subscribers, event, data, token, from_send);
    }
    // pushNotification.sendNotificationToGroup(groupId, data, event, token, token);

    //performMessagePostActions(event, data, token);

}



function sendResponse(event, message, token) {

}

/**
 * Send message
 */
function sendMessage(event, data, token) {
    var chatType = data.cTy;
    var from_send = data.sId._id;

    logger.info('In sendMessage ', { cTy: chatType, data: data });
    if (chatType == ChatEventConstant.CHAT_TYPE_PRIVATE) {
        var to = data.rId._id;
        sendToUser(to, event, data, token, from_send);
        //for handle multiple login

        var from = data.sId._id;
        sendToUser(from, event, data, token, from_send);

    }
    else if (chatType == ChatEventConstant.CHAT_TYPE_GROUP) {
        if (data.gId._id) {

            var to = data.gId._id;
            sendToGroup(to, event, data, token, from_send);
        }
    }

}

// Send Status changed acknowledgement.
function sendStatusChangedAck(to, data, token) {
    //var from=data.sender;
    logger.info('messageACK', { status: data.status, mId: data.mIds, to: to });
    //logger.messageLog('messageACK ' + data.status + ' for:' + data.messageId + ' sent to ' + to, data);
    sendToUser(to, ChatEventConstant.MSG_ACK, data, token);
}
function sendAddRemoveUserGroupNoti(to, data, eventName) {
    //var from=data.sender;
    logger.info('sendAddRemoveUserGroupNoti', { data: data, event: eventName, to: to });
    //logger.messageLog('messageACK ' + data.status + ' for:' + data.messageId + ' sent to ' + to, data);
    sendToUser(to, eventName, data, "");
}
module.exports = {
    sendAuthSuccess: sendAuthSuccess,
    sendAuthFail: sendAuthFail,
    emitUserStatusEvent: emitUserStatusEvent,
    sendResponse: sendResponse,
    emitResponseEventToAllOnline: emitResponseEventToAllOnline,
    emitResponseEventToUserOnline: emitResponseEventToUserOnline,
    emitToSocket: emitToSocket,
    getUserObject: getUserObject,
    sendMessage: sendMessage,
    sendStatusChangedAck: sendStatusChangedAck,
    onlyEmitToUser: onlyEmitToUser,
    sendAddRemoveUserGroupNoti: sendAddRemoveUserGroupNoti
}
