var Cache = (/** @lends Cache */ function() {
  'use strict';

  /**
   * Array#slice ref
   * @private
   */
  var slice = [].slice;

  /**
   * Array#indexOf shim.
   * @private
   */
  /* istanbul ignore next */
  var indexOf = ('function' === typeof [].indexOf ?
    function(arr, item) {
      return arr.indexOf(item);
    } :
    function(arr, item) {
      for (var i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] === item) {
          return i;
        }
      }
      return -1;
    });

  /**
   * List of all cache instances.
   * @static
   * @private
   */
  var instances = [];

  /**
   * Creates a new Cache.
   * @class Cache
   * @param {object} [options] - Possible options to use
   * @param {number} [options.limit=no limit] - Maximum size of the cache.
   * @param {object} [options.storage=internal storage] - Replace the
   * storage engine (localStorage, sessionStorage or any object).
   * @param {string} [options.keyPrefix=cache#{index}:] - If options.storage is
   * set, namespace all storage keys to avoid conflicts.
   * of data items stored in the storage object.
   * @param {date|timestamp} [options.expires] - Set an expiry date. After this
   * date, all items will be removed.
   * @param {maxAge} [options.maxAge] - Set the time in milliseconds for when
   * the current data items will be removed
   * @returns {Cache}
   */
  function Cache(options) {
    this.options    = options = options || {};
    this.expireHash = {};
    this.keys       = [];
    if ('object' === typeof options.storage) {
      this.webStorage = true;
      this.storage    = options.storage;
      this.keyPrefix  = (options.keyPrefix || ('cache' + instances.length)) + ':';
      retrieveWebStorageKeys.call(this);
    } else {
      this.storage   = {};
      this.keyPrefix = '';
    }
    /**
     * @memberof Cache.prototype
     * @member {number} length - Returns an integer representing the number
     * of data items stored
     */
    this.length = this.keys.length;
    this.setLimit(options.limit);
    instances.push(this);
  }

  /**
   * @lends Cache.prototype
   */
  var proto = Cache.prototype;

  /**
   * Return true if the given key is present in storage
   * @param {string} key
   * @returns {boolean}
   */
  proto.hasKey = function(key) {
    return indexOf(this.keys, '' + key) >= 0;
  };

  /**
   * When passed a key name and value, will add that key to the storage,
   * or update that key's value if it already exists (note that, in this case,
   * the key order will be updated as well).
   * Purge the storage if the number of items exceed the limit.
   * @param {string} key
   * @param {*} item
   * @param {object} [options] - Possible options to use
   * @param {date|timestamp} [options.expires] - Set an expiry date for this item. After
   * this date, the item will be removed.
   * @param {maxAge} [options.maxAge] - Set the time in milliseconds for when
   * this item will be removed.
   * @returns {Cache}
   */
  proto.setItem = function(key, item, options) {
    var expireAt = calcExpireAt(options, this.options),
        keys     = this.keys;
    key = '' + key;
    this.removeItem(key);
    if (expire.call(this, key, expireAt)) {
      if (this.webStorage) {
        if ('undefined' === typeof expireAt) {
          expireAt = '';
        }
        item = ++this.index + '_' + expireAt + ':' + item;
      }
      this.storage[this.keyPrefix + key] = item;
      keys.push(key);
      this.length = keys.length;
      purge.call(this);
    }
    return this;
  };

  /**
   * When passed a key name, will return that key's value.
   * If no value is found, return undefined or the given defaultValue.
   * @param {string} key
   * @param {*} [defaultValue]
   * @returns {*} item - /!\ The type of item will be a string if the storage is
   * localStorage or sessionStorage.
   */
  proto.getItem = function(key, defaultValue) {
    if (arguments.length < 2 || this.hasKey(key)) {
      var value = this.storage[this.keyPrefix + key];
      return this.webStorage ?
          (value ? value.substring(value.indexOf(':') + 1) : void(0)) :
          value;
    }
    return defaultValue;
  };

  /**
   * When passed a key name, will remove that key from the storage.
   * @param {string} key
   * @returns {Cache}
   */
  proto.removeItem = function(key) {
    key = '' + key;
    var keys  = this.keys,
        index = indexOf(keys, '' + key);
    if (index >= 0) {
      // Remove key from expireHash
      var h = this.expireHash,
          expireKeys;
      for (var ms in h) {
        expireKeys  = h[ms];
        index       = indexOf(expireKeys, key);
        if (index >= 0) {
          expireKeys.splice(index, 1);
          break;
        }
      }

      // Remove key + item
      keys.splice(index, 1);
      this.length = keys.length;
      delete this.storage[this.keyPrefix + key];
    }
    return this;
  };

  /**
   * Set the maximum size of the storage.
   * Remove the oldest elements if the storage limit is reached.
   * @param {number} limit A positive number
   * @returns {Cache}
   */
  proto.setLimit = function(limit) {
    limit = parseInt(limit, 10);
    if (limit >= 0) {
      this.limit = limit;
      purge.call(this);
    } else {
      delete this.limit;
    }
    return this;
  };

  /**
   * Empty all keys out of the storage.
   * @returns {Cache}
   */
  proto.clear = function() {
    if (this.webStorage) {
      deleteStorageData.call(this, this.keys);
    } else {
      this.storage = {};
    }
    this.keys   = [];
    this.length = 0;
    return this;
  };

  /**
   * Return the name of the nth key in the storage.
   * @param {number} n
   * @returns {string}
   */
  proto.key = function(n) {
    return this.keys[n];
  };

  /**
   * Invoke clear method on all Cache instances.
   * @static
   */
  Cache.clear = function() {
    for (var i = 0, len = instances.length; i < len; ++i) {
      instances[i].clear();
    }
  };

  /* istanbul ignore if */
  if ('undefined' !== typeof module && module.exports) {
    module.exports = Cache;
  }

  return Cache;

  /**
   * Iterate over the localStorage or SessionStorage keys to populate the
   * keys array.
   * @private
   */
  function retrieveWebStorageKeys() {
    var storage    = this.storage,
        keyPrefix  = this.keyPrefix,
        prefixLen  = keyPrefix.length,
        min        = Number.POSITIVE_INFINITY,
        pairs      = {},
        length     = 0,
        val, expireAt, index;
    for (var i = 0, key, len = storage.length; i < len; ++i) {
      key = storage.key(i);
      if (0 === key.indexOf(keyPrefix)) {
        val      = storage[key];
        key      = key.slice(prefixLen);
        expireAt = val.substring(val.indexOf('_') + 1, val.indexOf(':'));
        if (expire.call(this, key, parseInt(expireAt, 10))) {
          index        = parseInt(val, 10);
          pairs[index] = key;
          ++length;
          if (index < min) {
            min = index;
          }
        }
      }
    }
    pairs.length = length ? length + min : 0;
    this.index   = pairs.length - 1;
    // Build an array of values from an object, ordered by keys
    // Ex:
    // slice.call({ '4': 'four', '2': 'two', '3': 'three', length: 5 }, 2)
    // => ["two", "three", "four"]
    this.keys    = slice.call(pairs, min);
  }

  /**
   * Plan to remove the item belonging to the key at expireAt time.
   * Return true if expireAt represents a time in the future.
   * @private
   * @param key
   * @param expireAt
   * @returns {boolean}
   */
  function expire(key, expireAt) {
    if ('undefined' === typeof expireAt) {
      return true;
    }
    var now = new Date();
    if (expireAt <= now) {
      return false;
    }
    var h    = this.expireHash,
        that = this;
    if (expireAt in h) {
      h[expireAt].push(key);
    } else {
      h[expireAt] = [key];
      setTimeout(function() {
        removeItems.apply(that, h[expireAt]);
        delete h[expireAt];
      }, Math.max(0, expireAt - now));
    }
    return true;
  }

  /**
   * Check if a global or local expires or maxAge option is set and calc
   * the timestamp from it.
   * @private
   * @param {object} options
   * @param {object} [globalOptions]
   * @returns {timestamp|undefined}
   */
  function calcExpireAt(options, globalOptions) {
    if (options) {
      var expireAt;
      if (options.maxAge) {
        expireAt = new Date(new Date().getTime() + options.maxAge);
        return isNaN(expireAt) ? void(0) : +expireAt;
      }
      if (options.expires) {
        expireAt = options.expires;
        return isNaN(expireAt) ? void(0) : +expireAt;
      }
    }
    return globalOptions ? calcExpireAt(globalOptions) : void(0);
  }

  /**
   * Remove the oldest elements if the storage limit is reached.
   * @private
   */
  function purge() {
    var diff = this.length - this.limit;
    if (diff > 0) {
      deleteStorageData.call(this, this.keys.splice(0, diff));
      this.length = this.keys.length;
    }
  }

  /**
   * Remove the items associated to the keys given in params and update keys
   * and length properties. Check the presence of each key before removing.
   * @private
   */
  function removeItems() {
    var keys      = this.keys,
        keyPrefix = this.keyPrefix,
        storage   = this.storage,
        index, key;
    for (var i = 0, len = arguments.length; i < len; ++i) {
      key   = arguments[i];
      index = indexOf(keys, '' + key);
      if (index >= 0) {
        keys.splice(index, 1);
        delete storage[keyPrefix + key];
      }
    }
    this.length = keys.length;
  }

  /**
   * Remove the items associated to the array of keys given in params.
   * @param {array} keys
   * @private
   */
  function deleteStorageData(keys) {
    var storage    = this.storage,
        keyPrefix  = this.keyPrefix,
        webStorage = this.webStorage,
        key;
    for (var i = 0, len = keys.length; i < len; ++i) {
      key = keyPrefix + keys[i];
      if (!webStorage || storage[key]) {
        delete storage[key];
      }
    }
  }
})();

