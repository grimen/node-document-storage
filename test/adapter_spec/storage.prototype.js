
module.exports = function(spec) {
  var helper = spec.helper,
      assert = helper.assert,
      debug = helper.debug;

  var Storage = spec.module;
  var storage;

  return {
    before: function() {
      storage = new Storage();

      // Special case for in-process-store(s).
      storage.on('ready', function() {
        process.client = storage.client;
      });
    },

    'Storage.prototype': {
      'Properties': {
        '#url': function() {
          assert.property ( storage, 'url' );
          assert.typeOf ( storage.url, 'string' );
        },

        '#options': function() {
          assert.property ( storage, 'options' );
          assert.typeOf ( storage.options, 'object' );
        },

        '#client': function() {
          assert.property ( storage, 'client' );
          assert.notTypeOf ( storage.client, 'undefined' );
        }
      }, // Properties

      'Connection/Auth': [
        require('./storage.prototype/connection')(spec)
      ],

      'Commands': [
        require('./storage.prototype/commands/get')(spec),
        require('./storage.prototype/commands/set')(spec),
        require('./storage.prototype/commands/del')(spec),
        require('./storage.prototype/commands/exists')(spec),
        require('./storage.prototype/commands/clear')(spec),
        require('./storage.prototype/commands/count')(spec)
      ]
    } // Storage.prototype
  }
}