/// <reference path="../decl/Dict.d.ts" />
'use strict';

import forEach = require('./foreach');

/**
 * Create a copy of the given key-value map.
 *
 * Only the enumerable properties that are owned by the given map are copied.
 * The prototype chain will not be copied.
 *
 * @param {object} original map to copy.
 */
function copyMap<T>(original:Dict<T>):Dict<T> {
    var ret:Dict<T> = {};

    forEach(Object.keys(original), (key:string) => {
        ret[key] = original[key];
    });

    return ret;
}

export = copyMap;