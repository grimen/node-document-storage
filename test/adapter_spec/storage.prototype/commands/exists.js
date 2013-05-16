
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

    '#exists': {
      'one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [false]": function(done) {
            storage.exists('exists/new-one-foo_1-a', function(err, storage_response) {
              assert.deepEqual ( storage_response, [false] );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            spec.client.set(spec.db, 'exists', 'existing-one-foo_1-a', spec.pack({foo: 'bar_1'}), function() {
              storage.exists('exists/existing-one-foo_1-a', function(err, storage_response) {
                assert.deepEqual ( storage_response, [true] );
                done();
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [false]": function(done) {
            storage.exists(['exists/new-one-foo_1-b'], function(err, storage_response) {
              assert.deepEqual ( storage_response, [false] );
              done();
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            spec.client.set(spec.db, 'exists', 'existing-one-foo_1-c', spec.pack({foo: 'bar_1'}), function() {
              storage.exists(['exists/existing-one-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [true] );
                done();
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // oned

      'many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [false, false]": function(done) {
            storage.exists(['exists/new-many-foo_1-a', 'exists/new-many-foo_2-a'], function(err, storage_response) {
              assert.deepEqual ( storage_response, [false, false] );
              done();
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            spec.client.set(spec.db, 'exists', 'existing-many-foo_1-b', spec.pack({foo: 'bar_1'}), function() {
              storage.exists(['exists/new-many-foo_1-b', 'exists/existing-many-foo_1-b'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [false, true] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
            spec.client.set(spec.db, 'exists', 'existing-many-foo_1-c', spec.pack({foo: 'bar_1'}), function() {
              storage.exists(['exists/existing-many-foo_1-c', 'exists/new-many-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [true, false] );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
            spec.client.set(spec.db, 'exists', 'existing-many-foo_1-d', spec.pack({foo: 'bar_1'}), function() {
              spec.client.set(spec.db, 'exists', 'existing-many-foo_2-d', spec.pack({foo: 'bar_2'}), function() {
                storage.exists(['exists/existing-many-foo_1-d', 'exists/existing-many-foo_2-d'], function(err, storage_response) {
                  assert.deepEqual ( storage_response, [true, true] );
                  done();
                });
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      } // many
    } // #exists
  }
};
