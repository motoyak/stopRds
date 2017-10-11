const stopInstance = require('./stop');

exports.handler = (event, context, callback) => {
  // TODO implement
  console.log("value1 = " + event.key1);
  console.log("value2 = " + event.key2);
  stopInstance('dummy');
  callback(null, 'Hello from Lambda world');
};