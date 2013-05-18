
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

    '#get': {
      'by id: one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [null]": function(done) {
            storage.get('get/new-one-foo_1-a', function(err, storage_response) {
              storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  <VALUE>": function(done) {
            spec.client.set(spec.db, 'get', 'existing-one-foo_1-a', spec.pack({foo: 'bar_1'}), function() {
              storage.get('get/existing-one-foo_1-a', function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [null]": function(done) {
            storage.get(['get/new-one-foo_1-b'], function(err, storage_response) {
              storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [<VALUE>]": function(done) {
            spec.client.set(spec.db, 'get', 'existing-one-foo_1-c', spec.pack({foo: 'bar_1'}), function() {
              storage.get(['get/existing-one-foo_1-c'], function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                done();
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // one

      'by id: many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [null, null]": function(done) {
            storage.get(['get/new-many-foo_1-a', 'get/new-many-foo_2-a'], function(err, storage_response) {
              storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
              assert.deepEqual ( storage_response, [null, null] );
              done();
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [null, <VALUE>]": function(done) {
            spec.client.set(spec.db, 'get', 'existing-many-foo_1-b', spec.pack({foo: 'bar_1'}), function() {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
                assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [<VALUE>, null]": function(done) {
            spec.client.set(spec.db, 'get', 'existing-many-foo_1-c', spec.pack({foo: 'bar_1'}), function() {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, spec.meta_fields); });
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<VALUE>, <VALUE>]": function(done) {
            spec.client.set(spec.db, 'get', 'existing-many-foo_1-d', spec.pack({foo: 'bar_1'}), function() {
              spec.client.set(spec.db, 'get', 'existing-many-foo_2-d', spec.pack({foo: 'bar_2'}), function() {
                storage.get(['get/existing-many-foo_1-d', 'get/existing-many-foo_2-d'], function(err, storage_response) {
                  storage_response = Array.create(storage_response).map(function(doc) { return Object.reject(doc, spec.meta_fields); });
                  assert.deepEqual ( storage_response, [{foo: 'bar_1'}, {foo: 'bar_2'}] );
                  done();
                });
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      }, // many

      'by type': {
        '<NEW_TYPE> - no types exist': {
          "(<NEW_TYPE>)  =>  []": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              storage.get('get', function(err, storage_response) {
                assert.deepEqual ( storage_response, [] );
                done();
              });
            });
          }
        },

        '<NEW_TYPE> - types exist': {
          "(<NEW_TYPE>)  =>  []": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              spec.client.set(spec.db, 'get1', 'existing-get1-foo_1-a', spec.pack({foo: 'existing-get1-foo_1-a'}), function() {
                spec.client.set(spec.db, 'get2', 'existing-get2-foo_2-a', spec.pack({foo: 'existing-get2-foo_2-a'}), function() {
                  storage.get('get-3', function(err, storage_response) {
                    assert.deepEqual ( storage_response, [] );
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
              spec.client.set(spec.db, 'get1', 'existing-get1-foo_1-b', spec.pack({foo: 'existing-get1-foo_1-b'}), function() {
                spec.client.set(spec.db, 'get2', 'existing-get2-foo_1-b', spec.pack({foo: 'existing-get2-foo_1-b'}), function() {
                  storage.get('get2', function(err, storage_response) {
                    storage_response = Array.create(storage_response).map(function(doc) { return Object.reject(doc, spec.meta_fields); });
                    assert.deepEqual ( storage_response, [{foo: 'existing-get2-foo_1-b'}] );
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
              spec.client.set(spec.db, 'get1', 'existing-get1-foo_1-c', spec.pack({foo: 'existing-get1-foo_1-c'}), function() {
                spec.client.set(spec.db, 'get2', 'existing-get2-foo_1-c', spec.pack({foo: 'existing-get2-foo_1-c'}), function() {
                  spec.client.set(spec.db, 'get2', 'existing-get2-foo_2-c', spec.pack({foo: 'existing-get2-foo_2-c'}), function() {
                    storage.get('get2', function(err, storage_response) {
                      storage_response = Array.create(storage_response).map(function(doc) { return Object.reject(doc, spec.meta_fields); });
                      assert.deepEqual ( storage_response, [{foo: 'existing-get2-foo_1-c'}, {foo: 'existing-get2-foo_2-c'}] );
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
      //         storage.get(function(err, storage_response) {
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
      //         spec.client.set(spec.db, 'get1', 'existing-get1-foo_1-a', spec.pack({foo: 'existing-get1-foo_1-a'}), function() {
      //           spec.client.set(spec.db, 'get2', 'existing-get2-foo_2-a', spec.pack({foo: 'existing-get2-foo_2-a'}), function() {
      //             storage.get(function(err, storage_response) {
      //               assert.deepEqual ( storage_response, [{foo: 'existing-get1-foo_1-a'}, {foo: 'existing-get2-foo_2-a'}] );
      //               done();
      //             });
      //           });
      //         });
      //       });
      //     }
      //   }
      // }
    } // #get
  }
};
