/**
 * Created by svenlee on 18/1/14.
 */

const CommonUtil = require('../lib/common');
const Pm2IPC = CommonUtil.Pm2IPC;
const Promise = require('bluebird');
Promise.config({
  cancellation:true
});
const log4js = require('../lib/common/log4js');
const logger = log4js.getLogger('lzy-util');

let messageHandler = function() {
  return Promise.resolve('abcd');
}

// 初始化
Pm2IPC.init('ipctest', messageHandler);

/*
 * pm2:0 send a message to pm2:1, then get an answer 'abcd' as a response.
 */
setTimeout(() => {
  logger.info("setTimeout 1000ms."); 
  let processDescList = Pm2IPC.getProcessDescList()
  let curPm2Id = parseInt(process.env.NODE_APP_INSTANCE);
  if (0 === curPm2Id) {
    console.log("Hhh cur pm2 id", process.env.NODE_APP_INSTANCE);
    Pm2IPC.sendMessage(1, '1234')
      .then(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
}, 1000);

