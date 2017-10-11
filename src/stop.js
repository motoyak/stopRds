const AWS = require('aws-sdk');

module.exports = instanceId=>{
  const rds = new AWS.RDS();
  rds
    .describeDBInstances({})
    .promise()
    .then(data=>{
      return Promise.all(data.DBInstances.map(instance=>describeTagsFromDBInstance(rds, instance)));
    })
    .then(results=>{
      results.forEach(elm=>{
        console.log(elm.DBInstanceIdentifier, elm.TagList);
      });
    });
  console.log(instanceId);
};

const describeTagsFromDBInstance = (rds,DBInstance) => {
  return new Promise((resolve,reject) => {
    rds
      .listTagsForResource({ResourceName:DBInstance.DBInstanceArn}).promise()
      .then(data =>
        resolve({
          TagList: data.TagList,
          DBInstanceIdentifier:DBInstance.DBInstanceIdentifier
        })
      )
      .catch(err => reject(err));
  });
};