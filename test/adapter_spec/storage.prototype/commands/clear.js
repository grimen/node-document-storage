
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

    '#clear': {
      'by type': {
        '<NEW_TYPE> - no types exist': {
          "(<NEW_TYPE>)  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              storage.clear('del1', function(err, storage_response) {
                assert.deepEqual ( storage_response, [0] );
                done();
              });
            });
          }
        },

        '<NEW_TYPE> - types exist': {
          "(<NEW_TYPE>)  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-allbytype-foo_1-a', spec.pack({foo: 'existing-allbytype-foo_1-a'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-allbytype-foo_2-a', spec.pack({foo: 'existing-allbytype-foo_2-a'}), function() {
                  storage.clear('del3', function(err, storage_response) {
                    assert.deepEqual ( storage_response, [0] );
                    done();
                  });
                });
              });
            });
          }
        },

        '<EXISTING_TYPE> - types exist, 1 of specified type': {
          "(<EXISTING_TYPE>)  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-allbytype-foo_1-b', spec.pack({foo: 'existing-allbytype-foo_1-b'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-bllbytype-foo_1-b', spec.pack({foo: 'existing-allbytype-foo_1-b'}), function() {
                  storage.clear('del2', function(err, storage_response) {
                    assert.deepEqual ( storage_response, [1] );
                    done();
                  });
                });
              });
            });
          }
        },

        '<EXISTING_TYPE> - types exist, * of specified type': {
          "(<EXISTING_TYPE>)  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-allbytype-foo_1-c', spec.pack({foo: 'existing-allbytype-foo_1-c'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-allbytype-foo_1-c', spec.pack({foo: 'existing-allbytype-foo_1-c'}), function() {
                  spec.client.set(spec.db, 'del2', 'existing-allbytype-foo_2-c', spec.pack({foo: 'existing-allbytype-foo_2-c'}), function() {
                    storage.clear('del2', function(err, storage_response) {
                      assert.deepEqual ( storage_response, [2] );
                      done();
                    });
                  });
                });
              });
            });
          }
        }
      },

      'all': {
        'no types exist': {
          "()  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              storage.clear(function(err, storage_response) {
                assert.deepEqual ( storage_response, [0] );
                done();
              });
            });
          }
        },

        'types exist': {
          "()  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-all-foo_1-a', spec.pack({foo: 'existing-all-foo_1-a'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-all-foo_2-a', spec.pack({foo: 'existing-all-foo_2-a'}), function() {
                  storage.clear(function(err, storage_response) {
                    assert.deepEqual ( storage_response, [0] );
                    done();
                  });
                });
              });
            });
          }
        },

        'types exist, 1 of specified type': {
          "()  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-all-foo_1-b', spec.pack({foo: 'existing-all-foo_1-b'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-bllbytype-foo_1-b', spec.pack({foo: 'existing-all-foo_1-b'}), function() {
                  storage.clear(function(err, storage_response) {
                    assert.deepEqual ( storage_response, [1] );
                    done();
                  });
                });
              });
            });
          }
        },

        'types exist, * of specified type': {
          "()  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'del1', 'existing-all-foo_1-c', spec.pack({foo: 'existing-all-foo_1-c'}), function() {
                spec.client.set(spec.db, 'del2', 'existing-all-foo_1-c', spec.pack({foo: 'existing-all-foo_1-c'}), function() {
                  spec.client.set(spec.db, 'del2', 'existing-all-foo_2-c', spec.pack({foo: 'existing-all-foo_2-c'}), function() {
                    storage.clear(function(err, storage_response) {
                      assert.deepEqual ( storage_response, [2] );
                      done();
                    });
                  });
                });
              });
            });
          }
        }
      }
    }

  };
};
