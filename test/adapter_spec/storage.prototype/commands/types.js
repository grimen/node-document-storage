
module.exports = function(spec) {
  var helper = spec.helper,
      assert = helper.assert,
      debug = helper.debug;

  var Storage = spec.module;
  var storage;

  return {
    // before: function() {
    //   storage = new Storage();

    //   // Special case for in-process-store(s).
    //   storage.on('ready', function() {
    //     process.client = storage.client;
    //   });
    // }

    '#types': {

      // TODO/REVIEW: For storages without concept of types, write a "list" of types on connect?

    }
  };
};
