'use strict';
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;

describe('RDS lambda', ()=>{
  let event;
  let callback;
  let context;
  let lambda;
  let proxyRds;
  let stubRdsDescribeDBInstances;
  let stubRdsListTagsForResource;

  beforeEach(() => {
    event = {};
    callback = (error, result) => {
      return new Promise((resolve, reject) => {
        error ? reject(error) : resolve(result);
      });
    };
    context = {};
    proxyRds = class {
      describeDBInstances (params) {
        return {
          promise: () => {}
        };
      }
      listTagsForResource (params) {
        return {
          promise: () => {}
        };
      }

    };
    lambda = proxyquire
      .noCallThru()
      .load('../src/index', {
        'aws-sdk': {
          RDS: proxyRds
        }
      });
  });

  it('should return resolve when running successfully', () => {
    stubRdsDescribeDBInstances =
      sinon
        .stub(proxyRds.prototype, 'describeDBInstances')
        .returns({promise: () => {
          return Promise.resolve({
            DBInstances: [{
              DBInstanceIdentifier: 'LomonDB',
              DBInstanceArn: 1
            }, {
              DBInstanceIdentifier: 'OrangeDB',
              DBInstanceArn: 2
            }, {
              DBInstanceIdentifier: 'BananaDB',
              DBInstanceArn: 3
            }, {
              DBInstanceIdentifier: 'GrapeDB',
              DBInstanceArn: 4
            }]
          });
        }});
    stubRdsListTagsForResource = sinon.stub(proxyRds.prototype, 'listTagsForResource');

    stubRdsListTagsForResource
      .withArgs({ResourceName:1})
      .returns({
        promise: ()=> Promise.resolve({
          TagList: [{
            Key: 'AlwaysOff',
            Value: 'true'
          }, {
            Key: 'foo',
            Value: 'bar'
          }]
        })});

    stubRdsListTagsForResource
      .withArgs({ResourceName:2})
      .returns({
        promise: ()=> Promise.resolve({
          TagList: [{
            Key: 'AlwaysOff',
            Value: 'true'
          }, {
            Key: 'hoge',
            Value: 'moge'
          }]
        })});

    stubRdsListTagsForResource
      .withArgs({ResourceName:3})
      .returns({
        promise: ()=> Promise.resolve({
          TagList: [{
            Key: 'AlwaysOff',
            Value: 'false'
          }, {
            Key: 'poyo',
            Value: 'monyo'
          }]
        })});

    stubRdsListTagsForResource
      .withArgs({ResourceName:4})
      .returns({
        promise: ()=> Promise.resolve({
          TagList: [{
            Key: 'dummy',
            Value: 'true'
          }, {
            Key: 'age',
            Value: 'sage'
          }]
        })});

    stubRdsListTagsForResource
      .returns({
        promise: ()=> Promise.resolve({
          TagList: [{
            Key: 'AAAkey01',
            Value: 'AAAv01'
          }, {
            Key: 'key02',
            Value: 'v02'
          }]
        })});

    return expect(lambda.handler(event, context, callback)).to.be.fulfilled.then(result => {
      expect(stubRdsDescribeDBInstances.calledOnce).to.be.equal(true);
      expect(result).to.deep.equal(JSON.stringify({
        statusCode: 200,
        body: {post_title: 'aa', post_content: 'bb'}
      }));
    });
  });

});
