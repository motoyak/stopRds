'use strict';
const aws = require('aws-sdk');
const rds = new aws.RDS();

// Check if environment supports native promises
if (typeof Promise === 'undefined') {
  AWS.config.setPromisesDependency(require('bluebird'));
}

module.exports.handler = (event, context, callback) => {
  return Promise.resolve().then(()=> {
    return stopInstances();
  }).then(data => {
    return Promise.resolve(callback(null, data));
  }).catch(err => {
      console.log('Error', err);
      return Promise.reject(callback(err, null));
  });
};

const stopInstances = ()=>{
  return new Promise((resolve, reject) => {
    rds
      .describeDBInstances({}).promise()
      .then(data =>
        Promise.all(data.DBInstances.map(instance => describeTagsFromDBInstance(rds, instance)))
      )
      .then(data => {
        const res = data
          .filter(elm => elm.TagList.some(elm => (elm.Key === 'AlwaysOff' && elm.Value === 'true')))
          .map(elm => elm.InstanceName);
        return resolve(res);
      })
      .catch(err => reject(err));
  });
};

const describeTagsFromDBInstance = (rds, DBInstance) => {
  return new Promise((resolve,reject) => {
    rds
      .listTagsForResource({ResourceName:DBInstance.DBInstanceArn}).promise()
      .then(data =>
        resolve({
          TagList: data.TagList,
          InstanceName: DBInstance.DBInstanceIdentifier
        })
      )
      .catch(err => reject(err));
  });
};