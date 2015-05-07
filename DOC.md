<a name="Cache"></a>
## Cache
**Kind**: global class  

* [Cache](#Cache)
  * [new Cache([options])](#new_Cache_new)
  * [.length](#Cache#length) : <code>number</code>
  * [.hasKey(key)](#Cache#hasKey) ⇒ <code>boolean</code>
  * [.setItem(key, item, [options])](#Cache#setItem) ⇒ <code>[Cache](#Cache)</code>
  * [.getItem(key, [defaultValue])](#Cache#getItem) ⇒ <code>\*</code>
  * [.removeItem(key)](#Cache#removeItem) ⇒ <code>[Cache](#Cache)</code>
  * [.setLimit(limit)](#Cache#setLimit) ⇒ <code>[Cache](#Cache)</code>
  * [.clear()](#Cache#clear) ⇒ <code>[Cache](#Cache)</code>
  * [.key(n)](#Cache#key) ⇒ <code>string</code>

<a name="new_Cache_new"></a>
### new Cache([options])
Creates a new Cache.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  |  |
| [options.limit] | <code>number</code> | <code>no limit</code> | Maximum size of the cache. |
| [options.storage] | <code>object</code> | <code>internal storage</code> | Replace the storage engine (localStorage, sessionStorage or any object). |
| [options.keyPrefix] | <code>string</code> | <code>&quot;cache#{index}:&quot;</code> | If options.storage is set, namespace all storage keys to avoid conflicts. of data items stored in the storage object. |
| [options.expires] | <code>date</code> &#124; <code>timestamp</code> |  | Set an expiry date. After this date, all items will be removed. |
| [options.maxAge] | <code>maxAge</code> |  | Set the time in milliseconds for when the current data items will be removed |

<a name="Cache#length"></a>
### cache.length : <code>number</code>
Returns an integer representing the number
of data items stored

**Kind**: instance property of <code>[Cache](#Cache)</code>  
<a name="Cache#hasKey"></a>
### cache.hasKey(key) ⇒ <code>boolean</code>
Return true if the given key is present in storage

**Kind**: instance method of <code>[Cache](#Cache)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="Cache#setItem"></a>
### cache.setItem(key, item, [options]) ⇒ <code>[Cache](#Cache)</code>
When passed a key name and value, will add that key to the storage,
or update that key's value if it already exists (note that, in this case,
the key order will be updated as well).
Purge the storage if the number of items exceed the limit.

**Kind**: instance method of <code>[Cache](#Cache)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> |  |
| item | <code>\*</code> |  |
| [options] | <code>object</code> |  |
| [options.expires] | <code>date</code> &#124; <code>timestamp</code> | Set an expiry date for this item. After this date, the item will be removed. |
| [options.maxAge] | <code>maxAge</code> | Set the time in milliseconds for when this item will be removed. |

<a name="Cache#getItem"></a>
### cache.getItem(key, [defaultValue]) ⇒ <code>\*</code>
When passed a key name, will return that key's value.
If no value is found, it will return the given defaultValue.

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>\*</code> - item - /!\ The type of item will be a string if the storage is
localStorage or sessionStorage.  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 
| [defaultValue] | <code>\*</code> | 

<a name="Cache#removeItem"></a>
### cache.removeItem(key) ⇒ <code>[Cache](#Cache)</code>
When passed a key name, will remove that key from the storage.

**Kind**: instance method of <code>[Cache](#Cache)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="Cache#setLimit"></a>
### cache.setLimit(limit) ⇒ <code>[Cache](#Cache)</code>
Set the maximum size of the storage.
Remove the oldest elements if the storage limit is reached.

**Kind**: instance method of <code>[Cache](#Cache)</code>  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | A positive number |

<a name="Cache#clear"></a>
### cache.clear() ⇒ <code>[Cache](#Cache)</code>
Empty all keys out of the storage.

**Kind**: instance method of <code>[Cache](#Cache)</code>  
<a name="Cache#key"></a>
### cache.key(n) ⇒ <code>string</code>
Return the name of the nth key in the storage.

**Kind**: instance method of <code>[Cache](#Cache)</code>  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

