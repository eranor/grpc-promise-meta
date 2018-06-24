const grpc = require('grpc');

const buildMetadata = (metadata = {}) => {
  if (metadata instanceof grpc.Metadata) {
    return metadata;
  }
  let grpcMetaData = new grpc.Metadata();
  for (let key in metadata) {
    if (!(metadata[key] === null || metadata[key] === undefined)) {
      grpcMetaData.set(key, metadata[key]);
    }
  }
  return grpcMetaData;
};

module.exports = buildMetadata;
