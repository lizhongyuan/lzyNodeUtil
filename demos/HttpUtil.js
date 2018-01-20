/**
 * Created by svenlee on 18/1/20.
 */

'use strict';

const CommonUtil = require('../lib/common');
const HttpSeries = CommonUtil.HttpSeries;
const Promise = require('bluebird');
Promise.config({
  cancellation:true
});
const log4js = require('../lib/common/log4js');
const logger = log4js.getLogger('lzy-util');

HttpSeries.HttpRequestAsync('GET', 'http://www.baidu.com')
  .then(parseBody => {
    console.log(parseBody);
  });
