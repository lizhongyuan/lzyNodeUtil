/**
 * Created by svenlee on 18/1/14.
 */

const pm2IPC = require('../lib/common/pm2IPC');

// 初始化
pm2IPC.init('ipctest', () => {});

debugger;

setTimeout(() => {
    let processDescList = pm2IPC.getProcessDescList()
    console.log("????", processDescList.length);
    console.log(process.env.NODE_APP_INSTANCE)
}, 1000);

// console.log("processDescList.length:", processDescList.length);