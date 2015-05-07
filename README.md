Tiny-Cache
==========

[![Build Status](https://travis-ci.org/gtournie/tiny-cache.svg?branch=master)](https://travis-ci.org/gtournie/tiny-cache) 
![Dependencies](https://david-dm.org/gtournie/tiny-cache.svg)

### Description ###

Small lib (only 1.1kB gzipped and minified) which provides a key/value pair storage.

You can use it like a simple cache mechanism but you can also limit the size of
the storage, set an expiry date, or bind the storage to the localStorage or 
the  sessionStorage.

### Installation ###

npm:

$ npm install tiny-cache

bower:

$ bower install tiny-cache

### Support ###

This code works with nodejs and has been tested on the following browsers:

* Microsoft Internet Explorer for Windows, version 6.0 and higher
* Mozilla Firefox 1.0 and higher
* Apple Safari 2.0.4 and higher
* Opera 9.25 and higher
* Chrome 1.0 and higher

### Documentation ###

[Doc](DOC.md)

#### Examples ####

    // limit
    var cache = new Cache({ limit: 3 });
    cache.setItem('1', 'pear')
        .setItem('2', 'apple')
        .setItem('3', 'banana');
    
    cache.length;      /* => 3            */
    cache.getItem(1);  /* => 'pear'       */
    cache.getItem(3);  /* => 'banana'     */
        
    cache.setItem('4', 'strawberry');
    cache.length;      /* => 3             */
    cache.getItem(1);  /* => undefined    */
    cache.getItem(2)]; /* => 'strawberry' */
    
    var oneMinute = 1 * 60 * 60;
    
    // localStorage binding + maxAge &amp; expires options
    var localCache = new Cache({ storage: localStorage, maxAge: oneMinute });
    localCache.setItem(1, 'pear');
    localCache.setItem(2, 'apple', { expires: new Date(+new Date() + 2 * oneMinute) });
    localCache.setItem(3, 'banana', { maxAge: 3 * oneMinute });
    
    localCache.length;     /* => 3 */
    setTimeout(function() { localCache.length; /* => 2 */ }, oneMinute + 10);
    setTimeout(function() { localCache.length; /* => 1 */ }, 2 * oneMinute + 10);
    setTimeout(function() { localCache.length; /* => 0 */ }, 3 * oneMinute + 10);
    
    /* If you use a persistent storage (like localStorage or sessionStorage), expires 
    and maxAge options will do their jobs even if you refresh your browser */
    
    /* Example: (set keyPrefix to avoid conflicts between cache instances) */
    var localCache = new Cache({ storage: localStorage, keyPrefix: 'test' });
    localCache.setItem(1, 'orange', { maxAge: oneMinute });
    
    /* Now, refresh your browser, and: */
    var localCache = new Cache({ storage: localStorage, keyPrefix: 'test' });
    localCache.getItem(1); /* => 'orange' */
    setTimeout(function() { localCache.length; /* => 0 */ }, oneMinute + 10);



