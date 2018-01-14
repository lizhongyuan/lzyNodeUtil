/**
 * Created by svenlee on 18/1/13.
 */

'use strict';

const crpyto = require('crypto');
const pm2 = require('pm2');
const Promise = require('bluebird');
const _ = require('lodash');
const pm2Async = Promise.promisifyAll(pm2);
const EventEmitter = require('events').EventEmitter;

let curPm2Id = process.env.NODE_APP_INSTANCE;

let processDescList;
let messageHandler;
let pm2IPCEmitter = new EventEmitter();

let md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex').toLowerCase();
};

function sendData2Process(pm2Id, packet) {
    pm2Async.sendDataToProcessIdAsync(pm2Id, packet)
        .then(res => {
                console.log(`send data to process done, res ${res}`);
            }, err => {
                console.error(`send data to process failed, res ${err}`);
            });
}


let Pm2IPC = {

    /**
     *
     * @param projectName   工程名(pm2 list查看)
     * @param msgHandler    消息处理函数
     * @return null
     */
    init: function (projectName, msgHandler) {
        pm2Async.listAsync()
            .then(processDescriptionList => {
                // 剔除和本进程名不同的pm2进程
                _.remove(processDescriptionList, obj => {
                    return obj.pm2_env.name != projectName;
                });

                // 赋值processDescList
                processDescList = processDescriptionList;
            }, () => {});

        messageHandler = msgHandler;
    },

    getProcessDescList: function () {
        return processDescList;
    },

    /**
     * 当前pm2进程向pm2Id发送消息message
     * @param pm2Id
     * @param data
     * @returns {Promise}, resolve
     */
    sendMessage: function (pm2Id, data) {
        pm2Id = parseInt(pm2Id);
        return new Promise((resolve, reject) => {
            if (pm2Id >= processDescList.length) {
                reject({status:300, info:'pm2Id illegal'});
                // todo finish the Promise
            } else {
                let messageId = md5(message.toSource());    // todo 根据业务修改
                let curPm2Id = processDescList[pm2Id];
                let packet = {
                    type: 'pm2IPC:msg',
                    message: {
                        type: 'REQUEST',
                        fromPm2Id: curPm2Id,
                        toPm2Id: pm2Id,
                        Id: messageId,
                        data: data
                    },
                    topic:'pm2IPC'
                };

                // 向pm2Id发送数据包pcaket
                sendData2Process(pm2Id, packet);

                let timeout = 30 * 1000;
                let timer = setTimeout(() => {
                    let curMsgIdEventListenerCount = EventEmitter.listenerCount(pm2IPCEmitter, messageId);
                    if (curMsgIdEventListenerCount && curMsgIdEventListenerCount > 0) {
                        console.log(`sendMessage timeout, removeAllListner, messageId: ${messageId}`);
                        pm2IPCEmitter.removeAllListeners(messageId);
                        reject({status:200, data:'', msg:`send Msg from ${curPm2Id} to ${pm2Id} time out.`});
                    }
                }, timeout);
                pm2IPCEmitter.once(messageId, (retCode, data) => {
                    clearTimeout(timer);
                    resolve({status:100, data:data, msg:''});
                });
            }
        });
    },

    receiveMessage: function (packet) {
        if ('pm2IPC:msg' === packet.type) {
            let msgType = packet.message.type; // REQUEST or RESPONSE
            let fromPm2Id = packet.message.fromPm2Id;
            let toPm2Id = packet.message.toPm2Id;
            let messageId = packet.message.Id;

            if ('REQUEST' === msgType) {
                // init the responsePacket
                let responsePacket = {
                    type: 'pm2IPC:msg',
                    message: {
                        type: 'RESPONSE',
                        fromPm2Id: process.env.NODE_APP_INSTANCE,
                        toPm2Id: fromPm2Id,
                        Id: messageId
                    },
                    topic: 'pm2IPC'
                };

                messageHandler(packet.message.data)
                    .then(res => {
                        responsePacket.message.data = res;
                        sendData2Process(fromPm2Id, responsePacket);
                    }, err => {
                        if ('undefined' === typeof err.code) {
                            responsePacket.message.data = {code:0, data:{}};
                        } else {
                            responsePacket.message.data = err;
                        }
                        sendData2Process(fromPm2Id, responsePacket);
                    })
            } else if ('RESPONSE' === type) {   //
                let code = packet.message.data.code;
                let data = packet.message.data.data || {};
                pm2IPCEmitter.emit(messageId, code, data);
            }
        }
    }
};

module.exports = Pm2IPC;