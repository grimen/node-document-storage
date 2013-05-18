
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

    '#set': {
      'by id: one': {
        '<NEW_KEY>': {
          "(<STRING_KEY>, <VALUE>)  =>  [true]": function(done) {
            storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
              spec.client.get(spec.db, 'set', 'new-one-foo_1-a', function(client_err, client_response) {
                client_response = Array.create(client_response).map(function(doc) { return doc && spec.pack(Object.reject(typeof doc === 'string' ? spec.unpack(doc) : doc, spec.meta_fields)); });
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response[0], spec.pack({foo: 'bar_1'}) );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '[<NEW_KEY>]': {
          "([<STRING_KEY>], [<VALUE>])  =>  [true]": function(done) {
            storage.set(['set/new-one-foo_1-b'], [{foo: 'bar_1'}], function(storage_err, storage_response) {
              spec.client.get(spec.db, 'set', 'new-one-foo_1-b', function(client_err, client_response) {
                client_response = Array.create(client_response).map(function(doc) { return doc && spec.pack(Object.reject(typeof doc === 'string' ? spec.unpack(doc) : doc, spec.meta_fields)); });
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response[0], spec.pack({foo: 'bar_1'}) );
                done();
              });
            });
          }
        } // [<NEW_KEY>]
      },

      'by id: many': {
        '[<NEW_KEY>, <NEW_KEY]': {
          "([<STRING_KEY_1>, <STRING_KEY_2>], [<VALUE_1>, <VALUE_2>])  =>  [true, true]": function(done) {
            storage.set(['set/new-many-foo_1-c', 'set/new-many-foo_2-c'], [{foo: 'bar_1'}, {foo: 'bar_2'}], function(storage_err, storage_response) {
              spec.client.get(spec.db, 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                spec.client.get(spec.db, 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
                  var client_response = Array.create([client_response_1, client_response_2]).map(function(doc) { return doc && spec.pack(Object.reject(typeof doc === 'string' ? spec.unpack(doc) : doc, spec.meta_fields)); });
                  assert.deepEqual ( storage_response, [true, true] );
                  assert.deepEqual ( client_response, [spec.pack({foo: 'bar_1'}), spec.pack({foo: 'bar_2'})] );
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
    } // #set
  }
};
