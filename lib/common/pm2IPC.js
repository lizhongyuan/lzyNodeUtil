/**
 * Created by svenlee on 18/1/13.
 */

'use strict';

const crpyto = require('crypto');
const pm2 = require('pm2');
const Promise = require('bluebird');
const _ = require('lodash');
const pm2Async = Promise.promisifyAll(pm2);

let processDescList;

let messageHandler;

let md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex').toLowerCase();
}

function sendMessage2Process(processId, packet) {
    pm2Async.sendDataToProcessIdAsync(processId, packet)
        .then(res => {
            console.log(`send data to process done, res ${res}`);
        }, err => {
            console.error(`send data to process failed, res ${err}`);
        })
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
                })

                processDescList = processDescriptionList;
            }, () => {});

        messageHandler = msgHandler;
    },

    /**
     * 当前pm2进程向pm2Id发送消息message
     * @param pm2Id
     * @param message
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
                let toProcess = processDescList[pm2Id];
                let packet = {
                    type: 'pm2IPC:msg',
                    message: {
                        type: 'send',
                        fromPm2Id: process.env.NODE_APP_INSTANCE,
                        toPm2Id: pm2Id,
                        Id: messageId,
                        data: data
                    },
                    topic:'pm2IPC'
                }
            }
        });
    }
};