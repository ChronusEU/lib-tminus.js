(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TminusLib = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/// <reference path="./decl/class-list.d.ts" />
/// <reference path="./decl/ArrayLike.d.ts" />
'use strict';
var ClassList = _dereq_("class-list");
var forEach = _dereq_("./util/foreach");
var Countdown = _dereq_('./countdown/Countdown');
var ATParser = _dereq_('./parser/AttributeTemplateParser');
var DEFAULT_FINISHED_CLASS = "finished";
/**
 * This function coerces the given type to an array-like type.
 *
 * If: input is array-indexable (has .length property)
 *   => returns without change
 * Else:
 *   => return input wrapped in an Array
 */
function convertToArray(input) {
    //Implementation based on jQuery's core.isArrayLike
    var length = "length" in input && input.length;
    var isArrayLike = typeof input === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in input;
    if (isArrayLike) {
        return input;
    }
    else {
        return [input];
    }
}
/**
 * The default behaviour has the following steps:
 * * Add default behavior for adding a 'finished' class to the roots once finished.
 * * If specified, add callback to remove 'loading' class from roots.
 * * Create a "data-*"-based parser with the given options.
 * * Parse the given roots with the parser and create the countdown looper.
 * * Return the controls for the created looper.
 */
function createCountdown(milliSeconds, roots, options) {
    var rootArray = convertToArray(roots);
    //Default behavior, add class on finish
    var oldFinishedCallback = options.finishedCallback;
    options.finishedCallback = function () {
        var clazz = options.finishedClass || DEFAULT_FINISHED_CLASS;
        //Add class to all root elements
        forEach(rootArray, function (elem) {
            ClassList(elem).add(clazz);
        });
        //If there was a callback, invoke it
        if (oldFinishedCallback) {
            oldFinishedCallback();
        }
    };
    //Default behavior, remove loading class once loaded
    if (options.loadingClass) {
        var oldLoadedCallback = options.loadedCallback;
        options.loadedCallback = function () {
            //Remove loading class from all root elements
            forEach(rootArray, function (elem) {
                ClassList(elem).remove(options.loadingClass);
            });
            //Invoke the old callback, if it exists.
            if (oldLoadedCallback) {
                oldLoadedCallback();
            }
        };
    }
    var parser = new ATParser.AttributeTemplateParser(options);
    return Countdown.create(new Date(milliSeconds), parser.build(rootArray), options);
}
/**
 * Entry point for the library, initializes a countdown using the target DOM and moment specified in the options.
 */
function countdown(opts) {
    return createCountdown(Number(opts.endTime), opts.target, opts);
}
exports.countdown = countdown;

},{"./countdown/Countdown":4,"./parser/AttributeTemplateParser":8,"./util/foreach":13,"class-list":2}],2:[function(_dereq_,module,exports){
// contains, add, remove, toggle
var indexof = _dereq_('indexof')

module.exports = ClassList

function ClassList(elem) {
    var cl = elem.classList

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    }

    return classList

    function add(token) {
        var list = getTokens()
        if (indexof(list, token) > -1) {
            return
        }
        list.push(token)
        setTokens(list)
    }

    function remove(token) {
        var list = getTokens()
            , index = indexof(list, token)

        if (index === -1) {
            return
        }

        list.splice(index, 1)
        setTokens(list)
    }

    function contains(token) {
        return indexof(getTokens(), token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token)
            return false
        } else {
            add(token)
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens()
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length

        elem.className = list.join(" ")
        classList.length = length

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i]
        }

        delete list[length]
    }
}

function filter (arr, fn) {
    var ret = []
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i])
    }
    return ret
}

