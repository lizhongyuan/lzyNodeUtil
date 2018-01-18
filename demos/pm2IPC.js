/**
 * Created by svenlee on 18/1/14.
 */

const pm2IPC = require('../lib/common/pm2IPC');
const Promise = require('bluebird');

const log4js = require('../lib/common/log4js');
const logger = log4js.getLogger('lzy-util');


let messageHandler = function() {
  return Promise.resolve('abcd');
}

// 初始化
pm2IPC.init('ipctest', messageHandler);

setTimeout(() => {
  logger.info("setTimeout 1000ms."); 
  let processDescList = pm2IPC.getProcessDescList()
  let curPm2Id = parseInt(process.env.NODE_APP_INSTANCE);
  if (0 === curPm2Id) {
    console.log("Hhh cur pm2 id", process.env.NODE_APP_INSTANCE);
    pm2IPC.sendMessage(1, '1234')
      .then(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
}, 1000);

