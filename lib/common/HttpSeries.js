/**
 * Created by svenlee on 18/1/20.
 */

'use strict'

const Promise = require('bluebird');
Promise.config({
  cancellation:true
});
const RP = require('request-promise');

const log4js = require('./log4js');
const logger = log4js.getLogger('lzy-util');


let HttpSeries = {

  /**
   * @param method
   * @param url
   * @param body
   * @returns {Promise}
   */
  HttpRequestAsync: function (method, url, body) {
    let options;
    if ('GET' === method) {
      options = {
        method: method,
        uri: url
      };
    } else if ('POST' === method) {
      options = {
        method: method,
        uri: url,
        body: body
      };
    }
    return new Promise((resolve, reject) => {
      let promiseChain = Promise.resolve()
        .then(() => {
          return RP(options);
        })
        .then(parseBody => {
          logger.info(parseBody);
          resolve({status:100, data:parseBody, info:""});
        }, err => {
          let errorStr = JSON.stringify(err);
          logger.error('Error:', errorStr);
          reject({status:300, data:"", info:errorStr});
          return promiseChain.cancel();
        })
        .catch(err => {
          let errorStr = JSON.stringify(err);
          logger.error('Error:', errorStr);
          reject({status:500, data:"", info:errorStr});
        })
    })

  },
  HttpsRequest: function () {}
}

/*
HttpSeries.HttpRequestAsync('GET', 'http://www.baidu.com')
  .then(body => {
    console.log(body);
  }, err => {
    console.log(JSON.stringify(err));
  })
*/

module.exports = HttpSeries;
