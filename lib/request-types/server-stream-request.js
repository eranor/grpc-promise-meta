const buildMetadata = require('../metadata');

class ServerStreamRequest {

  constructor (client, original_function) {
    this.queue = [];
    this.client = client;
    this.original_function = original_function;
    this.server_meta;
  }

  sendMessage (content = {}, metadata = {}) {
    return new Promise((resolve, reject) => {
      this.stream = this.original_function.call(this.client, content, buildMetadata(metadata));
      this.stream.on('error', error => {
        reject(error);
      });
      this.stream.on('metadata', metadata => {
        this.metadata = metadata;
      });
      this.stream.on('data', data => {
        this.queue.push(data);
      });
      this.stream.on('end', () => {
        resolve({ response: this.queue, metadata: this.metadata });
      });
    });
  }

}

const makeServerStreamRequest = function (client, originalFunction) {
  return function () {
    return new ServerStreamRequest(client, originalFunction);
  };
};

module.exports = makeServerStreamRequest;
