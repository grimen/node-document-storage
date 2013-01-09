# NODE-DOCUMENT-STORAGE [![Build Status](https://secure.travis-ci.org/grimen/node-document-storage.png)](http://travis-ci.org/grimen/node-document-storage)

**Storage** adapter interface for [node-document](https://github.com/grimen/node-document) ODM for Node.js.

## About

Unified interface for write/read data to/from differen kinds of storages/databases.


## Adapters

* [Global](https://github.com/grimen/node-document-storage-global) *Memory*
* [FS](https://github.com/grimen/node-document-storage-fs) *FileSystem*
* [NStore](https://github.com/grimen/node-document-storage-nstore) *Memory/File/Process*
* [Memcached](https://github.com/grimen/node-document-storage-memcached)
* [Redis](https://github.com/grimen/node-document-storage-redis)
* [KyotoCabinet](https://github.com/grimen/node-document-storage-kyotocabinet)
* [MongoDB](https://github.com/grimen/node-document-storage-mongodb)
* [CouchDB](https://github.com/grimen/node-document-storage-couchdb)
* [Riak](https://github.com/grimen/node-document-storage-riak)
* [ElasticSearch](https://github.com/grimen/node-document-storage-elasticsearch)
* [AmazonS3](https://github.com/grimen/node-document-storage-amazons3)


## API

### `#set`

* `(keys, values, [callback(err, res)])`

    ```javascript
    storage.set(['post/1', 'post/2'], [{foo: 1}, {foo: 2}], function(err, res) {
      // console.log(arguments);
    });
    ```

* `(keys_values, [callback(err, res)])`

    ```javascript
    storage.set({'post/1': {foo: 1}, 'post/2': {foo: 1}}, function(err, res) {
      // console.log(arguments);
    });
    ```

### `#get`

* `(keys, [callback(err, res)])`

    ```javascript
    storage.get(['post/1', 'post/2'], function(err, res) {
      // console.log(arguments);
    });
    ```

### `#del`

* `(keys, [callback(err, res)])`

    ```javascript
    storage.del(['post/1', 'post/2'], function(err, res) {
      // console.log(arguments);
    });
    ```

### `#exists`

* `(keys, [callback(err, res)])`

    ```javascript
    storage.exists(['post/1', 'post/2'], function(err, res) {
      // console.log(arguments);
    });
    ```


## Installation

```shell
  $ npm install node-document-storage
```


## Test

**Local tests:**

```shell
  $ make test
```


## License

Released under the MIT license.

Copyright (c) [Jonas Grimfelt](http://github.com/grimen)
