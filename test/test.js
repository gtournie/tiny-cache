(function() {
  var Cache = typeof require == 'function' ? require('..') : window.Cache;

  var localStorage = ('undefined' !== typeof window ? window : {}).localStorage,
      sessionStorage = ('undefined' !== typeof window ? window : {}).sessionStorage;

  var storageTypes = {
    'default':        void(0),
    'localStorage':   localStorage,
    'sessionStorage': sessionStorage
  };

  for (var type in storageTypes) {
    if (!storageTypes[type] && 'default' !== type) continue;
    (function(type) {
      var storage = ' (storage: ' + type + ')';

      QUnit.module('Cache.prototype' + storage, {
        beforeEach: function() {
          this.options = {
            storage: storageTypes[type]
          };
        },
        afterEach: function() {
          if (localStorage) {
            localStorage.clear();
          }
          if (sessionStorage) {
            sessionStorage.clear();
          }
        }
      });

      test('setItem', function() {
        var cache = new Cache(this.options);
        var returnValue = cache.setItem(4, 'four');

        equal(cache.keys.length, 1, 'keys should contain 1 element');
        equal(cache.keys[0], '4', '"4" should be inserted at index 0');
        equal(cache.getItem('4'), 'four', '"four" should be inserted at key 4');
        equal(cache.length, 1, 'storage length should be equal to 1');
        equal(cache, returnValue, 'setItem should return this');

        cache.setItem(5, 'five');
        equal(cache.keys.length, 2, 'keys should contain 2 elements');
        equal(cache.getItem('5'), 'five', '"five" should be inserted at key 5');
        equal(cache.length, 2, 'storage length should be equal to 2');

        cache.setItem(4, 'FOUR');
        equal(cache.keys.length, 2, 'keys should still contain 1 element');
        equal(cache.getItem('4'), 'FOUR', '"FOUR" should be the new value at key 4');
        deepEqual(cache.keys, ['5', '4'], '"4" key should be the last key');
        equal(cache.length, 2, 'storage length should still be equal to 2');
      });

      test('hasKey', function() {
        var cache = new Cache(this.options)
            .setItem(4, 'four')
            .setItem(5, 'five');

        equal(cache.hasKey(4), true, '"4" key should be found');
        equal(cache.hasKey('5'), true, '"5" key should be found');
        equal(cache.hasKey(7), false, '"7" key should not be found');
      });

      test('key', function() {
        var cache = new Cache(this.options)
            .setItem(4, 'four')
            .setItem(5, 'five');

        equal(cache.key(0), '4', '"4" key should be at index 0');
        equal(cache.key(1), '5', '"5" key should be at index 1');
        strictEqual(cache.key(2), void(0), 'nothing should be at index 2');

        cache.setItem(4, 'FOUR');
        deepEqual([cache.key(0), cache.key(1)], ['5', '4'], 'keys order should have changed');
        strictEqual(cache.key(2), void(0), 'nothing should still be at index 2');
      });

      test('getItem', function() {
        var cache = new Cache(this.options);
        cache.setItem(4, 'four');
        equal(cache.getItem(4), 'four', 'should return "four"');
        cache.setItem(5, 'five').setItem(6, 'six');
        equal(cache.getItem(6), 'six', 'should return "six"');
        strictEqual(cache.getItem(7), void(0), 'item with key "4" should not be found');

        equal(cache.getItem(7, 'seven'), 'seven', 'should return the defaultValue');
      });

      test('removeItem', function() {
        var cache = new Cache(this.options)
            .setItem(4, 'four')
            .setItem(5, 'five')
            .setItem(6, 'six');
        var returnValue = cache.removeItem(5);

        deepEqual(cache.keys, ['4', '6'], 'key should have been removed');
        strictEqual(cache.getItem(5), void(0), 'data item should have been removed');
        equal(cache.length, 2, 'storage length should be equal to 2');
        equal(returnValue, cache, 'removeItem should return this');

        cache.removeItem(7);
        equal(cache.keys.length, 2, 'key should not be found');
        equal(cache.length, 2, 'storage length should still be equal to 2');
      });

      test('clear', function() {
        var cache = new Cache(this.options)
            .setItem(4, 'four')
            .setItem(5, 'five')
            .setItem(6, 'six');
        var returnValue = cache.clear();

        deepEqual(cache.keys, [], 'keys should be empty');
        equal(cache, returnValue, 'clear should return this');
        equal(cache.length, 0, 'storage should be empty');
      });

      test('setLimit', function() {
        var options = this.options;
        options.limit = 3;
        var cache = new Cache(options)
            .setItem(4, 'four')
            .setItem(5, 'five')
            .setItem(6, 'six')
            .setItem(7, 'seven');

        deepEqual(cache.keys, ['5', '6', '7'], 'keys should contains 3 elements');
        equal(cache.length, 3, 'storage should contains 3 items');

        var returnValue = cache.setLimit(2);
        deepEqual(cache.keys, ['6', '7'], 'keys should contains the last 2 elements');
        var items = [cache.getItem(4), cache.getItem(5), cache.getItem(6), cache.getItem(7)];
        deepEqual(items, [void(0), void(0), 'six', 'seven'], 'storage should contains the last 2 items');
        equal(cache, returnValue, 'setLimit should return this');
      });

      test('expires', function(assert) {
        var options = this.options;
        var done = assert.async();

        var expires = new Date(+new Date() + 250);
        options.expires = expires;
        var cache = new Cache(options)
            .setItem(4, 'four')
            .setItem(5, 'five')
            .setItem(6, 'six')
            .setItem(7, 'seven')
            .setItem(8, 'height', { expires: new Date(+new Date() + 350) });

        equal(cache.length, 5, 'storage should contain 5 items');

        setTimeout(function() {
          equal(cache.length, 1, 'storage should contain 1 item');
          var items = [cache.getItem(4), cache.getItem(5), cache.getItem(6), cache.getItem(7)];
          deepEqual(items, [void(0), void(0), void(0), void(0)], 'first items should not be present');
          equal(cache.getItem(8), 'height', 'last item should still be present');
        }, 300);

        setTimeout(function() {
          equal(cache.length, 0, 'storage should be empty');
          done();
        }, 400);
      });

      test('maxAge', function(assert) {
        var options = this.options;
        var done    = assert.async();

        options.maxAge  = 250;
        var cache = new Cache(options)
            .setItem(4, 'four')
            .setItem(5, 'five', { expires: new Date(+new Date() + 450), maxAge: 550 })
            .setItem(6, 'six', { maxAge: 650 })
            .setItem(7, 'seven', { expires: new Date(+new Date() - 200) });

        equal(cache.length, 3, 'last item should not be added');

        setTimeout(function() {
          equal(cache.length, 2, 'storage should contain 2 items');
          strictEqual(cache.getItem(4), void(0), 'first item should have been removed');
        }, 300);

        setTimeout(function() {
          equal(cache.length, 2, 'local maxAge should have a higher priority than local expires');
        }, 500);

        setTimeout(function() {
          strictEqual(cache.getItem(5), void(0), 'second item should have been removed');
        }, 600);

        setTimeout(function() {
          equal(cache.length, 0, 'storage should be empty');
          done();
        }, 700);

        options.maxAge  = 250;
        options.expires = new Date(+new Date() + 350);

        var cache2 = new Cache(options)
            .setItem(4, 'four')
            .setItem(5, 'five', { maxAge: 450 });

        equal(cache2.length, 2, 'storage2 should contain 2 items');

        setTimeout(function() {
          equal(cache2.length, 1, 'global maxAge should have a higher priority than global expires');
        }, 300);

        setTimeout(function() {
          equal(cache2.length, 1, 'local maxAge should have a higher priority than global expires & maxAge');
        }, 400);

        options.maxAge  = 250;
        delete options.expires;
        var cache3 = new Cache(options)
            .setItem(4, 'four');

        setTimeout(function() {
          cache3.setItem(4, '4');

          setTimeout(function() {
            equal(cache3.length, 0, 'item should have been removed');
          }, 300);
        }, 150);

        setTimeout(function() {
          equal(cache2.length, 1, 'expiry date should have been updated');
        }, 300);
      });
    }(type));
  }

  if (localStorage && sessionStorage) {
    QUnit.module('Cache.prototype (storage: local & session)');

    test('restore data & expiry date', function(asset) {
      var done = asset.async();

      localStorage['cache-1:5'] = '4_:five';
      localStorage['cache-1:4'] = '3_:four';
      localStorage['cache-1:6'] = '2_:six';
      var cache1 = new Cache({ storage: localStorage, keyPrefix: 'cache-1' });
      deepEqual(cache1.keys, ['6', '4', '5'], 'keys should be ordered');
      equal(cache1.length, 3, 'storage should contain 3 items');
      cache1.setItem(7, 'seven');
      equal(localStorage['cache-1:7'].indexOf(5), 0, 'index should increase');

      sessionStorage['cache2:7'] = '0_' + (+new Date(+new Date() + 300)) + ':seven';
      var cache2 = new Cache({ storage: sessionStorage, keyPrefix: 'cache2' });
      equal(cache2.length, 1, 'storage2 should contain 1 item');

      setTimeout(function() {
        equal(cache2.length, 0, 'storage2 should be empty');
        done();
      }, 350);
    });
  }

  QUnit.module('Cache');

  test('clear', function() {
    var cache1 = new Cache()
        .setItem(4, 'four')
        .setItem(5, 'five');
    var cache2 = new Cache()
        .setItem(6, 'six')
        .setItem(7, 'seven');

    Cache.clear();
    deepEqual([cache1.keys.length, cache2.keys.length], [0, 0], 'all cache keys should be empty');
    var items = [cache1.getItem(4), cache1.getItem(5), cache2.getItem(6), cache2.getItem(7)];
    deepEqual(items, [void(0), void(0), void(0), void(0)], 'all storages should be empty');
    deepEqual([cache1.length, cache2.length], [0, 0], 'all storage length should be equal to 0');
  });

}());
