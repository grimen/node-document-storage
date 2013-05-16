var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
    sync = require('sync');

// -----------------------
//  Constructor
// --------------------

// new Storage ();
// new Storage (options);
// new Storage (url);
// new Storage (url, options);
function Storage () {
  var self = this;

  self.klass = self.klass || Storage;

  var args = fun(arguments);

  self.url = args.strings().pop() || self.klass.url || null;
  self.options = args.objects().pop() || self.klass.options || {};

  self.client = null;
  self.ready = false;
  self.authorized = false;
  self.connecting = false;
  self.queue = [];

  if (self.id) {
    self.url = self.url && self.url.replace(/^([^\:]+)\:/gmi, self.protocol || self.id);
  }

  var uri = url.parse(self.url || '');

  self.options.server = self.options.server || {};
  self.options.server.protocol = uri.protocol && uri.protocol.replace(':', '');
  self.options.server.username = uri.auth && uri.auth.split(':')[0];
  self.options.server.password = uri.auth && uri.auth.split(':')[1];
  self.options.server.hostname = uri.hostname;
  self.options.server.port = uri.port && parseInt(uri.port, 10);
  self.options.server.db = uri.pathname;

  self.options.client = self.options.client || {};

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = JSON.parse(JSON.stringify(self.options)); // BUG/FIXME: Sugar.js bug?

  self.events = new Storage.EventEmitter();

  // self.on('error', function() {});

  self.on('connect', function() {
    self.ready = false;
    self.authorized = false;
    self.connecting = true;
  });

  self.on('ready', function(err) {
    if (!err) {
      self.ready = true;
      self.authorized = true;
      self.connecting = false;

      self._commit();
    }
  });

  self.on('end', function() {
    self.ready = false;
    self.authorized = false;
    self.connecting = false;
  });

  self.on('command', function(type, args) {
    self.emit(type, args);

    if (!self.ready) {
      self._push(type, args);
    }
  });

  process.on('exit', function() {
    sync(function() {
      if (typeof self.end === 'function') {
        self.end.sync(self);
      }
    });
  });

  process.on('uncaughtException', function() {
    sync(function() {
      if (typeof self.end === 'function') {
        self.end.sync(self);
      }
    });
  });
}

// -----------------------
//  Class
// --------------------

// .env
Storage.env = function(key) {
  var prefixed_key = [this.env.prefix(), key.toUpperCase()].compact().join('_');
  return process.env[prefixed_key];
};
Storage.env.prefix = function() {
  var prefix = process.env['NODE_DOCUMENT_ENV_PREFIX'];

  prefix = /^undefined|null$/.test(prefix) ? undefined : prefix;

  return prefix;
};

// .name
Storage.__defineGetter__('name', function() {
  return this.name;
});

Storage.id = null;
Storage.protocol = null;

Storage.defaults = {
  url: null,
  options: {}
};

Storage.url = null;
Storage.options = null;

Storage.reset = function() {
  var self = this;

  if (self.defaults) {
    self.url = self.defaults.url;
    self.options = Object.clone(self.defaults.options);
  }
};

Storage.EventEmitter = require('events').EventEmitter;
// REVISIT: Storage.ConnectionPool = require('generic-pool').Pool;

// -----------------------
//  Instance
// --------------------

// .name
Storage.prototype.__defineGetter__('name', function() {
  return this.constructor.name;
});

// #on (event, listener)
Storage.prototype.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments);
  return result;
};

// #off (event, listener)
Storage.prototype.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// #emit (event, [arg1], [arg2], [...])
Storage.prototype.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
};

// #_push ([key, [options], callback])
// #_push ([keys, [options], callback])
// #_push ([key, value, [options], callback])
// #_push ([keys, values, [options], callback])
Storage.prototype._push = function(operation, args) {
  var self = this;

  args = fun(args);
  args.unshift(operation);

  self.emit('push', args, self.queue);

  self.queue = self.queue || [];
  self.queue.push(args);
};

// #commit ()
Storage.prototype._commit = function(callback) {
  var self = this, command, operation;

  self.emit('commit', self.queue);

  while ((command = self.queue.shift())) {
    operation = command.shift();
    self[operation].apply(self, command);
  }
};

