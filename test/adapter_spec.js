var helper = require('./helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug;

// -----------------------
//  Spec: Storage
// --------------------

module.exports = function(name, spec) {
  var ENV_PREFIX = spec.module.name.toUpperCase(); // e.g. "AmazonS3" => "AMAZONS3"

  var Storage = spec.module;
  var engine = spec.engine;
  var native = spec.client;
  var pack = spec.pack || Storage.prototype.pack;
  var unpack = spec.unpack || Storage.prototype.unpack;
  var db = spec.db;
  var meta_fields = ['_id', '_type', '_rev'];
  var default_url = process.env[ENV_PREFIX + '_URL'] || spec.default_url;
  var custom_url = default_url.replace('default-test', 'custom');

  var storage;

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

    Spec[name] = {
      'new': {
        '()': function() {
          assert.instanceOf ( storage, Storage );

          Storage.reset();

          var storage2 = new Storage();

          assert.equal ( storage2.url, default_url );
          assert.typeOf ( storage2.options, 'object' );
          assert.deepEqual ( storage2.options.custom, undefined );
        },

        '("url")': function() {
          Storage.reset();

          var storage2 = new Storage(custom_url);

          assert.equal ( storage2.url, custom_url );
          assert.typeOf ( storage2.options, 'object' );
          assert.deepEqual ( storage2.options.custom, undefined );
        },

        '(options)': function() {
          Storage.reset();

          var storage2 = new Storage({custom: {foo: 'bar'}});

          assert.equal ( storage2.url, default_url );
          assert.typeOf ( storage2.options, 'object' );
          assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
        },

        '("url", options)': function() {
          Storage.reset();

          var storage2 = new Storage(custom_url, {custom: {foo: 'bar'}});

          assert.equal ( storage2.url, custom_url );

          assert.typeOf ( storage2.options, 'object' );
          assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
        }
      },

      '.klass': function() {
        assert.property ( storage, 'klass' );
        assert.equal ( storage.klass, Storage );
      },

      '.defaults': function() {
        assert.property ( Storage, 'defaults' );

        assert.equal ( Storage.defaults.url, default_url );
        assert.typeOf ( Storage.defaults.options, 'object' );
      },

      '.url': function() {
        assert.typeOf ( Storage.url, 'string' );
        assert.equal ( Storage.url, default_url );
      },

      '.options': function() {
        assert.typeOf ( Storage.options, 'object' );
      },

      '.reset()': function() {
        assert.typeOf ( Storage.reset, 'function' );

        Storage.url = custom_url;
        assert.equal ( Storage.url, custom_url );

        Storage.reset();

        assert.equal ( Storage.url, default_url );
      }
    };

    Spec[name + '.prototype'] = {
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
      },

      'Connection': {
        'auth': {
          'ERR': function(done) {
            if (!flag(process.env.NODE_DOCUMENT_TEST_AUTH)) {
              done();
              return;
            }

            var storage = new Storage(process.env[ENV_PREFIX + '_URL_UNAUTHORIZED']);

            storage.on('error', function() {});

            storage.on('ready', function(err) {
              assert.notTypeOf ( err, 'null' );

              process.nextTick(function() {
                assert.lengthOf ( storage.queue, 3 );

                assert.deepEqual ( storage.queue[0].slice(0,3), ['set', 'unauthorized/new-one-foo_1-a', {foo: 'bar_1'}] );
                assert.deepEqual ( storage.queue[1].slice(0,3), ['get', 'unauthorized/new-one-foo_1-b'] );
                assert.deepEqual ( storage.queue[2].slice(0,3), ['del', 'unauthorized/new-one-foo_1-c'] );

                done();
              });
            });

            storage.set('unauthorized/new-one-foo_1-a', {foo: 'bar_1'});
            storage.get('unauthorized/new-one-foo_1-b');
            storage.del('unauthorized/new-one-foo_1-c');
          }, // auth ERR

          'OK': function(done) {
            if (!flag(process.env.NODE_DOCUMENT_TEST_AUTH)) {
              done();
              return;
            }

            var storage = new Storage(process.env[ENV_PREFIX + '_URL_AUTHORIZED']);

            storage.on('error', function() {});

            storage.on('ready', function(err) {
              assert.typeOf ( err, 'null' );

              process.nextTick(function() {
                assert.lengthOf ( storage.queue, 0 );

                done();
              });
            });

            storage.set('authorized/new-one-foo_1-a', {foo: 'bar_1'});
            storage.get('authorized/new-one-foo_1-b');
            storage.del('authorized/new-one-foo_1-c');
          } // auth OK
        }
      },

      '#set': {
        'one': {
          '<NEW_KEY>': {
            "(<STRING_KEY>, <VALUE>)  =>  [true]": function(done) {
              storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
                native.get(db, 'set', 'new-one-foo_1-a', function(client_err, client_response) {
                  client_response = Array.create(client_response).map(function(doc) { return doc && pack(Object.reject(typeof doc === 'string' ? unpack(doc) : doc, meta_fields)); });
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response[0], pack({foo: 'bar_1'}) );
                  done();
                });
              });
            }
          }, // <NEW_KEY>

          '[<NEW_KEY>]': {
            "([<STRING_KEY>], [<VALUE>])  =>  [true]": function(done) {
              storage.set(['set/new-one-foo_1-b'], [{foo: 'bar_1'}], function(storage_err, storage_response) {
                native.get(db, 'set', 'new-one-foo_1-b', function(client_err, client_response) {
                  client_response = Array.create(client_response).map(function(doc) { return doc && pack(Object.reject(typeof doc === 'string' ? unpack(doc) : doc, meta_fields)); });
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response[0], pack({foo: 'bar_1'}) );
                  done();
                });
              });
            }
          } // [<NEW_KEY>]
        },

        'many': {
          '[<NEW_KEY>, <NEW_KEY]': {
            "([<STRING_KEY_1>, <STRING_KEY_2>], [<VALUE_1>, <VALUE_2>])  =>  [true, true]": function(done) {
              storage.set(['set/new-many-foo_1-c', 'set/new-many-foo_2-c'], [{foo: 'bar_1'}, {foo: 'bar_2'}], function(storage_err, storage_response) {
                native.get(db, 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                  native.get(db, 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
                    var client_response = Array.create([client_response_1, client_response_2]).map(function(doc) { return doc && pack(Object.reject(typeof doc === 'string' ? unpack(doc) : doc, meta_fields)); });
                    assert.deepEqual ( storage_response, [true, true] );
                    assert.deepEqual ( client_response, [pack({foo: 'bar_1'}), pack({foo: 'bar_2'})] );
                    done();
                  });
                });
              });
            }
          }, // [<NEW_KEY>, <NEW_KEY]

          '[<NEW_KEY>, <EXISTING_KEY>]': {},
          '[<EXISTING_KEY>, <NEW_KEY>]': {},
          '[<EXISTING_KEY>, <EXISTING_KEY>]': {}
        } // many
      }, // #set

      '#get': {
        'one': {
          '<NEW_KEY>': {
            "(<NEW_KEY>)  =>  [null]": function(done) {
              storage.get('get/new-one-foo_1-a', function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                assert.deepEqual ( storage_response, [null] );
                done();
              });
            }
          }, // <NEW_KEY>

          '<EXISTING_KEY>': {
            "(<EXISTING_KEY>)  =>  <VALUE>": function(done) {
              native.set(db, 'get', 'existing-one-foo_1-a', pack({foo: 'bar_1'}), function() {
                storage.get('get/existing-one-foo_1-a', function(err, storage_response) {
                  storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                  assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                  done();
                });
              });
            }
          }, // <EXISTING_KEY>

          '[<NEW_KEY>]': {
            "([<NEW_KEY>])  =>  [null]": function(done) {
              storage.get(['get/new-one-foo_1-b'], function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                assert.deepEqual ( storage_response, [null] );
                done();
              });
            }
          }, // [<NEW_KEY>]

          '[<EXISTING_KEY>]': {
            "([<EXISTING_KEY>])  =>  [<VALUE>]": function(done) {
              native.set(db, 'get', 'existing-one-foo_1-c', pack({foo: 'bar_1'}), function() {
                storage.get(['get/existing-one-foo_1-c'], function(err, storage_response) {
                  storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                  assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                  done();
                });
              });
            }
          } // [<EXISTING_KEY>]
        }, // one

        'many': {
          '[<NEW_KEY>, <NEW_KEY>]': {
            "([<NEW_KEY>, <NEW_KEY>])  =>  [null, null]": function(done) {
              storage.get(['get/new-many-foo_1-a', 'get/new-many-foo_2-a'], function(err, storage_response) {
                storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                assert.deepEqual ( storage_response, [null, null] );
                done();
              });
            }
          }, // [<NEW_KEY>, <NEW_KEY>]

          '[<NEW_KEY>, <EXISTING_KEY>]': {
            "([<NEW_KEY>, <EXISTING_KEY>])  =>  [null, <VALUE>]": function(done) {
              native.set(db, 'get', 'existing-many-foo_1-b', pack({foo: 'bar_1'}), function() {
                storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(err, storage_response) {
                  storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                  assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                  done();
                });
              });
            }
          }, // [<NEW_KEY>, <EXISTING_KEY>]

          '[<EXISTING_KEY>, <NEW_KEY>]': {
            "([<EXISTING_KEY>, <NEW_KEY>])  =>  [<VALUE>, null]": function(done) {
              native.set(db, 'get', 'existing-many-foo_1-c', pack({foo: 'bar_1'}), function() {
                storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(err, storage_response) {
                  storage_response = Array.create(storage_response).map(function(doc) { return doc && Object.reject(doc, meta_fields) });
                  assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
                  done();
                });
              });
            }
          }, // [<EXISTING_KEY>, <NEW_KEY>]

          '[<EXISTING_KEY>, <EXISTING_KEY>]': {
            "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<VALUE>, <VALUE>]": function(done) {
              native.set(db, 'get', 'existing-many-foo_1-d', pack({foo: 'bar_1'}), function() {
                native.set(db, 'get', 'existing-many-foo_2-d', pack({foo: 'bar_2'}), function() {
                  storage.get(['get/existing-many-foo_1-d', 'get/existing-many-foo_2-d'], function(err, storage_response) {
                    storage_response = Array.create(storage_response).map(function(doc) { return Object.reject(doc, meta_fields) });
                    assert.deepEqual ( storage_response, [{foo: 'bar_1'}, {foo: 'bar_2'}] );
                    done();
                  });
                });
              });
            }
          } // [<EXISTING_KEY>, <EXISTING_KEY>]
        } // many
      }, // #get

      '#del': {
        'one': {
          '<NEW_KEY>': {
            "(<NEW_KEY>)  =>  [false]": function(done) {
              storage.del('del/new-one-foo_1-a', function(storage_err, storage_response) {
                native.get(db, 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [false] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            }
          }, // <NEW_KEY>

          '<EXISTING_KEY>': {
            "(<EXISTING_KEY>)  =>  [true]": function(done) {
              native.set(db, 'del', 'existing-one-foo_1-b', pack({foo: 'bar_1'}), function() {
                storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                  native.get(db, 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
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
                native.get(db, 'del', 'new-one-foo_1-c', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [false] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            }
          }, // [<NEW_KEY>]

          '[<EXISTING_KEY>]': {
            "([<EXISTING_KEY>])  =>  [true]": function(done) {
              native.set(db, 'del', 'existing-one-foo_1-d', pack({foo: 'bar_1'}), function() {
                storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                  native.get(db, 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
                    assert.deepEqual ( storage_response, [true] );
                    assert.deepEqual ( client_response, null );
                    done();
                  });
                });
              });
            }
          } // [<EXISTING_KEY>]
        }, // one

        'many': {
          '[<NEW_KEY>, <NEW_KEY>]': {
            "([<NEW_KEY>, <NEW_KEY>])  =>  [false, false]": function(done) {
              storage.del(['del/new-many-foo_1-a', 'del/new-many-foo_2-a'], function(storage_err, storage_response) {
                native.get(db, 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                  native.get(db, 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
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
              native.set(db, 'del', 'existing-many-foo_1-b', pack({foo: 'bar_1'}), function() {
                storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                  native.get(db, 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                    native.get(db, 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
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
              native.set(db, 'del', 'existing-many-foo_1-c', pack({foo: 'bar_1'}), function() {
                storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                  native.get(db, 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                    native.get(db, 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
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
              native.set(db, 'del', 'existing-many-foo_1-d', pack({foo: 'bar_1'}), function() {
                native.set(db, 'del', 'existing-many-foo_2-d', pack({foo: 'bar_2'}), function() {
                  storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                    native.get(db, 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                      native.get(db, 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
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
        } // many
      }, // #del

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
              native.set(db, 'exists', 'existing-one-foo_1-a', pack({foo: 'bar_1'}), function() {
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
              native.set(db, 'exists', 'existing-one-foo_1-c', pack({foo: 'bar_1'}), function() {
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
              native.set(db, 'exists', 'existing-many-foo_1-b', pack({foo: 'bar_1'}), function() {
                storage.exists(['exists/new-many-foo_1-b', 'exists/existing-many-foo_1-b'], function(err, storage_response) {
                  assert.deepEqual ( storage_response, [false, true] );
                  done();
                });
              });
            }
          }, // [<NEW_KEY>, <EXISTING_KEY>]

          '[<EXISTING_KEY>, <NEW_KEY>]': {
            "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
              native.set(db, 'exists', 'existing-many-foo_1-c', pack({foo: 'bar_1'}), function() {
                storage.exists(['exists/existing-many-foo_1-c', 'exists/new-many-foo_1-c'], function(err, storage_response) {
                  assert.deepEqual ( storage_response, [true, false] );
                  done();
                });
              });
            }
          }, // [<EXISTING_KEY>, <NEW_KEY>]

          '[<EXISTING_KEY>, <EXISTING_KEY>]': {
            "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
              native.set(db, 'exists', 'existing-many-foo_1-d', pack({foo: 'bar_1'}), function() {
                native.set(db, 'exists', 'existing-many-foo_2-d', pack({foo: 'bar_2'}), function() {
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
    };

    return Spec;
  }());
};

