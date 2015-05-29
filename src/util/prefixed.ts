'use strict';

var windowRef = window;
var FUNCTION_BIND_AVAILABLE = !!(Function.prototype.bind);

var VENDOR_PREFIXES:string[] = [
    "webkit",
    "Webkit",
    "ms",
    "Moz",
    "moz",
    "O",
    "o",
];

var prefixesLen = VENDOR_PREFIXES.length;

/**
 * Capitalizes the first character of the given string
 */
function capitalizeName(name:string):string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Goes through the various vendor prefixes and attempts to find a property on the given object with a prefixed
 * variation of the given property name.
 *
 * Will return undefined if it cannot find any version of the property.
 */
function findPrefixedObject<T>(name:string, obj:any):T {
    if (name.length !== 0) {
        var unprefixedName = capitalizeName(name);
        for (var i = 0; i < prefixesLen; i++) {
            var tmp = obj[VENDOR_PREFIXES[i] + unprefixedName];
            if (typeof tmp !== "undefined") {
                return tmp;
            }
        }
    }

    return undefined;
}

/**
 * Poor mans version of Modernizr.prefixed, it will attempt to find a potentially vendor-prefixed property on a given
 * object.
 *
 * @param {string} str name of the property to look for
 * @param {object} obj object in which the property will be searched for, if undefined will use the window object.
 * @param {object} scope if a function is found, it will be bound to this object before being returned.
 */
function Prefixed<T>(str:string, obj:any = windowRef, scope:any = obj):T {
    var target = obj[str];

    if (typeof target === "undefined") {
        //Attempt to find prefixed version
        target = findPrefixedObject(str, obj);
    }

    if (typeof target === "function" && FUNCTION_BIND_AVAILABLE) {
        return (<Function>target).bind(scope);
    } else {
        return target;
    }
}

export = Prefixed;