// #method (name, args, execute)
Storage.prototype._method = function(name, args, execute) {
  var self = this, options, callback;

  if (!name || !args || !execute) {
    throw new Error('ArgumentError: Expected [NAME<String>, ARGS<Array>, CALLBACK<Function>] got ' + util.inspect(fun(arguments)));
  }

  args = args || [];

  self.emit(name, args);

  args = fun(args);

  var last_args = args.slice(args.length - 2);

  options = Object.extended(last_args.objects()[0] || {});
  callback = last_args.functions()[0] || function(){};

  args = args.slice(0, args.length - 2);
  args.push(options);
  args.push(callback);

  try {
    execute.apply(self, args);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #command (operation, args, args_length, execute)
Storage.prototype._command = function(operation, args, args_length, execute) {
  var self = this, options, callback;

  self.emit('command', operation, args);

  args = fun(args);

  var last_args = fun(args.slice(args_length - 2));

  options = Object.extended(last_args.objects()[0] || {});
  callback = last_args.functions()[0] || function(){};

  args = args.slice(0, args_length - 2);
  args.push(options);
  args.push(callback);

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    execute.apply(self, args);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

Storage.prototype._keys = function() {
  var self = this, args = fun(arguments);

  if (args.length === 0) {
    return [];
  }

  var keys = Array.create(args.shift());
  var contains_objects = (typeof keys[0] === 'object' && !Array.isArray(keys[0]));

  if (contains_objects) {
    keys = Object.keys(keys[0]).map(function(k) { return k; });
  }

  keys = keys.map(function(k) {
    k = Array.isArray(k) ? self.resource(k.join('/')) : self.resource(k);
    return (k && k.key) ? k.key : k;
  });

  return keys;
};

Storage.prototype._values = function() {
  var self = this, args = fun(arguments);

  if (args.length === 0) {
    return [];
  }

  var values = Array.create(args.shift());
  var convert = self.pack;

  values = values.map(function(v) { return convert(v); });

  return values;
};

Storage.prototype._keyvalues = function() {
  var args = fun(arguments);

  if (args.length === 0) {
    return {};
  }

  var keys = Array.create(args.shift());
  var values = Array.create(args.shift());

  var key_values = Object.extended({});

  keys.each(function(k, i) {
    k = k.key ? k.key : k;
    key_values[k] = values[i];
  });

  return key_values;
};

Storage.prototype._bulk = function(keys, callback, unpack) {
  var self = this;

  var bulk_operation = {
    res: {},
    next: function(key, error, result, response) {
      // console.log('Storage.prototype._bulk', error)
      var res = bulk_operation.res || {};

      res[key] = {error: error, result: result, response: response};

      if (Object.keys(res).length === keys.length) {
        var errors = [], results = [], responses = [];

        keys.each(function(k) {
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });

        // console.log('Storage.prototype._bulk #2', errors[0])
        bulk_operation.done(errors, results, responses);
      }
    },

    done: function(errors, results, responses) {
      if (unpack) {
        results = (results || []).map(function(result) {
          try {
            return result ? self.unpack(result) : null;
          } catch (e) {
            return null;
          }
        });
      }

      // console.log('Storage.prototype._bulk #3', errors[0])
      callback(errors, results, responses);
    }
  };

  return bulk_operation;
};

// #_resource (key)
Storage.prototype._resource = function(key) {
  var self = this, parts = key ? key.split('/') : [], db, ext;

  try {
    db = self.options.server.db;
  } catch (err) {}

  try {
    ext = self.options.server.extension;
  } catch (err) {}

  var path = {};

  path.key = key;
  path.type = parts[0];
  path.id = parts[1];
  path.db = db;
  path.ext = ext;
  path.ns = [path.db, path.type].compact().join('/');
  path.path = [path.db, path.type, path.id].compact().join('/');

  path.trimmed = {};

  path.trimmed.key = key;
  path.trimmed.type = path.type;
  path.trimmed.id = path.id;
  path.trimmed.db = path.db && path.db.replace(/^\//, '');
  path.trimmed.ext = path.ext;
  path.trimmed.ns = path.ns.replace(/^\//, '');
  path.trimmed.path = [path.trimmed.db, path.type, path.id].compact().join('/');

  return path;
};

// #_connect ()
Storage.prototype._connect = function(connect) {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    connect();

  } catch (err) {
    self.emit('error', err);
  }
};

// #_set ()
Storage.prototype._set = function(args, execute) {
  var self = this, offset = 4;

  // (keys, values) vs. ({key: value, key: value})
  if (args.length === 3 && typeof args[2] === 'function' && typeof Array.create(args)[0] === 'object' && !Array.isArray(args[0]) ) {
    offset = 3;
  } else {
    offset = 4;
  }

  self._command('set', args, offset, function(keys, values, options, callback) {
    if (offset === 3) {
      var _args = fun(arguments);
      var values_by_key = _args.shift();

      keys = Object.keys(values_by_key).map(function(k) { return k; });
      values = Object.keys(values_by_key).map(function(k) { return values_by_key[k]; });
      options = _args.objects()[0];
      callback = _args.functions()[0];
    }

    keys = self._keys(keys);
    values = self._values(values);

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = self._keyvalues(keys, values);

    var bulk = self._bulk(keys, callback, false);

    execute(key_values, options, bulk.done, bulk.next);
  });
};

// #_get ()
Storage.prototype._get = function(args, execute) {
  var self = this;

  self._command('get', args, 3, function(keys, options, callback) {
    keys = self._keys(keys);

    var bulk = self._bulk(keys, callback, true);

    execute(keys, options, bulk.done, bulk.next);
  });
};

// #_del ()
Storage.prototype._del = function(args, execute) {
  var self = this;

  self._command('del', args, 3, function(keys, options, callback) {
    keys = self._keys(keys);

    var bulk = self._bulk(keys, callback, false);

    execute(keys, options, bulk.done, bulk.next);
  });
};

// #_get ()
Storage.prototype._exists = function(args, execute) {
  var self = this;

  self._command('exists', args, 3, function(keys, options, callback) {
    keys = self._keys(keys);

    var bulk = self._bulk(keys, callback, false);

    execute(keys, options, bulk.done, bulk.next);
  });
};

// #_end ()
Storage.prototype._end = function(args, execute) {
  var self = this;

  if (!args || !execute) {
    throw new Error('ArgumentError: Expected [ARGS<Array>, CALLBACK<Function>] got ' + util.inspect(fun(arguments)));
  }

  self._method('end', args, execute);
};

// -----------------------
//  Interface
// --------------------

// #connect ()
Storage.prototype.connect = function() {
  throw new Error("Not implemented");

  // var self = this;

  // self._connect(function() {
  //   self.client = undefined;

  //   self.emit('ready');
  // });
};

// #resource (key)
Storage.prototype.resource = function() {
  var self = this;
  return self._resource.apply(self, arguments);
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Storage.prototype.set = function() {
  throw new Error("Not implemented");

  // var self = this;
  //
  // self._set(arguments, function(key_values, options, done) {
  //   // noop
  // });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Storage.prototype.get = function() {
  throw new Error("Not implemented");

  // var self = this;
  //
  // self._get(arguments, function(keys, options, done) {
  //   // noop
  // });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Storage.prototype.del = function() {
  throw new Error("Not implemented");

  // var self = this;
  //
  // self._del(arguments, function(keys, options, done) {
  //   // noop
  // });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
Storage.prototype.exists = function() {
  throw new Error("Not implemented");

  // var self = this;
  //
  // self._exists(arguments, function(keys, options, done) {
  //   // noop
  // });
};

// #end ()
Storage.prototype.end = function() {
  var self = this;

  self._end(arguments, function(options, done) {
    // noop
  });
};

// #unpack ()
Storage.prototype.unpack = function(value) {
  return value;
};

// #pack ()
Storage.prototype.pack = function(value) {
  return value;
};

// -----------------------
//  Export
// --------------------

Storage.Spec = require('../test/adapter_spec');

module.exports = Storage;