function isTruthy(value) {
    return !!value
}

},{"indexof":3}],3:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],4:[function(_dereq_,module,exports){
'use strict';
var Looper = _dereq_('./Looper');
var Period = _dereq_('../unit/Period');
var Instant = _dereq_('../unit/Instant');
var epoch = _dereq_('../util/epoch');
//Utility function to generate the toString function for the Controller
function generateToString(endInstant, getPeriod, looper) {
    return function () {
        return "Countdown{" + ("until=" + endInstant.toDate() + ",") + ("timeLeft=" + getPeriod().toSeconds() + "s,") + ("active=" + looper.isRunning()) + "}";
    };
}
/**
 * Constructs a countdown loop that will call the provided updater function each time the countdown changes.
 *
 * When the endDate is reached the countdown will automatically stop itself,
 * it will always call the updater at least once.
 *
 * If milliseconds are required for the countdown then this should be done externally.
 * The reason milliseconds are not used is that they change too rapidly to actually be useful,
 * a similar effect to an actual millisecond countdown can be reached with visual tricks.
 *
 * @param {Date} endDate moment that we will be counting down to.
 * @param {Function} updater function which will be called each time a new period is available.
 * @param {object} opts callback options to track some of the progress of the countdown.
 * @throws If the provided endDate is not a valid date.
 */
function create(endDate, updater, opts) {
    var endInstant = Instant.make(endDate);
    if (endInstant.isValid()) {
        var periodBuilder = function () {
            return Instant.make(epoch()).until(endInstant);
        };
        var prevPeriod = Period.ofMillis(Number.MAX_VALUE);
        var looper = Looper.make(function () {
            var period = periodBuilder();
            if (!period.eq(prevPeriod)) {
                prevPeriod = period;
                updater(period);
                if (period.isFinished() && opts.finishedCallback) {
                    opts.finishedCallback();
                }
            }
            return !period.isFinished();
        });
        //Begin the countdown
        looper.start();
        if (opts.loadedCallback) {
            opts.loadedCallback();
        }
        return {
            currentPeriod: periodBuilder,
            lastUpdate: function () {
                return prevPeriod;
            },
            stop: function () {
                looper.stop();
            },
            start: function () {
                //By setting prevPeriod, we force the updater to be called.
                prevPeriod = Period.ofMillis(Number.MAX_VALUE);
                looper.start();
            },
            toString: generateToString(endInstant, periodBuilder, looper)
        };
    }
    else {
        throw new Error("Invalid target date passed to countdown");
    }
}
exports.create = create;

},{"../unit/Instant":9,"../unit/Period":10,"../util/epoch":12,"./Looper":5}],5:[function(_dereq_,module,exports){
'use strict';
var RAFLooper = _dereq_('./RAFLooper');
var TimeoutLooper = _dereq_('./TimeoutLooper');
/**
 * Utility function to construct an object that implements the Looper interface and invokes the provided callback.
 *
 * Will attempt to use a RequestAnimationFrame-based Looper, falling back to a
 * Timeout-based Looper if RAF is not available.
 *
 * If the callback returns false then the Looper will stop any future invocations of the callback.
 *
 * @param cb callback that will be repeatedly invoked by the returned Looper.
 */
function make(cb) {
    if (RAFLooper.isAvailable()) {
        return new RAFLooper(cb);
    }
    else {
        return new TimeoutLooper(cb);
    }
}
exports.make = make;

},{"./RAFLooper":6,"./TimeoutLooper":7}],6:[function(_dereq_,module,exports){
'use strict';
var prefixed = _dereq_('../util/prefixed');
var rAF = prefixed('requestAnimationFrame');
var cAF = prefixed('cancelAnimationFrame') || prefixed('cancelRequestAnimationFrame');
var RAF_ENABLED = typeof rAF !== "undefined";
/**
 * Looper based on the HTML-5 RequestAnimationFrame API.
 *
 * This looper has the property that it will not be called if the browser page is hidden in some way, since it gets
 * executed before each redraw of the page.
 */
var RequestAnimationFrame = (function () {
    /**
     * Create a RAF-based Looper that will invoke the given callback.
     *
     * If the callback returns false, the Looper will cancel any future invocations.
     *
     * @param {Function} cb callback that will be invoked by this looper.
     */
    function RequestAnimationFrame(cb) {
        this.cb = cb;
        this.handle = -1;
    }
    RequestAnimationFrame.prototype.start = function () {
        var _this = this;
        //Make sure we aren't already running
        if (this.isRunning())
            return;
        //function keeps requesting the next frame until
        //the callback returns false
        var fn = function () {
            if (_this.cb() !== false) {
                _this.handle = rAF(fn);
            }
        };
        //Jump-start the loop
        fn();
    };
    RequestAnimationFrame.prototype.stop = function () {
        if (!this.isRunning())
            return;
        //Clear request and reset handle
        cAF(this.handle);
        this.handle = -1;
    };
    RequestAnimationFrame.prototype.isRunning = function () {
        return this.handle != -1;
    };
    /**
     * Determines whether the current environment supports update loops based on frame refreshes.
     *
     * If this method returns false, the RequestAnimationFrame-based Looper will fail to work.
     */
    RequestAnimationFrame.isAvailable = function () {
        return RAF_ENABLED;
    };
    return RequestAnimationFrame;
})();
module.exports = RequestAnimationFrame;

},{"../util/prefixed":14}],7:[function(_dereq_,module,exports){
'use strict';
var prefixed = _dereq_('../util/prefixed');
var pSetInterval = prefixed('setInterval');
var pClearInterval = prefixed('clearInterval');
var TIMEOUT_60_FPS_IN_MS = Math.floor(1000 / 60);
/**
 * This Looper uses the setInterval/clearInterval API as its implementation.
 *
 * The interval at which the function is called is set to {@see TIMEOUT_60_FPS_IN_MS}
 *
 * If a window is hidden then most browsers will limit the rate of invocation of this Looper to once every second.
 */
var TimeoutLooper = (function () {
    /**
     * Create a setInterval-based Looper that will invoke the given callback.
     *
     * If the callback returns false, the Looper will cancel any future invocations.
     *
     * @param {Function} cb callback that will be invoked by this looper.
     */
    function TimeoutLooper(cb) {
        this.cb = cb;
        this.handle = -1;
    }
    TimeoutLooper.prototype.start = function () {
        var _this = this;
        //Make sure we aren't already running
        if (this.isRunning())
            return;
        if (this.cb() !== false) {
            this.handle = pSetInterval(function () {
                if (_this.cb() === false) {
                    _this.stop();
                }
            }, TIMEOUT_60_FPS_IN_MS);
        }
    };
    TimeoutLooper.prototype.stop = function () {
        if (!this.isRunning())
            return;
        //Clear request and reset handle
        pClearInterval(this.handle);
        this.handle = -1;
    };
    TimeoutLooper.prototype.isRunning = function () {
        return this.handle != -1;
    };
    return TimeoutLooper;
})();
module.exports = TimeoutLooper;

},{"../util/prefixed":14}],8:[function(_dereq_,module,exports){
/// <reference path="../decl/ArrayLike.d.ts" />
/// <reference path="../decl/Dict.d.ts" />
'use strict';
var Period = _dereq_('../unit/Period');
var copyMap = _dereq_('../util/copyMap');
var forEach = _dereq_('../util/foreach');
var DOM_DISPLAY_ATTRIBUTE = "tminus-unit";
var DOM_HIDABLE_ATTRIBUTE = "tminus-hide-if-zero";
//Based on Period.TimeKey
var DEFAULT_KEY_PADDING = {
    "s": true,
    "S": true,
    "m": true,
    "M": true,
    "h": false,
    "H": false,
    "D": false
};
/**
 * If the given (positive) number is below 10, append a '0' before the number and return the string.
 */
function zeroPad(num) {
    return num < 10 ? "0" + num : "" + num;
}
/**
 * Returns the given number as a string with no further modifications.
 */
function noopZeroPad(num) {
    return "" + num;
}
/**
 * Removes all the elements at the given indexes from the given array.
 * Both the indexes array and the target array will be modified by this function.
 *
 * @param arr Target array from which elements will be removed.
 * @param indexesToRemove Array indexes that need to be removed, cannot contain duplicate indexes.
 */
function removeArrayIndexes(arr, indexesToRemove) {
    //Remove elements in reverse order, since splice
    // changes the array length and element indexes
    // for all items after the removed item.
    indexesToRemove.sort();
    for (var i = indexesToRemove.length; i--;) {
        arr.splice(indexesToRemove[i], 1);
    }
}
/**
 * Creates an updater function for the given {@link Period.TimeKey}.
 *
 * This returned callback will not attempt to update the given elements if the Period that it is provided does not
 * differ from the previous Period.
 *
 * Once the {@link Period.TimeKey} has become insignificant, this updater will be deactivated since it no longer
 * needs to be updated.
 *
 * The created callback will return false when it no longer has to be called (due to being finished)
 */
function buildUpdater(key, zeroPadFunc, dElem, hElem, insignificantHandler) {
    var previousValue = Number.NaN;
    if (dElem.length + hElem.length > 0) {
        //Reset hidden values, will be corrected in the first iteration
        forEach(hElem, function (el) { return el.style.display = ""; });
        return function (period) {
            var unit = period.getUnit(key);
            if (unit.value !== previousValue) {
                previousValue = unit.value;
                var paddedValue = zeroPadFunc(previousValue);
                forEach(dElem, function (el) { return el.innerHTML = paddedValue; });
                // Once a value is no longer significant it cannot return,
                // so the reverse case does not need to be handled
                if (!unit.significant) {
                    insignificantHandler(hElem, Period.TimeKey[key]);
                }
            }
            return unit.significant;
        };
    }
    else {
        return null;
    }
}
/**
 * The AttributeTemplateParser builds a countdown using a pre-existing DOM structure containing specific data-attribute
 * values to mark which elements need to be injected with values for the countdown.
 *
 * data-{opts.displayAttribute} specifies injection of countdown components. {@see Period.TimeKey}
 * data-{opts.hidableAttribute} specifies elements that need to be hidden once a countdown component becomes
 * insignificant.
 */
var AttributeTemplateParser = (function () {
    /**
     * Construct a data-attribute-based parser with the given options.
     *
     * @param {object} opts options to modify some parsing behaviours.
     */
    function AttributeTemplateParser(opts) {
        var _this = this;
        this.kDisplay = opts.displayAttribute || DOM_DISPLAY_ATTRIBUTE;
        this.kHidable = opts.hidableAttribute || DOM_HIDABLE_ATTRIBUTE;
        this.padKeys = copyMap(DEFAULT_KEY_PADDING);
        if (opts.zeroPadOverrides) {
            forEach(Object.keys(opts.zeroPadOverrides), function (key) {
                if (DEFAULT_KEY_PADDING[key] !== undefined) {
                    _this.padKeys[key] = opts.zeroPadOverrides[key];
                }
            });
        }
    }
    AttributeTemplateParser.prototype.build = function (roots) {
        var _this = this;
        var displayElements = [];
        var hidableElements = [];
        forEach(roots, function (el) {
            forEach(el.querySelectorAll("[data-" + _this.kDisplay + "]"), function (el) { return displayElements.push(el); });
            forEach(el.querySelectorAll("[data-" + _this.kHidable + "]"), function (el) { return hidableElements.push(el); });
        });
        var updaters = [];
        forEach(Object.keys(this.padKeys), function (key) {
            var updater = buildUpdater(Period.TimeKey[key], _this.padKeys[key] ? zeroPad : noopZeroPad, displayElements.filter(function (el) { return el.getAttribute("data-" + _this.kDisplay) === key; }), hidableElements.filter(function (el) { return el.getAttribute("data-" + _this.kHidable) === key; }), function (els) { return forEach(els, function (el) { return el.style.display = "none"; }); });
            if (updater) {
                updaters.push(updater);
            }
        });
        return function (p) {
            var toRemove = [];
            forEach(updaters, function (updater) {
                if (!updater(p)) {
                    //Updater finished, queue for removal
                    toRemove.push(updaters.indexOf(updater));
                }
            });
            if (toRemove.length) {
                //Remove the elements at the given indexes
                removeArrayIndexes(updaters, toRemove);
            }
        };
    };
    return AttributeTemplateParser;
})();
exports.AttributeTemplateParser = AttributeTemplateParser;

},{"../unit/Period":10,"../util/copyMap":11,"../util/foreach":13}],9:[function(_dereq_,module,exports){
'use strict';
var Period = _dereq_('./Period');
/**
 * An Instant represents an immutable point in time.
 *
 * It can represent any millisecond that is representable as an offset of Epoch time.
 */
var Instant = (function () {
    /**
     * Construct an instant for the given Epoch time.
     *
     * @constructor
     * @param {number} epoch milliseconds since zero epoch (midnight UTC, 1st Jan 1970)
     */
    function Instant(epoch) {
        this.epoch = epoch;
    }
    /**
     * Creates a javascript Date object that is equivalent to this instant in time.
     *
     * If this object is invalid {@see Instant#isValid}, the resulting date will be invalid as well.
     */
    Instant.prototype.toDate = function () {
        return new Date(this.epoch);
    };
    /**
     * Returns whether this instant represents a valid moment in time
     */
    Instant.prototype.isValid = function () {
        return (!isNaN(this.epoch)) && isFinite(this.epoch);
    };
    /**
     * Calculates the period of time that has to elapse relative to this instant before it passes the reference instant.
     *
     * earlier.until(later) will result in the Period until that later point.
     * later.until(earlier) will result in a zero Period, since the point in time has elapsed.
     * same.until(same) will return a zero Period.
     *
     * @param {Instant} otherInstant reference point to some future instant
     */
    Instant.prototype.until = function (otherInstant) {
        return Period.ofMillis(otherInstant.epoch - this.epoch);
    };
    /**
     * Create a new Instant that is offset from this Instant by the given Period.
     *
     * This method follow the following contract: Instant.until(Instant.add(Period)).eq(Period)
     *
     * @param {Period} period offset of the returned Instant relative to this Instant
     */
    Instant.prototype.add = function (period) {
        return Instant.make(this.epoch + period.toSeconds() * 1000);
    };
    /**
     * Factory method to create new Instant objects using either the number of milliseconds since zero epoch or
     * a javascript Date object.
     *
     * @param {number|Date} date point in time that the new Instant will refer to.
     */
    Instant.make = function (date) {
        if (typeof date === "number") {
            return new Instant(date);
        }
        else {
            return new Instant(date.getTime());
        }
    };
    return Instant;
})();
module.exports = Instant;

},{"./Period":10}],10:[function(_dereq_,module,exports){
'use strict';
/**
 * Enum which represents all the time units that can be derived from a Period
 *
 * Uppercase time units are absolute
 * Lowercase time units are relative to their parent units (e.g. minutes until last hour)
 *
 * Currently supported units: Seconds, Minutes, Hours and Days.
 *
 * @see {Period#getUnit}
 */
(function (TimeKey) {
    TimeKey[TimeKey["s"] = 0] = "s";
    TimeKey[TimeKey["S"] = 1] = "S";
    TimeKey[TimeKey["m"] = 2] = "m";
    TimeKey[TimeKey["M"] = 3] = "M";
    TimeKey[TimeKey["h"] = 4] = "h";
    TimeKey[TimeKey["H"] = 5] = "H";
    TimeKey[TimeKey["D"] = 6] = "D"; // days until zero
})(exports.TimeKey || (exports.TimeKey = {}));
var TimeKey = exports.TimeKey;
/**
 * Utility method to convert a Period in seconds into another unit of time.
 *
 * @param {number} seconds number of seconds to convert from.
 * @param {number} parentBoundary number of seconds at which the unit becomes another unit, acts as modulo.
 * @param {number} stepSize number of seconds for 1 unit.
 */
function extractUnit(seconds, parentBoundary, stepSize) {
    return { value: Math.floor((seconds % parentBoundary) / stepSize), significant: seconds >= stepSize };
}
var SECOND_IN_SECONDS = 1;
var MINUTE_IN_SECONDS = SECOND_IN_SECONDS * 60;
var HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
var DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
//Infinite for the purposes of this library
var INFINITE_SECONDS = Number.MAX_VALUE;
/**
 * A period represents an immutable positive length of time in seconds.
 *
 * This class has a number of methods to convert its length to different time scales,
 * see {@see Period#getUnit} for more information.
 */
var Period = (function () {
    /**
     * Create a period for the given length in seconds.
     * If the given length is negative it will be treated as if it was zero.
     *
     * @constructor
     * @param {number} seconds length of this period
     */
    function Period(seconds) {
        this.seconds = Math.max(seconds, 0);
    }
    /**
     * A period with a length that is above zero will not be finished, any other lengths will be finished.
     */
    Period.prototype.isFinished = function () {
        return this.seconds <= 0;
    };
    /**
     * Alias for Period.getUnit(TimeKey.S).value
     *
     * Returns the total length of this period in seconds.
     */
    Period.prototype.toSeconds = function () {
        return this.getUnit(1 /* S */).value;
    };
    /**
     * Method to convert this period into other units of time.
     *
     * See {@see TimeKey} for the supported time units.
     * This method will return {@see TimeValue} describing the value in the given time unit.
     *
     * @param {string|number} key value key to convert to, see {@see TimeKey} for possible values.
     */
    Period.prototype.getUnit = function (key) {
        var k;
        if (typeof key === "string") {
            k = TimeKey[key];
        }
        else {
            k = key;
        }
        var seconds = this.seconds;
        switch (k) {
            case 0 /* s */:
                return extractUnit(seconds, MINUTE_IN_SECONDS, SECOND_IN_SECONDS);
            case 1 /* S */:
                return extractUnit(seconds, INFINITE_SECONDS, SECOND_IN_SECONDS);
            case 2 /* m */:
                return extractUnit(seconds, HOUR_IN_SECONDS, MINUTE_IN_SECONDS);
            case 3 /* M */:
                return extractUnit(seconds, INFINITE_SECONDS, MINUTE_IN_SECONDS);
            case 4 /* h */:
                return extractUnit(seconds, DAY_IN_SECONDS, HOUR_IN_SECONDS);
            case 5 /* H */:
                return extractUnit(seconds, INFINITE_SECONDS, HOUR_IN_SECONDS);
            case 6 /* D */:
                return extractUnit(seconds, INFINITE_SECONDS, DAY_IN_SECONDS);
            default:
                return { value: NaN, significant: true };
        }
    };
    /**
     * Determines whether the given period is equal to this period in terms of length.
     *
     * @param period the other period
     */
    Period.prototype.eq = function (period) {
        return this.seconds === period.seconds;
    };
    return Period;
})();
exports.Period = Period;
/**
 * Factory method to create a period with a length equal to  the given number of milliseconds.
 *
 * Be aware that the period will be limited to a precision in seconds and will be limited to positive values.
 *
 * @param {number} milliSeconds length of the created period in milliseconds
 */
function ofMillis(milliSeconds) {
    return new Period(Math.floor(milliSeconds / 1000));
}
exports.ofMillis = ofMillis;
/**
 * Factory method to create a period with a length equal to the given number of seconds.
 *
 * Be aware that the period will be limited to positive values.
 *
 * @param {number} seconds length of the created period in seconds
 */
function ofSeconds(seconds) {
    return new Period(Math.floor(seconds));
}
exports.ofSeconds = ofSeconds;

},{}],11:[function(_dereq_,module,exports){
/// <reference path="../decl/Dict.d.ts" />
'use strict';
var forEach = _dereq_('./foreach');
/**
 * Create a copy of the given key-value map.
 *
 * Only the enumerable properties that are owned by the given map are copied.
 * The prototype chain will not be copied.
 *
 * @param {object} original map to copy.
 */
function copyMap(original) {
    var ret = {};
    forEach(Object.keys(original), function (key) {
        ret[key] = original[key];
    });
    return ret;
}
module.exports = copyMap;

},{"./foreach":13}],12:[function(_dereq_,module,exports){
'use strict';
/**
 * A utility function that returns the current number of seconds since zero epoch. (midnight UTC, 1st Jan 1970)
 *
 * This function is not implemented by the HTML5 performance API since the resolution is not required
 * and is it slower in practise than other methods: http://jsperf.com/current-date
 */
var epoch;
//Attempt Date.now, otherwise use Date.getTime fallback
if (typeof Date.now === "function") {
    epoch = Date.now;
}
else {
    epoch = function () {
        return new Date().getTime();
    };
}
module.exports = epoch;

},{}],13:[function(_dereq_,module,exports){
/// <reference path="../decl/ArrayLike.d.ts" />
'use strict';
/**
 * Utility function which will iterate through the given array and call the callback within the given scope.
 * Elements of the given array will provided to the callback in sequence.
 *
 * This method is used instead of {@see Array#forEach} since there are array-like structures which do not have
 * this method and calling the function through the prototype relies on implementation details.
 *
 * @param {Array} array array of values to iterate over
 * @param {Function} callback callback to call on each element
 * @param {object} scope scope to call the callback in, can be undefined.
 */
function forEach(array, callback, scope) {
    var length = array.length;
    for (var i = 0; i < length; i++) {
        callback.call(scope, array[i], i);
    }
}
module.exports = forEach;

},{}],14:[function(_dereq_,module,exports){
'use strict';
var windowRef = window;
var FUNCTION_BIND_AVAILABLE = !!(Function.prototype.bind);
var VENDOR_PREFIXES = [
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
function capitalizeName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}
/**
 * Goes through the various vendor prefixes and attempts to find a property on the given object with a prefixed
 * variation of the given property name.
 *
 * Will return undefined if it cannot find any version of the property.
 */
function findPrefixedObject(name, obj) {
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
function Prefixed(str, obj, scope) {
    if (obj === void 0) { obj = windowRef; }
    if (scope === void 0) { scope = obj; }
    var target = obj[str];
    if (typeof target === "undefined") {
        //Attempt to find prefixed version
        target = findPrefixedObject(str, obj);
    }
    if (typeof target === "function" && FUNCTION_BIND_AVAILABLE) {
        return target.bind(scope);
    }
    else {
        return target;
    }
}
module.exports = Prefixed;

},{}]},{},[1])(1)
});

