/**
 * Created by svenlee on 18/1/13.
 */

'use strict';

const pm2 = require('pm2');
const Promise = require('bluebird');
const _ = require('lodash');
const pm2Async = Promise.promisifyAll(pm2);

let processDescList;

let messageHandler;


let Pm2IPC = {
    init: function (projectName, msgHandler) {

    },
};