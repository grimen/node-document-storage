var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug;

// -----------------------
//  Spec: Storage
// --------------------

module.exports = function(name, spec) {
  var ENV_PREFIX = spec.module.name.toUpperCase(); // e.g. "AmazonS3" => "AMAZONS3"

  var Storage = spec.module;
  var storage;

  spec.pack = spec.pack || Storage.prototype.pack;
  spec.unpack = spec.unpack || Storage.prototype.unpack;
  spec.db = spec.db;
  spec.meta_fields = ['_id', '_type', '_rev'];
  spec.default_url = process.env[ENV_PREFIX + '_URL'] || spec.default_url;
  spec.custom_url = spec.default_url.replace('default-test', 'custom');

  spec.helper = helper;

  process.env[ENV_PREFIX + '_URL'] = process.env[ENV_PREFIX + '_URL'] || spec.default_url;
  process.env[ENV_PREFIX + '_URL_AUTHORIZED'] = process.env[ENV_PREFIX + '_URL_AUTHORIZED'] || spec.authorized_url;
  process.env[ENV_PREFIX + '_URL_UNAUTHORIZED'] = process.env[ENV_PREFIX + '_URL_UNAUTHORIZED'] || spec.unauthorized_url;

  console.log("\n{ENV_PREFIX}_URL = %s\n{ENV_PREFIX}_URL_AUTHORIZED = %s\n{ENV_PREFIX}_URL_UNAUTHORIZED = %s".assign({ENV_PREFIX: ENV_PREFIX}), process.env[ENV_PREFIX + '_URL'], process.env[ENV_PREFIX + '_URL_AUTHORIZED'], process.env[ENV_PREFIX + '_URL_UNAUTHORIZED']);

  return (function() {
    var Spec = {};

    Spec.before = function() {
      storage = new Storage();

      // Special case for in-process-store(s).
      storage.on('ready', function() {
        process.client = storage.client;
      });
    };

    spec.before = Spec.before;

    Spec[name] = require('./adapter_spec/storage')(spec);

    Spec[name + '.prototype'] = require('./adapter_spec/storage.prototype')(spec);

    return Spec;
  }());
};

