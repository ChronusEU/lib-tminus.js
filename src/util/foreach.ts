/// <reference path="../decl/ArrayLike.d.ts" />
'use strict';

/**
 * Utility function which will iterate through the given array and call the callback within the given scope.
 *
 * This method is used instead of {@see Array#forEach} since there are array-like structures which do not have
 * this method and calling the prototype relies on implementation details.
 *
 * @param {Array} array array of values to iterate over
 * @param {Function} callback callback to call on each element
 * @param {object} scope scope to call the callback in, can be undefined.
 */
function forEach<T>(array:ArrayLike<T>, callback:(value:T, index:number) => any, scope?:any):void {
    var length = array.length;
    for (var i = 0; i < length; i++) {
        callback.call(scope, array[i], i);
    }
}

export = forEach;