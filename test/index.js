var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug;

var Storage = require('../lib'),
    storage = new Storage();

process.setMaxListeners(0);

// -----------------------
//  Test
// --------------------

module.exports = {

  'Storage': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../lib') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, null );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('protocol://127.0.0.1:1234/custom');

        assert.equal ( storage2.url, 'protocol://127.0.0.1:1234/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, null );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('protocol://127.0.0.1:1234/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'protocol://127.0.0.1:1234/custom' );

        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( storage, 'klass' );
      assert.equal ( storage.klass, require('../lib') );
    },

    '.env': function() {
      assert.property ( Storage, 'env' );

      process.env.EXAMPLE_KEY = 'foo1';
      assert.deepEqual ( Storage.env('EXAMPLE_KEY'), 'foo1' );

      process.env.NODE_DOCUMENT_ENV_PREFIX = 'NODE_DOC';
      assert.deepEqual ( Storage.env('EXAMPLE_KEY'), undefined );

      process.env.NODE_DOC_EXAMPLE_KEY = 'foo2';
      assert.deepEqual ( Storage.env('EXAMPLE_KEY'), 'foo2' );
    },

    '.name': function() {
      assert.property ( Storage, 'name' );
      assert.equal ( Storage.name, 'Storage' );
    },

    '.id': function() {
      assert.property ( Storage, 'id' );

      assert.equal ( Storage.id, null );
    },

    '.protocol': function() {
      assert.property ( Storage, 'protocol' );

      assert.equal ( Storage.protocol, null );
    },

    '.defaults': function() {
      assert.property ( Storage, 'defaults' );

      assert.equal ( Storage.defaults.url, null );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.property ( Storage, 'url' );
      assert.typeOf ( Storage.url, 'null' );

      Storage.reset();

      Storage.url = 'storage://127.0.0.1:1234/store';
      assert.equal ( (new Storage()).url, 'storage://127.0.0.1:1234/store' );
    },

    '.options': function() {
      assert.property ( Storage, 'options' );
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.property ( Storage, 'reset' );
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "protocol://127.0.0.1:1234/custom";
      assert.equal ( Storage.url, "protocol://127.0.0.1:1234/custom" );

      Storage.reset();

      assert.equal ( Storage.url, null );
    }
  },

  'Storage.prototype': {
    'Properties': {
      '#name': function() {
        assert.property ( storage, 'name' );
        assert.equal ( storage.name, 'Storage' );
      },

      '#url': function() {
        assert.property ( storage, 'url' );
        assert.typeOf ( storage.url, 'null' );
      },

      '#options': function() {
        assert.property ( storage, 'options' );
        assert.typeOf ( storage.options, 'object' );
      },

      '#client': function() {
        assert.property ( storage, 'client' );
        assert.typeOf ( storage.client, 'null' );
      },

      '#ready': function() {
        assert.property ( storage, 'ready' );
        assert.typeOf ( storage.ready, 'boolean' );
      },

      '#queue': function() {
        assert.property ( storage, 'queue' );
        assert.typeOf ( storage.queue, 'array' );
      }
    },

    'Events': {
      '#on': function() {
        assert.property ( storage, 'on' );
        assert.typeOf ( storage.on, 'function' );
        assert.throws ( storage.on, Error );
      },

      '#off': function() {
        assert.property ( storage, 'off' );
        assert.typeOf ( storage.off, 'function' );
        assert.throws ( storage.off, Error );
      },

      '#emit': function() {
        assert.property ( storage, 'emit' );
        assert.typeOf ( storage.emit, 'function' );
        assert.throws ( storage.emit, Error );
      }
    },

    'Private': {
      '_push': {
        '': function() {
          assert.property ( storage, '_push' );
          assert.typeOf ( storage._push, 'function' );
        },

        '(<operation>, <args>)': function() {
          var storage = new Storage();

          assert.deepEqual ( storage.queue, [] );

          var callback = function(){};

          storage._push('set', ['post/1', {foo: 'bar'}, {}, callback]);
          storage._push('get', ['post/1', {}, callback]);
          storage._push('del', ['post/1', {}, callback]);

          assert.lengthOf ( storage.queue, 3 );

          // NOTE: For some reason this assertion fails when using `deepEqual` - didn't in the past. =S

          // assert.deepEqual (
          //   storage.queue,
          //   [
          //     ['set', 'post/1', {foo: 'bar'}, {}, callback],
          //     ['get', 'post/1', {}, callback],
          //     ['del', 'post/1', {}, callback]
          //   ]
          // );

          assert.typeOf ( storage.queue, 'array' );
          assert.lengthOf ( storage.queue, 3 );

          assert.typeOf    ( storage.queue[0], 'array' );
          assert.lengthOf  ( storage.queue[0], 5 );
          assert.deepEqual ( storage.queue[0][0], 'set' );
          assert.deepEqual ( storage.queue[0][1], 'post/1' );
          assert.deepEqual ( storage.queue[0][2], {foo: 'bar'} );
          assert.deepEqual ( storage.queue[0][3], {} );
          assert.equal     ( storage.queue[0][4], callback );

          assert.typeOf    ( storage.queue[1], 'array' );
          assert.lengthOf  ( storage.queue[1], 4 );
          assert.deepEqual ( storage.queue[1][0], 'get' );
          assert.deepEqual ( storage.queue[1][1], 'post/1' );
          assert.deepEqual ( storage.queue[1][2], {} );
          assert.equal     ( storage.queue[1][3], callback );

          assert.typeOf    ( storage.queue[2], 'array' );
          assert.lengthOf  ( storage.queue[2], 4 );
          assert.deepEqual ( storage.queue[2][0], 'del' );
          assert.deepEqual ( storage.queue[2][1], 'post/1' );
          assert.deepEqual ( storage.queue[2][2], {} );
          assert.equal     ( storage.queue[2][3], callback );
        }
      },

      '_commit': {
        '': function() {
          assert.property ( storage, '_commit' );
          assert.typeOf ( storage._commit, 'function' );
        },

        '()': function() {
          var storage = new Storage();

          assert.deepEqual ( storage.queue, [] );

          var callback = function(){};

          storage._push('set', ['post/1', {foo: 'bar'}, {}, callback]);
          storage._push('get', ['post/1', {}, callback]);
          storage._push('del', ['post/1', {}, callback]);

          assert.lengthOf ( storage.queue, 3 );

          var called = [];

          storage.set = function() {
            called.push('set');
          };
          storage.get = function() {
            called.push('get');
          };
          storage.del = function() {
            called.push('del');
          };

          storage._commit();

          assert.lengthOf ( storage.queue, 0 );
          assert.deepEqual ( called, ['set', 'get', 'del' ]);
        }
      },

      '_method': {
        '': function() {
          assert.property ( storage, '_method' );
          assert.typeOf ( storage._method, 'function' );
        }

        // TODO: Tests
      },

      '_command': {
        '': function() {
          assert.property ( storage, '_command' );
          assert.typeOf ( storage._command, 'function' );
        }

        // TODO: Tests
      },

      '_keys': {
        '': function() {
          assert.property ( storage, '_keys' );
          assert.typeOf ( storage._keys, 'function' );
        },

        '( )': function() {
          assert.deepEqual ( storage._keys(), [] );
        },

        '( [] )': function() {
          assert.deepEqual ( storage._keys([]), [] );
        },

        '( "post/1" )': function() {
          assert.deepEqual ( storage._keys("post/1"), ["post/1"] );
        },

        '( ["post/1"] )': function() {
          assert.deepEqual ( storage._keys(["post/1"]), ["post/1"] );
        },

        '( ["post/1", "post/abc"] )': function() {
          assert.deepEqual ( storage._keys(["post/1", "post/abc"]), ["post/1", "post/abc"] );
        },

        '( {"post/1": {} )': function() {
          assert.deepEqual ( storage._keys({"post/1": {}}), ["post/1"] );
        },

        '( {"post/1": {}, "post/abc": {}} )': function() {
          assert.deepEqual ( storage._keys({"post/1": {}, "post/abc": {}}), ["post/1", "post/abc"] );
        }
      },

      '_values': {
        '': function() {
          assert.property ( storage, '_values' );
          assert.typeOf ( storage._values, 'function' );
        },

        '( )': function() {
          assert.deepEqual ( storage._values(), [] );
        },

        '( [] )': function() {
          assert.deepEqual ( storage._values([]), [] );
        },

        '( {} )': function() {
          var storage = new Storage();

          storage.pack = function(v) { return JSON.stringify(v); };

          assert.deepEqual ( storage._values({foo: 'bar'}), [storage.pack({foo: 'bar'})] );
        },

        '( [{}] )': function() {
          var storage = new Storage();

          storage.pack = function(v) { return JSON.stringify(v); };

          assert.deepEqual ( storage._values([{foo: 'bar'}]), [storage.pack({foo: 'bar'})] );
        },

        '( [{}, {}] )': function() {
          var storage = new Storage();

          storage.pack = function(v) { return JSON.stringify(v); };

          assert.deepEqual ( storage._values([{foo: 'bar'}, {bar: 'foo'}]), [storage.pack({foo: 'bar'}), storage.pack({bar: 'foo'})] );
        }
      },

      '_keyvalues': {
        '': function() {
          assert.property ( storage, '_keyvalues' );
          assert.typeOf ( storage._keyvalues, 'function' );
        },

        '( )': function() {
          assert.deepEqual ( storage._keyvalues(), {} );
        },

        '( [] )': function() {
          assert.deepEqual ( storage._keyvalues(), {} );
        },

        '( [], [] )': function() {
          assert.deepEqual ( storage._keyvalues(), {} );
        },

        '( ["post/1"] )': function() {
          assert.deepEqual ( storage._keyvalues("post/1"), {"post/1": undefined} );
        },

        '( ["post/1"], [{}] )': function() {
          assert.deepEqual ( storage._keyvalues(["post/1"], [{foo: 1}]), {"post/1": {foo: 1}} );
        },

        '( ["post/1", "post/abc"], [{}] )': function() {
          assert.deepEqual ( storage._keyvalues(["post/1", "post/abc"], [{foo: 1}]), {"post/1": {foo: 1}, "post/abc": undefined} );
        },

        '( ["post/1", "post/abc"], [{}, {}] )': function() {
          assert.deepEqual ( storage._keyvalues(["post/1", "post/abc"], [{foo: 1}, {bar: 2}]), {"post/1": {foo: 1}, "post/abc": {bar: 2}} );
        }
      },

      '#_connect': {
        '': function() {
          assert.property ( storage, '_connect' );
          assert.typeOf ( storage._connect, 'function' );
        },

        'ok': function(done) {
          storage = new Storage();

          assert.equal ( storage.ready, false );
          assert.equal ( storage.authorized, false );
          assert.equal ( storage.connecting, false );

          storage._connect(function() {
            assert.equal ( storage.ready, false );
            assert.equal ( storage.authorized, false );
            assert.equal ( storage.connecting, true );

            storage.on('ready', function() {
              assert.equal ( storage.ready, true );
              assert.equal ( storage.authorized, true );
              assert.equal ( storage.connecting, false );

              done();
            });

            storage.emit('ready');
          });
        },

        'err': function(done) {
          storage = new Storage();

          assert.equal ( storage.ready, false );
          assert.equal ( storage.authorized, false );
          assert.equal ( storage.connecting, false );

          storage._connect(function() {
            assert.equal ( storage.ready, false );
            assert.equal ( storage.authorized, false );
            assert.equal ( storage.connecting, true );

            storage.on('ready', function() {
              assert.equal ( storage.ready, false );
              assert.equal ( storage.authorized, false );
              assert.equal ( storage.connecting, true );

              done();
            });

            storage.emit('ready', new Error("Boo!"));
          });
        }
      },

      '#_set': {
        '': function() {
          assert.property ( storage, '_set' );
          assert.typeOf ( storage._set, 'function' );
        },

        '(keys, values, options, callback) - where `keys` = ["<type>/<id>", ...], `values` = [{}, ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = ['post/1', 'post/abc'];
          var values = [{foo: 'foo'}, {bar: 'bar'}];
          var options = {baz: true};
          var callback = done;

          storage._set([keys, values, options, callback], function(key_values, options, done, next) {
            assert.deepEqual ( key_values, {'post/1': {foo: 'foo'}, 'post/abc': {bar: 'bar'}} );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        },

        '(keys, values, options, callback) - where `keys` = [["<type>", <id>], ...], `values` = [{}, ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = [['post', 1], ['post', 'abc']];
          var values = [{foo: 'foo'}, {bar: 'bar'}];
          var options = {baz: true};
          var callback = done;

          storage._set([keys, values, options, callback], function(key_values, options, done, next) {
            assert.deepEqual ( key_values, {'post/1': {foo: 'foo'}, 'post/abc': {bar: 'bar'}} );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        },

        '(keys_values, options, callback) - where `keys_values` = {"<type>/<id>": {}, ...}': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var key_values = {'post/1': {foo: 'foo'}, 'post/abc': {bar: 'bar'}};
          var options = {baz: true};
          var callback = done;

          storage._set([key_values, options, callback], function(key_values, options, done, next) {
            assert.deepEqual ( key_values, {'post/1': {foo: 'foo'}, 'post/abc': {bar: 'bar'}} );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        }
      },

      '#_get': {
        '': function() {
          assert.property ( storage, '_get' );
          assert.typeOf ( storage._get, 'function' );
        },

        '(keys, options, callback) - where `keys` = ["<type>/<id>", ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = ['post/1', 'post/abc'];
          var options = {baz: true};
          var callback = done;

          storage._get([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        },

        '(keys, options, callback) - where `keys` = [["<type>", <id>], ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = [['post', 1], ['post', 'abc']];
          var options = {baz: true};
          var callback = done;

          storage._get([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        }
      },

      '#_del': {
        '': function() {
          assert.property ( storage, '_del' );
          assert.typeOf ( storage._del, 'function' );
        },

        '(keys, options, callback) - where `keys` = ["<type>/<id>", ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = ['post/1', 'post/abc'];
          var options = {baz: true};
          var callback = done;

          storage._del([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        },

        '(keys, options, callback) - where `keys` = [["<type>", <id>], ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = [['post', 1], ['post', 'abc']];
          var options = {baz: true};
          var callback = done;

          storage._del([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        }
      },

      '#_exists': {
        '': function() {
          assert.property ( storage, '_exists' );
          assert.typeOf ( storage._exists, 'function' );
        },

        '(keys, options, callback) - where `keys` = ["<type>/<id>", ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = ['post/1', 'post/abc'];
          var options = {baz: true};
          var callback = done;

          storage._exists([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        },

        '(keys, options, callback) - where `keys` = [["<type>", <id>], ...]': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          storage.key = function(key) { return key; };

          var keys = [['post', 1], ['post', 'abc']];
          var options = {baz: true};
          var callback = done;

          storage._exists([keys, options, callback], function(keys, options, done, next) {
            assert.deepEqual ( keys, ['post/1', 'post/abc'] );
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );
            assert.typeOf ( next, 'function' );

            done();
          });
        }
      },

      '#_end': {
        '': function() {
          assert.property ( storage, '_end' );
          assert.typeOf ( storage._end, 'function' );
        },

        '(options, callback)': function(done) {
          var storage = new Storage();

          storage.ready = true;
          storage.authorized = true;
          storage.connecting = false;

          var options = {baz: true};
          var callback = done;

          storage._end([options, callback], function(options, done) {
            assert.deepEqual ( options, {baz: true} );
            assert.typeOf ( done, 'function' );

            done();
          });
        }
      }
    },

    'Interface': {
      '#connect': function() {
        assert.property ( storage, 'connect' );
        assert.typeOf ( storage.connect, 'function' );
        assert.throws ( storage.connect, Error );
      },

      '#path': {
        '': function() {
          assert.property ( storage, 'resource' );
          assert.typeOf ( storage.resource, 'function' );
        },

        '("post/1") + ': function() {
          storage.options = undefined;
          assert.deepEqual ( storage.resource("post/1"), {key: "post/1", type: "post", id: "1", db: undefined, ext: undefined, ns: "post", path: "post/1", trimmed: {key: "post/1", type: "post", id: "1", db: undefined, ext: undefined, ns: "post", path: "post/1"}} );
        },

        '("post/1")': function() {
          storage.options = {
            server: {
              db: "/tmp/foo"
            }
          };
          assert.deepEqual ( storage.resource("post/1"), {key: "post/1", type: "post", id: "1", db: "/tmp/foo", ext: undefined, ns: "/tmp/foo/post", path: "/tmp/foo/post/1", trimmed: {key: "post/1", type: "post", id: "1", db: "tmp/foo", ext: undefined, ns: "tmp/foo/post", path: "tmp/foo/post/1"}} );
        }
      },

      '#set': {
        '': function() {
          assert.property ( storage, 'set' );
          assert.typeOf ( storage.set, 'function' );
          assert.throws ( storage.set, Error );
        }
      },

      '#get': {
        '': function() {
          assert.property ( storage, 'get' );
          assert.typeOf ( storage.get, 'function' );
          assert.throws ( storage.get, Error );
        }
      },

      '#del': {
        '': function() {
          assert.property ( storage, 'del' );
          assert.typeOf ( storage.del, 'function' );
          assert.throws ( storage.del, Error );
        }
      },

      '#exists': {
        '': function() {
          assert.property ( storage, 'exists' );
          assert.typeOf ( storage.exists, 'function' );
          assert.throws ( storage.exists, Error );
        }
      },

      '#end': {
        '': function() {
          assert.property ( storage, 'end' );
          assert.typeOf ( storage.end, 'function' );
        }
      },

      '#pack': {
        '': function() {
          assert.property ( storage, 'pack' );
          assert.typeOf ( storage.pack, 'function' );
        },

        '(<value>)  =>  <value>  (default: noop)': function() {
          assert.deepEqual ( storage.pack({foo: 'bar'}), {foo: 'bar'} );
        }
      },

      '#unpack': {
        '': function() {
          assert.property ( storage, 'unpack' );
          assert.typeOf ( storage.unpack, 'function' );
        },

        '(<value>)  =>  <value>  (default: noop)': function() {
          assert.deepEqual ( storage.unpack(JSON.stringify({foo: 'bar'})), JSON.stringify({foo: 'bar'}) );
        }
      }
    }
  }

};
