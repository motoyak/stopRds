'use strict';
const aws = require('aws-sdk');
const rds = new aws.RDS();

module.exports.handler = (event, context, callback) => {
  return new Promise(()=> {
    return stopInstances().promise();
  }).then(result => {
    console.log(result, 'AAAAAAAAAAAAAAA');
    callback(null, result);
  }).catch(error => {
    console.log('ERRor');
    callback(error);
  });
};

const stopInstances = ()=>{
  rds
    .describeDBInstances({})
    .promise()
    .then(data=>
      Promise.all(data.DBInstances.map(instance=>describeTagsFromDBInstance(rds, instance)))
    )
    .then(results=>{
      console.log(results);
      const res = [];
      results.forEach(elm=>{
        const instanceName = elm.InstanceName;
        console.log(instanceName, elm.TagList);
        res.push(instanceName);
      });
      console.log('Answer', res);
      return Promise.resolve(res);
    })
    .catch(err => {
      console.log('WWWWWWWWWWWW');
      Promise.reject(err);
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