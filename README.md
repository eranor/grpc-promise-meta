# grpc-promise-meta

This module is an extension of the original grpc-promise with the added support for passing Metadata objects for the grpc resolver.

## Table of contents

- [What's gRPC](#what-s-grpc)
- [Introduction to grpc-promise-meta](#introduction-to-grpc-promise-meta)
- [Installation](#installation)
- [API by example](#api-by-example)
  - [Proto example file](#proto-example-file)
  - [Unary Request](#unary-request)
  - [Client Stream Request](#client-stream-request)
  - [Server Stream Request](#server-stream-request)
  - [Bidirectional Stream Request](#bidirectional-stream-request)
- [MIT License](#mit-license)

## What's [gRPC](http://www.grpc.io/)?

High performance, open source, general-purpose RPC framework.

**Calling service types**

- *Simple RPC:* one single asynchronous call
- *Streaming RPC:* one stream is used for the call

**Implementations**

- *Unary Request:* One **single** message request, one **single** message response
- *Client Stream Request:* One **Writable stream** message request, one **single** message response, sent once the stream is closed
- *Server Stream Request:* One **single** message request, one **Readable stream** message response
- *Bidirectional Stream Request:* One **Duplex stream** for request and response

## Introduction to grpc-promise-meta 

GRPC promisify module for all Request/Response types: standard and stream.

This module unifies the way the grpc are implemented in NodeJS.

Depending on which kind of RPC call is implemented (simple vs streaming), we need to manage communication differently:
- *Simple RPC:* sending message and setting callbacks for responses 
- *Streaming RPC:* opening stream and managing stream events to write and read messages

The goal of **grpc-promise** is to standardize all kind of calls, whatever they are, from the client side.

## Installation

```bash
$ npm install grpc-promise-meta
```

## API by example

- Test proto file [test.proto](examples/protobuf/test.proto)
- Complete GRPC Server implementation [server.js](examples/server.js)
- All kind of GRPC Client implementations:
  - Unary Request Example [client-unary.js](examples/client-unary.js)
  - Client Stream Request Example [client-client-stream.js](examples/client-client-stream.js)
  - Server Stream Request Example [client-server-stream.js](examples/client-server-stream.js)
  - Bidirectional Stream Request Example [client-bidi-stream.js](examples/client-bidi-stream.js)

### Proto example file

Let's take a simple proto file exposing all kind of requests:

```bash
syntax = "proto3";

package test;

service Test {

    rpc TestStreamSimple (stream TestRequest) returns (TestResponse) {}
    
    rpc TestSimpleStream (TestRequest) returns (stream TestResponse) {}

    rpc TestSimpleSimple (TestRequest) returns (TestResponse) {}

    rpc TestStreamStream (stream TestRequest) returns (stream TestResponse) {}

}

message TestRequest {
    int32 id = 1;
}

message TestResponse {
    int32 id = 1;
}
```

### Unary Request

Implementation of `TestSimpleSimple` message

Server side:
```js
const grpc = require('grpc');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

const testSimpleSimple = function (call, callback) {
  console.log('Server: Simple Message Received = ', call.request); // Server: Simple Message Received = {id: 1}
  callback(null, call.request);
};

main = function () {
  server = new grpc.Server();
  server.addService(test_proto.Test.service, {
    testSimpleSimple: testSimpleSimple
  });

  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```

Client side:
```js
const grpc = require('grpc');
const grpc_promise = require('grpc-promise-meta');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

function main() {
  const client = new test_proto.Test('localhost:50052', grpc.credentials.createInsecure());
  
  grpc_promise.promisifyAll(client);
    
  client.testSimpleSimple()
    .sendMessage({id: 1})
    .then(res => {
      console.log('Client: Simple Message Received = ', res) // Client: Simple Message Received = {id: 1}
    })
    .catch(err => console.error(err))
  ;
}

main();
```

### Client Stream Request

Implementation of `TestStreamSimple` message

Server side:
```js
const grpc = require('grpc');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

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

main = function () {
  server = new grpc.Server();
  server.addService(test_proto.Test.service, {
    testStreamSimple: testStreamSimple
  });

  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```

Client side:
```js
const grpc = require('grpc');
const grpc_promise = require('grpc-promise-meta');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

function main() {
  const client = new test_proto.Test('localhost:50052', grpc.credentials.createInsecure());
  
  grpc_promise.promisifyAll(client);
    
  client.testStreamSimple()
    .sendMessage({id: 1})
    .sendMessage({id: 2})
    .sendMessage({id: 3})
    .end()
    .then(res => {
      console.log('Client: Simple Message Received = ', res); // Client: Simple Message Received = {id: 3}
    })
    .catch(err => console.error(err))
  ;
}

main();
```

### Server Stream Request

Implementation of `TestSimpleStream` message

Server side:
```js
const grpc = require('grpc');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

const testSimpleStream = function (call) {
  console.log('Server: Simple Message Received = ', call.request); // Server: Simple Message Received = {id: 1}
  call.write(call.request);
  call.write(call.request);
  call.end();
};

main = function () {
  server = new grpc.Server();
  server.addService(test_proto.Test.service, {
    testSimpleStream: testSimpleStream
  });

  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```

Client side:
```js
const grpc = require('grpc');
const grpc_promise = require('grpc-promise-meta');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

function main() {
  const client = new test_proto.Test('localhost:50052', grpc.credentials.createInsecure());
  
  grpc_promise.promisifyAll(client);
    
  client.testSimpleStream()
    .sendMessage({id: 1})
    .then(res => {
      console.log('Client: Stream Message Received = ', res); // Client: Stream Message Received = [{id: 1},{id: 1}]
    })
    .catch(err => console.error(err))
  ;
}

main();
```

### Bidirectional Stream Request

Implementation of `TestStreamStream` message

**IMPORTANT:** In order to keep track of the messages sent and to be able to callback all the requests, 
the server implementation needs to answer with the same id received   

Server side:
```js
const grpc = require('grpc');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

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
    testStreamStream: testStreamStream
  });

  server.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```

Client side:
```js
const grpc = require('grpc');
const grpc_promise = require('grpc-promise-meta');
const test_proto = grpc.load(__dirname + '/protobuf/test.proto').test;

function main() {
  const client = new test_proto.Test('localhost:50052', grpc.credentials.createInsecure());
  
  grpc_promise.promisifyAll(client, {timeout: 100}); // Optional timeout definition, defaults = 50
    
  t = client.testStreamStream();
  t.sendMessage({})
    .then(res => {
      console.log('Client: Stream Message Received = ', res); // Client: Stream Message Received = {id: 0}
    })
    .catch(err => console.error(err))
  ;
  t.sendMessage({})
    .then(res => {
      console.log('Client: Stream Message Received = ', res); // Client: Stream Message Received = {id: 1}
    })
    .catch(err => console.error(err))
  ;
  t.end();
}

main();
```

## MIT License

Copyright (c) 2017 Carles Sistare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
