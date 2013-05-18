
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

    '#del': {
      'by id: one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [false]": function(done) {
            storage.del('del/new-one-foo_1-a', function(storage_err, storage_response) {
              spec.client.get(spec.db, 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            spec.client.set(spec.db, 'del', 'existing-one-foo_1-b', spec.pack({foo: 'bar_1'}), function() {
              storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                spec.client.get(spec.db, 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [false]": function(done) {
            storage.del(['del/new-one-foo_1-c'], function(storage_err, storage_response) {
              spec.client.get(spec.db, 'del', 'new-one-foo_1-c', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            spec.client.set(spec.db, 'del', 'existing-one-foo_1-d', spec.pack({foo: 'bar_1'}), function() {
              storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                spec.client.get(spec.db, 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // one

      'by id: many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [false, false]": function(done) {
            storage.del(['del/new-many-foo_1-a', 'del/new-many-foo_2-a'], function(storage_err, storage_response) {
              spec.client.get(spec.db, 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                spec.client.get(spec.db, 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [false, false] );
                  assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                  done();
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            spec.client.set(spec.db, 'del', 'existing-many-foo_1-b', spec.pack({foo: 'bar_1'}), function() {
              storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                spec.client.get(spec.db, 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                  spec.client.get(spec.db, 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [false, true] );
                    assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
            spec.client.set(spec.db, 'del', 'existing-many-foo_1-c', spec.pack({foo: 'bar_1'}), function() {
              storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                spec.client.get(spec.db, 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                  spec.client.get(spec.db, 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [true, false] );
                    assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
            spec.client.set(spec.db, 'del', 'existing-many-foo_1-d', spec.pack({foo: 'bar_1'}), function() {
              spec.client.set(spec.db, 'del', 'existing-many-foo_2-d', spec.pack({foo: 'bar_2'}), function() {
                storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  spec.client.get(spec.db, 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                    spec.client.get(spec.db, 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
                      assert.deepEqual ( storage_response, [true, true] );
                      assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                      done();
                    });
                  });
                });
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      }, // many

      'by type': {
        '<NEW_TYPE> - no types exist': {
          "(<NEW_TYPE>)  =>  [<COUNT>]": function(done) {
            spec.client.clear(spec.db, undefined, function() {
              storage.del('del1', function(err, storage_response) {
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
                  storage.del('del3', function(err, storage_response) {
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
                  storage.del('del2', function(err, storage_response) {
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
                    storage.del('del2', function(err, storage_response) {
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
              storage.del(function(err, storage_response) {
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
                  storage.del(function(err, storage_response) {
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
                  storage.del(function(err, storage_response) {
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
                    storage.del(function(err, storage_response) {
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
    } // #del
  }
};
