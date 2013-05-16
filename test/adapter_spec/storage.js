
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

    'Storage': {
      'Construction': {
        'new': {
          '()': function() {
            assert.instanceOf ( storage, Storage );

            Storage.reset();

            var storage2 = new Storage();

            assert.equal ( storage2.url, spec.default_url );
            assert.typeOf ( storage2.options, 'object' );
            assert.deepEqual ( storage2.options.custom, undefined );
          },

          '("url")': function() {
            Storage.reset();

            var storage2 = new Storage(spec.custom_url);

            assert.equal ( storage2.url, spec.custom_url );
            assert.typeOf ( storage2.options, 'object' );
            assert.deepEqual ( storage2.options.custom, undefined );
          },

          '(options)': function() {
            Storage.reset();

            var storage2 = new Storage({custom: {foo: 'bar'}});

            assert.equal ( storage2.url, spec.default_url );
            assert.typeOf ( storage2.options, 'object' );
            assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
          },

          '("url", options)': function() {
            Storage.reset();

            var storage2 = new Storage(spec.custom_url, {custom: {foo: 'bar'}});

            assert.equal ( storage2.url, spec.custom_url );

            assert.typeOf ( storage2.options, 'object' );
            assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
          }
        }
      }, // Construction

      'Properties': {
        '.klass': function() {
          assert.property ( storage, 'klass' );
          assert.equal ( storage.klass, Storage );
        },

        '.id': function() {
          assert.property ( Storage, 'id' );

          assert.typeOf ( Storage.id, 'string' );
          assert.equal ( Storage.id, spec.id );
        },

        '.protocol': function() {
          assert.property ( Storage, 'protocol' );

          assert.equal ( Storage.protocol, spec.protocol );
        },

        '.defaults': function() {
          assert.property ( Storage, 'defaults' );

          assert.equal ( Storage.defaults.url, spec.default_url );
          assert.typeOf ( Storage.defaults.options, 'object' );
        },

        '.url': function() {
          assert.typeOf ( Storage.url, 'string' );
          assert.equal ( Storage.url, spec.default_url );
        },

        '.options': function() {
          assert.typeOf ( Storage.options, 'object' );
        }
      }, // Properties

      'Helpers': {
        '.reset()': function() {
          assert.typeOf ( Storage.reset, 'function' );

          Storage.url = spec.custom_url;
          assert.equal ( Storage.url, spec.custom_url );

          Storage.reset();

          assert.equal ( Storage.url, spec.default_url );
        }
      } // Helpers
    }
  }
}