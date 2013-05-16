var helper = require('../../helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug;

module.exports = function(spec) {
  var Storage = spec.module;
  // var storage;
  return {
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
    }
  }
};
