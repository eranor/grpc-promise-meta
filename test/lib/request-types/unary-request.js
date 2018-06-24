const grpc_promise = require('../../../lib/index');
// eslint-disable-next-line no-unused-vars
const should = require('should');

describe('Unary Request', function () {

  it('Test ok', function () {
    const client = {};
    const makeUnaryRequest = function (request, metadata, callback) {
      callback(null, request);
    };
    makeUnaryRequest.requestStream = false;
    makeUnaryRequest.responseStream = false;
    Object.setPrototypeOf(client, {
      unaryReq: makeUnaryRequest
    });
    grpc_promise.promisifyAll(client);

    return client.unaryReq()
      .sendMessage({id: 1})
      .then(res => res.id.should.equal(1));
  });

  it('Test ko', function () {
    const client = {};
    const makeUnaryRequest = function (request, metadata, callback) {
      callback('timeout');
    };
    makeUnaryRequest.requestStream = false;
    makeUnaryRequest.responseStream = false;
    Object.setPrototypeOf(client, {
      unaryReq: makeUnaryRequest
    });

    grpc_promise.promisifyAll(client);

    return client.unaryReq()
      .sendMessage({id: 1})
      .then(() => {
        throw new Error('Should not happen');
      })
      .catch(err => err.should.equal('timeout'));
  });

});
