
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

    '#count': {
      'by type': {
        '<NEW_TYPE> - no types exist': {
          "(<NEW_TYPE>)  =>  []": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              storage.count('count1', function(err, storage_response) {
                assert.deepEqual ( storage_response, [0] );
                done();
              });
            });
          }
        },

        '<NEW_TYPE> - types exist': {
          "(<NEW_TYPE>)  =>  []": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'count1', 'existing-count1-foo_1-a', spec.pack({foo: 'existing-count1-foo_1-a'}), function() {
                spec.client.set(spec.db, 'count2', 'existing-count2-foo_2-a', spec.pack({foo: 'existing-count2-foo_2-a'}), function() {
                  storage.count('count-3', function(err, storage_response) {
                    assert.deepEqual ( storage_response, [0] );
                    done();
                  });
                });
              });
            });
          }
        },

        '<EXISTING_TYPE> - types exist, 1 of specified type': {
          "(<EXISTING_TYPE>)  =>  [<VALUE>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'count1', 'existing-count1-foo_1-b', spec.pack({foo: 'existing-count1-foo_1-b'}), function() {
                spec.client.set(spec.db, 'count2', 'existing-count2-foo_1-b', spec.pack({foo: 'existing-count2-foo_1-b'}), function() {
                  storage.count('count2', function(err, storage_response) {
                    assert.deepEqual ( storage_response, [1] );
                    done();
                  });
                });
              });
            });
          }
        },

        '<EXISTING_TYPE> - types exist, * of specified type': {
          "(<EXISTING_TYPE>)  =>  [<VALUE>, <VALUE>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'count1', 'existing-count1-foo_1-c', spec.pack({foo: 'existing-count1-foo_1-c'}), function() {
                spec.client.set(spec.db, 'count2', 'existing-count2-foo_1-c', spec.pack({foo: 'existing-count2-foo_1-c'}), function() {
                  spec.client.set(spec.db, 'count2', 'existing-count2-foo_2-c', spec.pack({foo: 'existing-count2-foo_2-c'}), function() {
                    storage.count('count2', function(err, storage_response) {
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

      // REVIEW:
      //
      // 'all': {
      //   'no types exist': {
      //     "()  =>  []": function(done) {
      //       spec.client.clear(spec.db, undefined, function() {
      //         storage.count(function(err, storage_response) {
      //           assert.deepEqual ( storage_response, [] );
      //           done();
      //         });
      //       });
      //     }
      //   },
      //
      //   'types exist': {
      //     "()  =>  [<VALUE>]": function(done) {
      //       spec.client.clear(spec.db, undefined, function() {
      //         spec.client.set(spec.db, 'count1', 'existing-count1-foo_1-a', spec.pack({foo: 'existing-count1-foo_1-a'}), function() {
      //           spec.client.set(spec.db, 'count2', 'existing-count2-foo_2-a', spec.pack({foo: 'existing-count2-foo_2-a'}), function() {
      //             storage.count(function(err, storage_response) {
      //               assert.deepEqual ( storage_response, [{foo: 'existing-count1-foo_1-a'}, {foo: 'existing-count2-foo_2-a'}] );
      //               done();
      //             });
      //           });
      //         });
      //       });
      //     }
      //   }
      // }
    }

  };
};
