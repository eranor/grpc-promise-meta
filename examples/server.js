const grpc = require('grpc');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

const testSimpleSimple = function (call, callback) {
  console.log('Server: Simple Message Received = ', call.request); // Server: Simple Message Received = {id: 1}
  callback(null, call.request);
};

const testStreamSimple = function (call, callback) {
  var messages = [];
  call.on('data', function (m) {
    console.log('Server: Stream Message Received = ', m); // Server: Stream Message Received = {id: 1}
    messages.push(m);
  });
  call.on('end', function () {
    callback(null, messages.pop());
  });
};

const testSimpleStream = function (call) {
  console.log('Server: Simple Message Received = ', call.request); // Server: Simple Message Received = {id: 1}
  call.write(call.request);
  call.write(call.request);
  call.end();
};

const testStreamStream = function (call) {
  call.on('data', function (message) {
    console.log('Server: Stream Message Received = ', message); // Server: Stream Message Received = {id: 1}
    setTimeout(function () {
      call.write({
        id: message.id // IMPORTANT only for Bidirectional Stream Request
      });
    }, 10);
  });

  call.on('end', function () {
    call.end();
  });
};

main = function () {
  server = new grpc.Server();
  server.addService(test_proto.Test.service, {
    testSimpleSimple: testSimpleSimple,
    testStreamStream: testStreamStream,
    testStreamSimple: testStreamSimple,
    testSimpleStream: testSimpleStream
  });

  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
};

main();
