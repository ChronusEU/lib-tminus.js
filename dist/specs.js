(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../typings/node/node.d.ts" />
'use strict';
//Bug in PhantomJS requires this polyfill
require("./BindPolyfill");
require("./lib.spec");
require("./unit/Instant.spec");
require("./unit/Period.spec");
require("./countdown/Countdown.spec");
require("./parser/AttributeTemplate.spec");

},{"./BindPolyfill":4,"./countdown/Countdown.spec":5,"./lib.spec":6,"./parser/AttributeTemplate.spec":7,"./unit/Instant.spec":8,"./unit/Period.spec":9}],2:[function(require,module,exports){
// contains, add, remove, toggle
var indexof = require('indexof')

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

},{"indexof":3}],3:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],4:[function(require,module,exports){
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
        }, fBound = function () {
            return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

},{}],5:[function(require,module,exports){
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
'use strict';
var Countdown = require("../../src/countdown/Countdown");
describe("Countdown", function () {
    it("should throw an error if an invalid date is passed", function () {
        expect(function () {
            Countdown.create(new Date("hi mark"), function () {
            }, {});
        }).toThrow();
    });
});

},{"../../src/countdown/Countdown":10}],6:[function(require,module,exports){
/// <reference path="../typings/jasmine/jasmine.d.ts" />
'use strict';
var lib = require('../src/lib');
describe("Library entry point", function () {
    it("should accept seconds", function () {
        expect(function () { return lib.withSeconds(0, []); }).not.toThrow();
        expect(function () { return lib.withSeconds(Date.now() / 1000, []); }).not.toThrow();
    });
    it("should accept milliseconds", function () {
        expect(function () { return lib.withMillis(0, []); }).not.toThrow();
        expect(function () { return lib.withMillis(new Date(), []); }).not.toThrow();
        expect(function () { return lib.withMillis(Date.now(), []); }).not.toThrow();
    });
});

},{"../src/lib":14}],7:[function(require,module,exports){
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/jasmine-fixture/jasmine-fixture.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
'use strict';
var ATP = require("../../src/parser/AttributeTemplateParser");
var Period = require("../../src/unit/Period");
describe("AttributeTemplateParser", function () {
    function setupDefaultTemplate(q) {
        q.affix('span[data-tminus-hide-if-zero="D"] span[data-tminus-unit="D"]');
        q.affix('span[data-tminus-unit="h"]');
        q.affix('span[data-tminus-unit="m"]');
        q.affix('span[data-tminus-unit="s"]');
    }
    function runUpdater(q, p) {
        var updater = new ATP.AttributeTemplateParser({}).build(q);
        updater(p);
    }
    function setupWithPeriod(q, p) {
        setupDefaultTemplate(q);
        runUpdater(q, p);
    }
    function expectDOMstate(node, content, visibility) {
        if (visibility !== undefined) {
            expect(node.is(":visible")).toEqual(visibility);
        }
        expect(node.text()).toEqual(content);
    }
    function setupContainer() {
        this.container = affix('.loading.countdown#countdown');
        return this.container;
    }
    beforeEach(setupContainer);
    it("should correctly mutate the DOM on invocation", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(121));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0");
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "0");
        expectDOMstate(root.find('[data-tminus-unit="m"]'), "02");
        expectDOMstate(root.find('[data-tminus-unit="s"]'), "01");
    });
    it("should correctly handle element hiding", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24 - 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0", false);
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "23", true);
    });
    it("should correctly handle element showing", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "1", true);
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "0", true);
    });
    it("should reset if a countdown template is reused.", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24 - 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0", false);
        //Run updater since the template has already been set up
        runUpdater(root, Period.ofSeconds(60 * 60 * 24 + 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "1", true);
    });
});

},{"../../src/parser/AttributeTemplateParser":15,"../../src/unit/Period":17}],8:[function(require,module,exports){
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
'use strict';
var Instant = require('../../src/unit/Instant');
var Period = require('../../src/unit/Period');
describe("Instant", function () {
    it('should allow construction with a number', function () {
        expect(function () { return Instant.make(0); }).not.toThrow();
        expect(Instant.make(0).isValid()).toEqual(true);
    });
    it('should allow construction with a Date', function () {
        expect(function () { return Instant.make(new Date()); }).not.toThrow();
        expect(Instant.make(new Date()).isValid()).toEqual(true);
    });
    it('should return correct validity values', function () {
        //Valid number
        expect(Instant.make(10).isValid()).toEqual(true);
        //Valid date
        expect(Instant.make(new Date()).isValid()).toEqual(true);
        //Invalid Number
        expect(Instant.make(Number.NaN).isValid()).toEqual(false);
        //Invalid Date
        expect(Instant.make(new Date("hi mark")).isValid()).toEqual(false);
        //Infinite values, unrepresentable as instants
        expect(Instant.make(Number.POSITIVE_INFINITY).isValid()).toEqual(false);
        expect(Instant.make(Number.NEGATIVE_INFINITY).isValid()).toEqual(false);
    });
    it("should return valid results for Instant.add", function () {
        var p = Period.ofSeconds(10);
        var i = Instant.make(121); //No second aligned instant
        var i2 = i.add(p);
        expect(i2.isValid()).toEqual(true);
        //The period between Instant and Instant.add should be equal to the original period
        expect(i.until(i2).eq(p)).toEqual(true);
    });
});

},{"../../src/unit/Instant":16,"../../src/unit/Period":17}],9:[function(require,module,exports){
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
'use strict';
var Period = require("../../src/unit/Period");
var Instant = require('../../src/unit/Instant');
function createDate(param, base) {
    if (base === void 0) { base = new Date(0); }
    var d = new Date(base.getTime());
    if (param.year)
        d.setUTCFullYear(param.year);
    if (param.month)
        d.setUTCMonth(param.month);
    if (param.day)
        d.setUTCDate(param.day);
    if (param.hour)
        d.setUTCHours(param.hour);
    if (param.minute)
        d.setUTCMinutes(param.minute);
    return d;
}
var MINUTE_IN_SECONDS = 60;
var HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
var DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
describe("Period", function () {
    it("should handle a normal situation correctly", function () {
        var testInstant = Instant.make(createDate({
            hour: 1,
            minute: 3
        }));
        var period = Instant.make(0).until(testInstant);
        var tmp;
        // seconds should be 0, but still significant
        tmp = period.getUnit(0 /* s */);
        expect(tmp.value).toEqual(0);
        expect(tmp.significant).toEqual(true);
        // minute should be 3
        tmp = period.getUnit(2 /* m */);
        expect(tmp.value).toEqual(3);
        expect(tmp.significant).toEqual(true);
        // hours should be 1
        tmp = period.getUnit(4 /* h */);
        expect(tmp.value).toEqual(1);
        expect(tmp.significant).toEqual(true);
        // days should be 0
        tmp = period.getUnit(6 /* D */);
        expect(tmp.value).toEqual(0);
        expect(tmp.significant).toEqual(false);
    });
    it("should return the correct values for .toSeconds", function () {
        //Check seconds equality
        var p = Period.ofSeconds(123);
        expect(p.toSeconds()).toEqual(123);
        //Milliseconds should get rounded down to whole seconds
        p = Period.ofMillis(2222);
        expect(p.toSeconds()).toEqual(2);
        //The returned value for absolute seconds should equal toSeconds
        expect(p.getUnit(1 /* S */).value).toEqual(p.toSeconds());
    });
    it("should be equivalently constructed", function () {
        //Ensure the equality checker is working as it should
        var p = Period.ofSeconds(123);
        expect(p.eq(p)).toEqual(true);
        expect(p.eq(Period.ofSeconds(0))).toEqual(false);
        //Different objects, same length
        expect(p.eq(Period.ofSeconds(123))).toEqual(true);
        expect(Period.ofMillis(1000).eq(Period.ofSeconds(1))).toEqual(true);
        //Are both rounded down to nearest second
        expect(Period.ofMillis(999).eq(Period.ofSeconds(0.999))).toEqual(true);
    });
    it("should not be affected by DST transitions", function () {
        // Since these tests depends on the timezone they are executed in,
        // they are only applied if the timezone of the two dates actually differ.
        function createDSTTest(param1, param2, cb) {
            var now = new Date();
            var date1 = createDate(param1, now);
            var date2 = createDate(param2, now);
            if (date1.getTimezoneOffset() !== date2.getTimezoneOffset()) {
                cb(Instant.make(date2).until(Instant.make(date1)));
            }
        }
        // DST transition for Europe
        createDSTTest({
            year: 2014,
            month: 9,
            day: 27
        }, {
            year: 2014,
            month: 9,
            day: 25
        }, function (p) {
            var tmp = p.getUnit(5 /* H */);
            // 2 day difference, if it is modified by DST changing it won't match
            expect(tmp.value).toEqual(48);
        });
        // DST transition for America
        createDSTTest({
            year: 2014,
            month: 10,
            day: 3
        }, {
            year: 2014,
            month: 10,
            day: 1
        }, function (p) {
            var tmp = p.getUnit(5 /* H */);
            // 2 day difference, if it is modified by DST changing it won't match
            expect(tmp.value).toEqual(48);
        });
    });
    it("should return true for Period.isFinished if the same instant is used on both ends", function () {
        var test = Instant.make(createDate({
            hour: 1,
            minute: 3
        }));
        expect(test.until(test).isFinished()).toEqual(true);
    });
    it("should return true for Period.isFinished if the target time is in the past", function () {
        var test = Instant.make(createDate({
            hour: 1,
            minute: 3
        }));
        var zero = Instant.make(createDate({}));
        expect(test.until(zero).isFinished()).toEqual(true);
    });
    it("should return false for Period.isFinished if the target time is in the future", function () {
        var test = Instant.make(createDate({
            hour: 1,
            minute: 3
        }));
        var zero = Instant.make(createDate({}));
        expect(zero.until(test).isFinished()).toEqual(false);
    });
    it("should correctly calculate the seconds partial", function () {
        var tmp;
        var key = 0 /* s */;
        tmp = Period.ofSeconds(-1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 seconds
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 seconds
        tmp = Period.ofSeconds(1).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 second
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(59); // 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); // 1 minute, 0 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS + 1).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 minute, 1 second
    });
    it("should correctly calculate the minutes partial", function () {
        var tmp;
        var key = 2 /* m */;
        tmp = Period.ofSeconds(-1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 minutes
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 minutes
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 minutes, 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 minute, 0 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS + 1).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 minute, 1 second
        tmp = Period.ofSeconds(HOUR_IN_SECONDS + MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 hour, 1 minute, 0 seconds
    });
    it("should correctly calculate the hours partial", function () {
        var tmp;
        var key = 4 /* h */;
        tmp = Period.ofSeconds(-1).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours, 0 minutes, 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours, 1 minute, 0 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS + 1).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours, 1 minute, 1 second
        tmp = Period.ofSeconds(HOUR_IN_SECONDS - MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); //0 hours, 59 minutes
        tmp = Period.ofSeconds(HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); //1 hour, 0 minutes
        tmp = Period.ofSeconds(HOUR_IN_SECONDS + MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); //1 hour, 1 minute
        tmp = Period.ofSeconds(DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); //1 day, 0 hours, 0 minutes
        tmp = Period.ofSeconds(DAY_IN_SECONDS + HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); //1 day, 1 hour, 0 minutes
    });
    it("should correctly calculate the days partial", function () {
        var tmp;
        var key = 6 /* D */;
        tmp = Period.ofSeconds(-1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 days
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 days
        tmp = Period.ofSeconds(DAY_IN_SECONDS - HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); // 23 hours
        tmp = Period.ofSeconds(DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 day
        tmp = Period.ofSeconds(2 * DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(2); // 2 days
    });
    it("should correctly calculate the unbounded partials", function () {
        var tmp;
        var key;
        key = 1 /* S */;
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 seconds
        tmp = Period.ofSeconds(1).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 second
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(59); // 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(60); // 60 seconds
        tmp = Period.ofSeconds(2 * MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(120); // 120 seconds
        key = 3 /* M */;
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 minutes, 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 minute, 0 seconds
        tmp = Period.ofSeconds(HOUR_IN_SECONDS + MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(61); // 61 minute, 0 seconds
        key = 5 /* H */;
        tmp = Period.ofSeconds(HOUR_IN_SECONDS - MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 hours, 59 minutes
        tmp = Period.ofSeconds(HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 hour, 0 minutes
        tmp = Period.ofSeconds(2 * HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(2); // 2 hours, 0 minutes
        tmp = Period.ofSeconds(DAY_IN_SECONDS + HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(25); // 25 hours, 0 minutes
        key = 6 /* D */;
        tmp = Period.ofSeconds(-1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 days
        tmp = Period.ofSeconds(0).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 days
        tmp = Period.ofSeconds(DAY_IN_SECONDS - HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 days, 23 hours
        tmp = Period.ofSeconds(DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 day
        tmp = Period.ofSeconds(2 * DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(2); // 2 day
        tmp = Period.ofSeconds(367 * DAY_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(367); // 367 day
    });
});

},{"../../src/unit/Instant":16,"../../src/unit/Period":17}],10:[function(require,module,exports){
'use strict';
var Looper = require('./Looper');
var Period = require('../unit/Period');
var Instant = require('../unit/Instant');
var epoch = require('../util/epoch');
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
        var prevPeriod = Period.ofMillis(Number.MAX_VALUE);
        var looper = Looper.make(function () {
            var period = Instant.make(epoch()).until(endInstant);
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
            getUpdatedPeriod: function () {
                return Instant.make(epoch()).until(endInstant);
            },
            getCountdownPeriod: function () {
                return prevPeriod;
            },
            stopCountdown: function () {
                looper.stop();
            },
            startCountdown: function () {
                //By setting prevPeriod, we force the updater to be called.
                prevPeriod = Period.ofMillis(Number.MAX_VALUE);
                looper.start();
            }
        };
    }
    else {
        throw new Error("Invalid target date passed to countdown");
    }
}
exports.create = create;

},{"../unit/Instant":16,"../unit/Period":17,"../util/epoch":19,"./Looper":11}],11:[function(require,module,exports){
'use strict';
var RAFLooper = require('./RAFLooper');
var TimeoutLooper = require('./TimeoutLooper');
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

},{"./RAFLooper":12,"./TimeoutLooper":13}],12:[function(require,module,exports){
'use strict';
var prefixed = require('../util/prefixed');
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

},{"../util/prefixed":21}],13:[function(require,module,exports){
'use strict';
var prefixed = require('../util/prefixed');
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

},{"../util/prefixed":21}],14:[function(require,module,exports){
/// <reference path="./decl/class-list.d.ts" />
/// <reference path="./decl/ArrayLike.d.ts" />
'use strict';
var ClassList = require("class-list");
var forEach = require("./util/foreach");
var Countdown = require('./countdown/Countdown');
var ATParser = require('./parser/AttributeTemplateParser');
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
    //Presence of length property is enough to separate single element and array
    if (typeof input.length !== "undefined") {
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
    if (options === void 0) { options = {}; }
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
 * Initialize a countdown that will update a template within the given roots.
 *
 * @param {number} epoch time in seconds since UNIX epoch as target for the countdown.
 * @param {HTMLElement|Array} roots Elements that contain a template that needs to be updated based on the countdown.
 * @param {object} options Options to modify some properties of the countdown.
 */
function withSeconds(epoch, roots, options) {
    return createCountdown(epoch * 1000, roots, options);
}
exports.withSeconds = withSeconds;
/**
 * Initialize a countdown that will update a template within the given roots.
 *
 * @param {Date|number} date time in milliseconds since UNIX epoch as target for the countdown.
 * @param {HTMLElement|Array} roots Elements that contain a template that needs to be updated based on the countdown.
 * @param {object} options Options to modify some properties of the countdown.
 */
function withMillis(date, roots, options) {
    return createCountdown(Number(date), roots, options);
}
exports.withMillis = withMillis;

},{"./countdown/Countdown":10,"./parser/AttributeTemplateParser":15,"./util/foreach":20,"class-list":2}],15:[function(require,module,exports){
/// <reference path="../decl/ArrayLike.d.ts" />
/// <reference path="../decl/Dict.d.ts" />
'use strict';
var Period = require('../unit/Period');
var copyMap = require('../util/copyMap');
var forEach = require('../util/foreach');
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
 *
 */
function zeroPad(num) {
    return num < 10 ? "0" + num : "" + num;
}
/**
 *
 */
function noopZeroPad(num) {
    return "" + num;
}
/**
 *
 * @param arr
 * @param indexesToRemove
 */
function removeArrayIndexes(arr, indexesToRemove) {
    //Remove elements in reverse order, since splice
    // changes the array length and element indexes
    indexesToRemove.sort();
    for (var i = indexesToRemove.length; i--;) {
        arr.splice(indexesToRemove[i], 1);
    }
}
/**
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
 *
 */
var AttributeTemplateParser = (function () {
    /**
     * @param {object} opts
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

},{"../unit/Period":17,"../util/copyMap":18,"../util/foreach":20}],16:[function(require,module,exports){
'use strict';
var Period = require('./Period');
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

},{"./Period":17}],17:[function(require,module,exports){
'use strict';
/**
 * Enum which represents all the time units that can be derived from a Period
 *
 * Uppercase time units are absolute
 * Lowercase time units are relative to their parent units (e.g. minutes since last hour)
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
    TimeKey[TimeKey["D"] = 6] = "D"; // days since epoch
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

},{}],18:[function(require,module,exports){
/// <reference path="../decl/Dict.d.ts" />
'use strict';
var forEach = require('./foreach');
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

},{"./foreach":20}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
'use strict';
var windowRef = window;
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
    if (typeof target === "function") {
        return target.bind(scope);
    }
    else {
        return target;
    }
}
module.exports = Prefixed;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcGVjL3Rlc3QudHMiLCJub2RlX21vZHVsZXMvY2xhc3MtbGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jbGFzcy1saXN0L25vZGVfbW9kdWxlcy9pbmRleG9mL2luZGV4LmpzIiwic3BlYy9CaW5kUG9seWZpbGwudHMiLCJzcGVjL2NvdW50ZG93bi9Db3VudGRvd24uc3BlYy50cyIsInNwZWMvbGliLnNwZWMudHMiLCJzcGVjL3BhcnNlci9BdHRyaWJ1dGVUZW1wbGF0ZS5zcGVjLnRzIiwic3BlYy91bml0L0luc3RhbnQuc3BlYy50cyIsInNwZWMvdW5pdC9QZXJpb2Quc3BlYy50cyIsInNyYy9jb3VudGRvd24vQ291bnRkb3duLnRzIiwic3JjL2NvdW50ZG93bi9Mb29wZXIudHMiLCJzcmMvY291bnRkb3duL1JBRkxvb3Blci50cyIsInNyYy9jb3VudGRvd24vVGltZW91dExvb3Blci50cyIsInNyYy9saWIudHMiLCJzcmMvcGFyc2VyL0F0dHJpYnV0ZVRlbXBsYXRlUGFyc2VyLnRzIiwic3JjL3VuaXQvSW5zdGFudC50cyIsInNyYy91bml0L1BlcmlvZC50cyIsInNyYy91dGlsL2NvcHlNYXAudHMiLCJzcmMvdXRpbC9lcG9jaC50cyIsInNyYy91dGlsL2ZvcmVhY2gudHMiLCJzcmMvdXRpbC9wcmVmaXhlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLEFBQ0Esa0RBRGtEO0FBQ2xELFlBQVksQ0FBQztBQUViLEFBQ0EseUNBRHlDO0FBQ3pDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFCLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QixPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUMvQixPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM5QixPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0QyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQzs7O0FDVjNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUs7UUFDckMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztZQUc3QixNQUFNLElBQUksU0FBUyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVB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QUFtQixHQUFuQixlQUFtQjtJQUFFLHFCQUFlLEdBQWYsV0FBZTtJQUNqRSxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoQyxBQUNBLGtDQURrQztRQUNsQyxNQUFNLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBWSxNQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztBQUNMLENBQUM7QUFFRCxBQUFrQixpQkFBVCxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3Mvbm9kZS9ub2RlLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vL0J1ZyBpbiBQaGFudG9tSlMgcmVxdWlyZXMgdGhpcyBwb2x5ZmlsbFxyXG5yZXF1aXJlKFwiLi9CaW5kUG9seWZpbGxcIik7XHJcblxyXG5yZXF1aXJlKFwiLi9saWIuc3BlY1wiKTtcclxucmVxdWlyZShcIi4vdW5pdC9JbnN0YW50LnNwZWNcIik7XHJcbnJlcXVpcmUoXCIuL3VuaXQvUGVyaW9kLnNwZWNcIik7XHJcbnJlcXVpcmUoXCIuL2NvdW50ZG93bi9Db3VudGRvd24uc3BlY1wiKTtcclxucmVxdWlyZShcIi4vcGFyc2VyL0F0dHJpYnV0ZVRlbXBsYXRlLnNwZWNcIik7IiwiLy8gY29udGFpbnMsIGFkZCwgcmVtb3ZlLCB0b2dnbGVcbnZhciBpbmRleG9mID0gcmVxdWlyZSgnaW5kZXhvZicpXG5cbm1vZHVsZS5leHBvcnRzID0gQ2xhc3NMaXN0XG5cbmZ1bmN0aW9uIENsYXNzTGlzdChlbGVtKSB7XG4gICAgdmFyIGNsID0gZWxlbS5jbGFzc0xpc3RcblxuICAgIGlmIChjbCkge1xuICAgICAgICByZXR1cm4gY2xcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NMaXN0ID0ge1xuICAgICAgICBhZGQ6IGFkZFxuICAgICAgICAsIHJlbW92ZTogcmVtb3ZlXG4gICAgICAgICwgY29udGFpbnM6IGNvbnRhaW5zXG4gICAgICAgICwgdG9nZ2xlOiB0b2dnbGVcbiAgICAgICAgLCB0b1N0cmluZzogJHRvU3RyaW5nXG4gICAgICAgICwgbGVuZ3RoOiAwXG4gICAgICAgICwgaXRlbTogaXRlbVxuICAgIH1cblxuICAgIHJldHVybiBjbGFzc0xpc3RcblxuICAgIGZ1bmN0aW9uIGFkZCh0b2tlbikge1xuICAgICAgICB2YXIgbGlzdCA9IGdldFRva2VucygpXG4gICAgICAgIGlmIChpbmRleG9mKGxpc3QsIHRva2VuKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBsaXN0LnB1c2godG9rZW4pXG4gICAgICAgIHNldFRva2VucyhsaXN0KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZSh0b2tlbikge1xuICAgICAgICB2YXIgbGlzdCA9IGdldFRva2VucygpXG4gICAgICAgICAgICAsIGluZGV4ID0gaW5kZXhvZihsaXN0LCB0b2tlbilcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICBzZXRUb2tlbnMobGlzdClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb250YWlucyh0b2tlbikge1xuICAgICAgICByZXR1cm4gaW5kZXhvZihnZXRUb2tlbnMoKSwgdG9rZW4pID4gLTFcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGUodG9rZW4pIHtcbiAgICAgICAgaWYgKGNvbnRhaW5zKHRva2VuKSkge1xuICAgICAgICAgICAgcmVtb3ZlKHRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGQodG9rZW4pXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gZWxlbS5jbGFzc05hbWVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpdGVtKGluZGV4KSB7XG4gICAgICAgIHZhciB0b2tlbnMgPSBnZXRUb2tlbnMoKVxuICAgICAgICByZXR1cm4gdG9rZW5zW2luZGV4XSB8fCBudWxsXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VG9rZW5zKCkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZWxlbS5jbGFzc05hbWVcblxuICAgICAgICByZXR1cm4gZmlsdGVyKGNsYXNzTmFtZS5zcGxpdChcIiBcIiksIGlzVHJ1dGh5KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFRva2VucyhsaXN0KSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aFxuXG4gICAgICAgIGVsZW0uY2xhc3NOYW1lID0gbGlzdC5qb2luKFwiIFwiKVxuICAgICAgICBjbGFzc0xpc3QubGVuZ3RoID0gbGVuZ3RoXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjbGFzc0xpc3RbaV0gPSBsaXN0W2ldXG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgbGlzdFtsZW5ndGhdXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXIgKGFyciwgZm4pIHtcbiAgICB2YXIgcmV0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZm4oYXJyW2ldKSkgcmV0LnB1c2goYXJyW2ldKVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGlzVHJ1dGh5KHZhbHVlKSB7XG4gICAgcmV0dXJuICEhdmFsdWVcbn1cbiIsIlxudmFyIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XHJcbiAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcclxuICAgICAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGFBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcclxuICAgICAgICAgICAgZlRvQmluZCA9IHRoaXMsXHJcbiAgICAgICAgICAgIGZOT1AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9UaGlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcbiAgICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBmQm91bmQ7XHJcbiAgICB9O1xyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvamFzbWluZS9qYXNtaW5lLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgQ291bnRkb3duID0gcmVxdWlyZShcIi4uLy4uL3NyYy9jb3VudGRvd24vQ291bnRkb3duXCIpO1xyXG5cclxuZGVzY3JpYmUoXCJDb3VudGRvd25cIiwgKCkgPT4ge1xyXG4gICAgaXQoXCJzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgYW4gaW52YWxpZCBkYXRlIGlzIHBhc3NlZFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZXhwZWN0KCgpID0+IHtcclxuICAgICAgICAgICAgQ291bnRkb3duLmNyZWF0ZShcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKFwiaGkgbWFya1wiKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7fVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pLnRvVGhyb3coKTtcclxuICAgIH0pO1xyXG59KTsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9qYXNtaW5lL2phc21pbmUuZC50c1wiIC8+XHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBsaWIgPSByZXF1aXJlKCcuLi9zcmMvbGliJyk7XHJcblxyXG5kZXNjcmliZShcIkxpYnJhcnkgZW50cnkgcG9pbnRcIiwgKCkgPT4ge1xyXG4gICAgaXQoXCJzaG91bGQgYWNjZXB0IHNlY29uZHNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGV4cGVjdCgoKSA9PiBsaWIud2l0aFNlY29uZHMoMCwgW10pKS5ub3QudG9UaHJvdygpO1xyXG4gICAgICAgIGV4cGVjdCgoKSA9PiBsaWIud2l0aFNlY29uZHMoRGF0ZS5ub3coKSAvIDEwMDAsIFtdKSkubm90LnRvVGhyb3coKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIGFjY2VwdCBtaWxsaXNlY29uZHNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGV4cGVjdCgoKSA9PiBsaWIud2l0aE1pbGxpcygwLCBbXSkpLm5vdC50b1Rocm93KCk7XHJcbiAgICAgICAgZXhwZWN0KCgpID0+IGxpYi53aXRoTWlsbGlzKG5ldyBEYXRlKCksIFtdKSkubm90LnRvVGhyb3coKTtcclxuICAgICAgICBleHBlY3QoKCkgPT4gbGliLndpdGhNaWxsaXMoRGF0ZS5ub3coKSwgW10pKS5ub3QudG9UaHJvdygpO1xyXG4gICAgfSk7XHJcbn0pOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2phc21pbmUvamFzbWluZS5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvamFzbWluZS1maXh0dXJlL2phc21pbmUtZml4dHVyZS5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IEFUUCA9IHJlcXVpcmUoXCIuLi8uLi9zcmMvcGFyc2VyL0F0dHJpYnV0ZVRlbXBsYXRlUGFyc2VyXCIpO1xyXG5pbXBvcnQgUGVyaW9kID0gcmVxdWlyZShcIi4uLy4uL3NyYy91bml0L1BlcmlvZFwiKTtcclxuXHJcbmRlc2NyaWJlKFwiQXR0cmlidXRlVGVtcGxhdGVQYXJzZXJcIiwgKCkgPT4ge1xyXG4gICAgZnVuY3Rpb24gc2V0dXBEZWZhdWx0VGVtcGxhdGUocTpKUXVlcnkpOnZvaWQge1xyXG4gICAgICAgIHEuYWZmaXgoJ3NwYW5bZGF0YS10bWludXMtaGlkZS1pZi16ZXJvPVwiRFwiXSBzcGFuW2RhdGEtdG1pbnVzLXVuaXQ9XCJEXCJdJyk7XHJcbiAgICAgICAgcS5hZmZpeCgnc3BhbltkYXRhLXRtaW51cy11bml0PVwiaFwiXScpO1xyXG4gICAgICAgIHEuYWZmaXgoJ3NwYW5bZGF0YS10bWludXMtdW5pdD1cIm1cIl0nKTtcclxuICAgICAgICBxLmFmZml4KCdzcGFuW2RhdGEtdG1pbnVzLXVuaXQ9XCJzXCJdJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuVXBkYXRlcihxOkpRdWVyeSwgcDpQZXJpb2QuUGVyaW9kKTp2b2lkIHtcclxuICAgICAgICB2YXIgdXBkYXRlciA9IG5ldyBBVFAuQXR0cmlidXRlVGVtcGxhdGVQYXJzZXIoe30pLmJ1aWxkKHEpO1xyXG4gICAgICAgIHVwZGF0ZXIocCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0dXBXaXRoUGVyaW9kKHE6SlF1ZXJ5LCBwOlBlcmlvZC5QZXJpb2QpOnZvaWQge1xyXG4gICAgICAgIHNldHVwRGVmYXVsdFRlbXBsYXRlKHEpO1xyXG4gICAgICAgIHJ1blVwZGF0ZXIocSwgcCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0RE9Nc3RhdGUobm9kZTpKUXVlcnksIGNvbnRlbnQ6c3RyaW5nLCB2aXNpYmlsaXR5Pzpib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHZpc2liaWxpdHkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBleHBlY3Qobm9kZS5pcyhcIjp2aXNpYmxlXCIpKS50b0VxdWFsKHZpc2liaWxpdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBlY3Qobm9kZS50ZXh0KCkpLnRvRXF1YWwoY29udGVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0dXBDb250YWluZXIoKSB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBhZmZpeCgnLmxvYWRpbmcuY291bnRkb3duI2NvdW50ZG93bicpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICBiZWZvcmVFYWNoKHNldHVwQ29udGFpbmVyKTtcclxuXHJcbiAgICBpdChcInNob3VsZCBjb3JyZWN0bHkgbXV0YXRlIHRoZSBET00gb24gaW52b2NhdGlvblwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJvb3QgPSB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICBzZXR1cFdpdGhQZXJpb2Qocm9vdCwgUGVyaW9kLm9mU2Vjb25kcygxMjEpKTtcclxuICAgICAgICBleHBlY3RET01zdGF0ZShyb290LmZpbmQoJ1tkYXRhLXRtaW51cy11bml0PVwiRFwiXScpLCBcIjBcIik7XHJcbiAgICAgICAgZXhwZWN0RE9Nc3RhdGUocm9vdC5maW5kKCdbZGF0YS10bWludXMtdW5pdD1cImhcIl0nKSwgXCIwXCIpO1xyXG4gICAgICAgIGV4cGVjdERPTXN0YXRlKHJvb3QuZmluZCgnW2RhdGEtdG1pbnVzLXVuaXQ9XCJtXCJdJyksIFwiMDJcIik7XHJcbiAgICAgICAgZXhwZWN0RE9Nc3RhdGUocm9vdC5maW5kKCdbZGF0YS10bWludXMtdW5pdD1cInNcIl0nKSwgXCIwMVwiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIGNvcnJlY3RseSBoYW5kbGUgZWxlbWVudCBoaWRpbmdcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByb290ID0gdGhpcy5jb250YWluZXI7XHJcbiAgICAgICAgc2V0dXBXaXRoUGVyaW9kKHJvb3QsIFBlcmlvZC5vZlNlY29uZHMoNjAgKiA2MCAqIDI0IC0gMSkpO1xyXG4gICAgICAgIGV4cGVjdERPTXN0YXRlKHJvb3QuZmluZCgnW2RhdGEtdG1pbnVzLXVuaXQ9XCJEXCJdJyksIFwiMFwiLCBmYWxzZSk7XHJcbiAgICAgICAgZXhwZWN0RE9Nc3RhdGUocm9vdC5maW5kKCdbZGF0YS10bWludXMtdW5pdD1cImhcIl0nKSwgXCIyM1wiLCB0cnVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIGNvcnJlY3RseSBoYW5kbGUgZWxlbWVudCBzaG93aW5nXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcm9vdCA9IHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgIHNldHVwV2l0aFBlcmlvZChyb290LCBQZXJpb2Qub2ZTZWNvbmRzKDYwICogNjAgKiAyNCkpO1xyXG4gICAgICAgIGV4cGVjdERPTXN0YXRlKHJvb3QuZmluZCgnW2RhdGEtdG1pbnVzLXVuaXQ9XCJEXCJdJyksIFwiMVwiLCB0cnVlKTtcclxuICAgICAgICBleHBlY3RET01zdGF0ZShyb290LmZpbmQoJ1tkYXRhLXRtaW51cy11bml0PVwiaFwiXScpLCBcIjBcIiwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCByZXNldCBpZiBhIGNvdW50ZG93biB0ZW1wbGF0ZSBpcyByZXVzZWQuXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcm9vdCA9IHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgIHNldHVwV2l0aFBlcmlvZChyb290LCBQZXJpb2Qub2ZTZWNvbmRzKDYwICogNjAgKiAyNCAtIDEpKTtcclxuICAgICAgICBleHBlY3RET01zdGF0ZShyb290LmZpbmQoJ1tkYXRhLXRtaW51cy11bml0PVwiRFwiXScpLCBcIjBcIiwgZmFsc2UpO1xyXG5cclxuICAgICAgICAvL1J1biB1cGRhdGVyIHNpbmNlIHRoZSB0ZW1wbGF0ZSBoYXMgYWxyZWFkeSBiZWVuIHNldCB1cFxyXG4gICAgICAgIHJ1blVwZGF0ZXIocm9vdCwgUGVyaW9kLm9mU2Vjb25kcyg2MCAqIDYwICogMjQgKyAxKSk7XHJcbiAgICAgICAgZXhwZWN0RE9Nc3RhdGUocm9vdC5maW5kKCdbZGF0YS10bWludXMtdW5pdD1cIkRcIl0nKSwgXCIxXCIsIHRydWUpO1xyXG4gICAgfSlcclxufSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvamFzbWluZS9qYXNtaW5lLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgSW5zdGFudCA9IHJlcXVpcmUoJy4uLy4uL3NyYy91bml0L0luc3RhbnQnKTtcclxuaW1wb3J0IFBlcmlvZCA9IHJlcXVpcmUoJy4uLy4uL3NyYy91bml0L1BlcmlvZCcpO1xyXG5cclxuZGVzY3JpYmUoXCJJbnN0YW50XCIsICgpID0+IHtcclxuICAgIGl0KCdzaG91bGQgYWxsb3cgY29uc3RydWN0aW9uIHdpdGggYSBudW1iZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZXhwZWN0KCgpID0+IEluc3RhbnQubWFrZSgwKSkubm90LnRvVGhyb3coKTtcclxuICAgICAgICBleHBlY3QoSW5zdGFudC5tYWtlKDApLmlzVmFsaWQoKSkudG9FcXVhbCh0cnVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYWxsb3cgY29uc3RydWN0aW9uIHdpdGggYSBEYXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGV4cGVjdCgoKSA9PiBJbnN0YW50Lm1ha2UobmV3IERhdGUoKSkpLm5vdC50b1Rocm93KCk7XHJcbiAgICAgICAgZXhwZWN0KEluc3RhbnQubWFrZShuZXcgRGF0ZSgpKS5pc1ZhbGlkKCkpLnRvRXF1YWwodHJ1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiBjb3JyZWN0IHZhbGlkaXR5IHZhbHVlcycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvL1ZhbGlkIG51bWJlclxyXG4gICAgICAgIGV4cGVjdChJbnN0YW50Lm1ha2UoMTApLmlzVmFsaWQoKSkudG9FcXVhbCh0cnVlKTtcclxuICAgICAgICAvL1ZhbGlkIGRhdGVcclxuICAgICAgICBleHBlY3QoSW5zdGFudC5tYWtlKG5ldyBEYXRlKCkpLmlzVmFsaWQoKSkudG9FcXVhbCh0cnVlKTtcclxuXHJcbiAgICAgICAgLy9JbnZhbGlkIE51bWJlclxyXG4gICAgICAgIGV4cGVjdChJbnN0YW50Lm1ha2UoTnVtYmVyLk5hTikuaXNWYWxpZCgpKS50b0VxdWFsKGZhbHNlKTtcclxuICAgICAgICAvL0ludmFsaWQgRGF0ZVxyXG4gICAgICAgIGV4cGVjdChJbnN0YW50Lm1ha2UobmV3IERhdGUoXCJoaSBtYXJrXCIpKS5pc1ZhbGlkKCkpLnRvRXF1YWwoZmFsc2UpO1xyXG4gICAgICAgIC8vSW5maW5pdGUgdmFsdWVzLCB1bnJlcHJlc2VudGFibGUgYXMgaW5zdGFudHNcclxuICAgICAgICBleHBlY3QoSW5zdGFudC5tYWtlKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkuaXNWYWxpZCgpKS50b0VxdWFsKGZhbHNlKTtcclxuICAgICAgICBleHBlY3QoSW5zdGFudC5tYWtlKE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkuaXNWYWxpZCgpKS50b0VxdWFsKGZhbHNlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIHJldHVybiB2YWxpZCByZXN1bHRzIGZvciBJbnN0YW50LmFkZFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHAgPSBQZXJpb2Qub2ZTZWNvbmRzKDEwKTtcclxuICAgICAgICB2YXIgaSA9IEluc3RhbnQubWFrZSgxMjEpOyAvL05vIHNlY29uZCBhbGlnbmVkIGluc3RhbnRcclxuICAgICAgICB2YXIgaTIgPSBpLmFkZChwKTtcclxuICAgICAgICBleHBlY3QoaTIuaXNWYWxpZCgpKS50b0VxdWFsKHRydWUpO1xyXG4gICAgICAgIC8vVGhlIHBlcmlvZCBiZXR3ZWVuIEluc3RhbnQgYW5kIEluc3RhbnQuYWRkIHNob3VsZCBiZSBlcXVhbCB0byB0aGUgb3JpZ2luYWwgcGVyaW9kXHJcbiAgICAgICAgZXhwZWN0KGkudW50aWwoaTIpLmVxKHApKS50b0VxdWFsKHRydWUpO1xyXG4gICAgfSlcclxufSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvamFzbWluZS9qYXNtaW5lLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbnRlcmZhY2UgRGF0ZVBhcmFtcyB7XHJcbiAgICB5ZWFyPzpudW1iZXI7XHJcbiAgICBtb250aD86bnVtYmVyO1xyXG4gICAgZGF5PzpudW1iZXI7XHJcbiAgICBob3VyPzpudW1iZXI7XHJcbiAgICBtaW51dGU/Om51bWJlcjtcclxufVxyXG5cclxuaW1wb3J0IFBlcmlvZCA9IHJlcXVpcmUoXCIuLi8uLi9zcmMvdW5pdC9QZXJpb2RcIik7XHJcbmltcG9ydCBJbnN0YW50ID0gcmVxdWlyZSgnLi4vLi4vc3JjL3VuaXQvSW5zdGFudCcpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlRGF0ZShwYXJhbTpEYXRlUGFyYW1zLCBiYXNlOkRhdGUgPSBuZXcgRGF0ZSgwKSk6RGF0ZSB7XHJcbiAgICB2YXIgZCA9IG5ldyBEYXRlKGJhc2UuZ2V0VGltZSgpKTtcclxuICAgIGlmIChwYXJhbS55ZWFyKSBkLnNldFVUQ0Z1bGxZZWFyKHBhcmFtLnllYXIpO1xyXG4gICAgaWYgKHBhcmFtLm1vbnRoKSBkLnNldFVUQ01vbnRoKHBhcmFtLm1vbnRoKTtcclxuICAgIGlmIChwYXJhbS5kYXkpIGQuc2V0VVRDRGF0ZShwYXJhbS5kYXkpO1xyXG4gICAgaWYgKHBhcmFtLmhvdXIpIGQuc2V0VVRDSG91cnMocGFyYW0uaG91cik7XHJcbiAgICBpZiAocGFyYW0ubWludXRlKSBkLnNldFVUQ01pbnV0ZXMocGFyYW0ubWludXRlKTtcclxuICAgIHJldHVybiBkO1xyXG59XHJcblxyXG52YXIgTUlOVVRFX0lOX1NFQ09ORFMgPSA2MDtcclxudmFyIEhPVVJfSU5fU0VDT05EUyA9IDYwICogTUlOVVRFX0lOX1NFQ09ORFM7XHJcbnZhciBEQVlfSU5fU0VDT05EUyA9IDI0ICogSE9VUl9JTl9TRUNPTkRTO1xyXG5cclxuZGVzY3JpYmUoXCJQZXJpb2RcIiwgKCkgPT4ge1xyXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGEgbm9ybWFsIHNpdHVhdGlvbiBjb3JyZWN0bHlcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0ZXN0SW5zdGFudCA9IEluc3RhbnQubWFrZShjcmVhdGVEYXRlKHtcclxuICAgICAgICAgICAgaG91cjogMSxcclxuICAgICAgICAgICAgbWludXRlOiAzXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHZhciBwZXJpb2QgPSBJbnN0YW50Lm1ha2UoMCkudW50aWwodGVzdEluc3RhbnQpO1xyXG5cclxuICAgICAgICB2YXIgdG1wOlBlcmlvZC5UaW1lVmFsdWU7XHJcblxyXG4gICAgICAgIC8vIHNlY29uZHMgc2hvdWxkIGJlIDAsIGJ1dCBzdGlsbCBzaWduaWZpY2FudFxyXG4gICAgICAgIHRtcCA9IHBlcmlvZC5nZXRVbml0KFBlcmlvZC5UaW1lS2V5LnMpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC5zaWduaWZpY2FudCkudG9FcXVhbCh0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gbWludXRlIHNob3VsZCBiZSAzXHJcbiAgICAgICAgdG1wID0gcGVyaW9kLmdldFVuaXQoUGVyaW9kLlRpbWVLZXkubSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgzKTtcclxuICAgICAgICBleHBlY3QodG1wLnNpZ25pZmljYW50KS50b0VxdWFsKHRydWUpO1xyXG5cclxuICAgICAgICAvLyBob3VycyBzaG91bGQgYmUgMVxyXG4gICAgICAgIHRtcCA9IHBlcmlvZC5nZXRVbml0KFBlcmlvZC5UaW1lS2V5LmgpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC5zaWduaWZpY2FudCkudG9FcXVhbCh0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gZGF5cyBzaG91bGQgYmUgMFxyXG4gICAgICAgIHRtcCA9IHBlcmlvZC5nZXRVbml0KFBlcmlvZC5UaW1lS2V5LkQpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC5zaWduaWZpY2FudCkudG9FcXVhbChmYWxzZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCByZXR1cm4gdGhlIGNvcnJlY3QgdmFsdWVzIGZvciAudG9TZWNvbmRzXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvL0NoZWNrIHNlY29uZHMgZXF1YWxpdHlcclxuICAgICAgICB2YXIgcCA9IFBlcmlvZC5vZlNlY29uZHMoMTIzKTtcclxuICAgICAgICBleHBlY3QocC50b1NlY29uZHMoKSkudG9FcXVhbCgxMjMpO1xyXG5cclxuICAgICAgICAvL01pbGxpc2Vjb25kcyBzaG91bGQgZ2V0IHJvdW5kZWQgZG93biB0byB3aG9sZSBzZWNvbmRzXHJcbiAgICAgICAgcCA9IFBlcmlvZC5vZk1pbGxpcygyMjIyKTtcclxuICAgICAgICBleHBlY3QocC50b1NlY29uZHMoKSkudG9FcXVhbCgyKTtcclxuXHJcbiAgICAgICAgLy9UaGUgcmV0dXJuZWQgdmFsdWUgZm9yIGFic29sdXRlIHNlY29uZHMgc2hvdWxkIGVxdWFsIHRvU2Vjb25kc1xyXG4gICAgICAgIGV4cGVjdChwLmdldFVuaXQoUGVyaW9kLlRpbWVLZXkuUykudmFsdWUpLnRvRXF1YWwocC50b1NlY29uZHMoKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCBiZSBlcXVpdmFsZW50bHkgY29uc3RydWN0ZWRcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vRW5zdXJlIHRoZSBlcXVhbGl0eSBjaGVja2VyIGlzIHdvcmtpbmcgYXMgaXQgc2hvdWxkXHJcbiAgICAgICAgdmFyIHAgPSBQZXJpb2Qub2ZTZWNvbmRzKDEyMyk7XHJcbiAgICAgICAgZXhwZWN0KHAuZXEocCkpLnRvRXF1YWwodHJ1ZSk7XHJcbiAgICAgICAgZXhwZWN0KHAuZXEoUGVyaW9kLm9mU2Vjb25kcygwKSkpLnRvRXF1YWwoZmFsc2UpO1xyXG4gICAgICAgIC8vRGlmZmVyZW50IG9iamVjdHMsIHNhbWUgbGVuZ3RoXHJcbiAgICAgICAgZXhwZWN0KHAuZXEoUGVyaW9kLm9mU2Vjb25kcygxMjMpKSkudG9FcXVhbCh0cnVlKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KFBlcmlvZC5vZk1pbGxpcygxMDAwKS5lcShcclxuICAgICAgICAgICAgUGVyaW9kLm9mU2Vjb25kcygxKVxyXG4gICAgICAgICkpLnRvRXF1YWwodHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vQXJlIGJvdGggcm91bmRlZCBkb3duIHRvIG5lYXJlc3Qgc2Vjb25kXHJcbiAgICAgICAgZXhwZWN0KFBlcmlvZC5vZk1pbGxpcyg5OTkpLmVxKFxyXG4gICAgICAgICAgICBQZXJpb2Qub2ZTZWNvbmRzKDAuOTk5KVxyXG4gICAgICAgICkpLnRvRXF1YWwodHJ1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCBub3QgYmUgYWZmZWN0ZWQgYnkgRFNUIHRyYW5zaXRpb25zXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBTaW5jZSB0aGVzZSB0ZXN0cyBkZXBlbmRzIG9uIHRoZSB0aW1lem9uZSB0aGV5IGFyZSBleGVjdXRlZCBpbixcclxuICAgICAgICAvLyB0aGV5IGFyZSBvbmx5IGFwcGxpZWQgaWYgdGhlIHRpbWV6b25lIG9mIHRoZSB0d28gZGF0ZXMgYWN0dWFsbHkgZGlmZmVyLlxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZURTVFRlc3QocGFyYW0xOkRhdGVQYXJhbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbTI6RGF0ZVBhcmFtcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiOihwOlBlcmlvZC5QZXJpb2QpID0+IHZvaWQpOnZvaWQge1xyXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdmFyIGRhdGUxID0gY3JlYXRlRGF0ZShwYXJhbTEsIG5vdyk7XHJcbiAgICAgICAgICAgIHZhciBkYXRlMiA9IGNyZWF0ZURhdGUocGFyYW0yLCBub3cpO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZTEuZ2V0VGltZXpvbmVPZmZzZXQoKSAhPT0gZGF0ZTIuZ2V0VGltZXpvbmVPZmZzZXQoKSkge1xyXG4gICAgICAgICAgICAgICAgY2IoSW5zdGFudC5tYWtlKGRhdGUyKS51bnRpbChJbnN0YW50Lm1ha2UoZGF0ZTEpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERTVCB0cmFuc2l0aW9uIGZvciBFdXJvcGVcclxuICAgICAgICBjcmVhdGVEU1RUZXN0KHtcclxuICAgICAgICAgICAgeWVhcjogMjAxNCxcclxuICAgICAgICAgICAgbW9udGg6IDksXHJcbiAgICAgICAgICAgIGRheTogMjdcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHllYXI6IDIwMTQsXHJcbiAgICAgICAgICAgIG1vbnRoOiA5LFxyXG4gICAgICAgICAgICBkYXk6IDI1XHJcbiAgICAgICAgfSwgKHApID0+IHtcclxuICAgICAgICAgICAgdmFyIHRtcCA9IHAuZ2V0VW5pdChQZXJpb2QuVGltZUtleS5IKTtcclxuICAgICAgICAgICAgLy8gMiBkYXkgZGlmZmVyZW5jZSwgaWYgaXQgaXMgbW9kaWZpZWQgYnkgRFNUIGNoYW5naW5nIGl0IHdvbid0IG1hdGNoXHJcbiAgICAgICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoNDgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBEU1QgdHJhbnNpdGlvbiBmb3IgQW1lcmljYVxyXG4gICAgICAgIGNyZWF0ZURTVFRlc3Qoe1xyXG4gICAgICAgICAgICB5ZWFyOiAyMDE0LFxyXG4gICAgICAgICAgICBtb250aDogMTAsXHJcbiAgICAgICAgICAgIGRheTogM1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgeWVhcjogMjAxNCxcclxuICAgICAgICAgICAgbW9udGg6IDEwLFxyXG4gICAgICAgICAgICBkYXk6IDFcclxuICAgICAgICB9LCAocCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdG1wID0gcC5nZXRVbml0KFBlcmlvZC5UaW1lS2V5LkgpO1xyXG4gICAgICAgICAgICAvLyAyIGRheSBkaWZmZXJlbmNlLCBpZiBpdCBpcyBtb2RpZmllZCBieSBEU1QgY2hhbmdpbmcgaXQgd29uJ3QgbWF0Y2hcclxuICAgICAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCg0OCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCByZXR1cm4gdHJ1ZSBmb3IgUGVyaW9kLmlzRmluaXNoZWQgaWYgdGhlIHNhbWUgaW5zdGFudCBpcyB1c2VkIG9uIGJvdGggZW5kc1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHRlc3QgPSBJbnN0YW50Lm1ha2UoY3JlYXRlRGF0ZSh7XHJcbiAgICAgICAgICAgIGhvdXI6IDEsXHJcbiAgICAgICAgICAgIG1pbnV0ZTogM1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICBleHBlY3QodGVzdC51bnRpbCh0ZXN0KS5pc0ZpbmlzaGVkKCkpLnRvRXF1YWwodHJ1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCByZXR1cm4gdHJ1ZSBmb3IgUGVyaW9kLmlzRmluaXNoZWQgaWYgdGhlIHRhcmdldCB0aW1lIGlzIGluIHRoZSBwYXN0XCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdGVzdCA9IEluc3RhbnQubWFrZShjcmVhdGVEYXRlKHtcclxuICAgICAgICAgICAgaG91cjogMSxcclxuICAgICAgICAgICAgbWludXRlOiAzXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHZhciB6ZXJvID0gSW5zdGFudC5tYWtlKGNyZWF0ZURhdGUoe30pKTtcclxuICAgICAgICBleHBlY3QodGVzdC51bnRpbCh6ZXJvKS5pc0ZpbmlzaGVkKCkpLnRvRXF1YWwodHJ1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCByZXR1cm4gZmFsc2UgZm9yIFBlcmlvZC5pc0ZpbmlzaGVkIGlmIHRoZSB0YXJnZXQgdGltZSBpcyBpbiB0aGUgZnV0dXJlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdGVzdCA9IEluc3RhbnQubWFrZShjcmVhdGVEYXRlKHtcclxuICAgICAgICAgICAgaG91cjogMSxcclxuICAgICAgICAgICAgbWludXRlOiAzXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHZhciB6ZXJvID0gSW5zdGFudC5tYWtlKGNyZWF0ZURhdGUoe30pKTtcclxuICAgICAgICBleHBlY3QoemVyby51bnRpbCh0ZXN0KS5pc0ZpbmlzaGVkKCkpLnRvRXF1YWwoZmFsc2UpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGQgY29ycmVjdGx5IGNhbGN1bGF0ZSB0aGUgc2Vjb25kcyBwYXJ0aWFsXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdG1wOlBlcmlvZC5UaW1lVmFsdWU7XHJcbiAgICAgICAgdmFyIGtleSA9IFBlcmlvZC5UaW1lS2V5LnM7XHJcblxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoLTEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDApLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIHNlY29uZFxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMgLSAxKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCg1OSk7IC8vIDU5IHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKE1JTlVURV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8gMSBtaW51dGUsIDAgc2Vjb25kc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMgKyAxKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgxKTsgLy8gMSBtaW51dGUsIDEgc2Vjb25kXHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCBjb3JyZWN0bHkgY2FsY3VsYXRlIHRoZSBtaW51dGVzIHBhcnRpYWxcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0bXA6UGVyaW9kLlRpbWVWYWx1ZTtcclxuICAgICAgICB2YXIga2V5ID0gUGVyaW9kLlRpbWVLZXkubTtcclxuXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcygtMSkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vIDAgbWludXRlc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoMCkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vIDAgbWludXRlc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMgLSAxKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8gMCBtaW51dGVzLCA1OSBzZWNvbmRzXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcyhNSU5VVEVfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMSk7IC8vIDEgbWludXRlLCAwIHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKE1JTlVURV9JTl9TRUNPTkRTICsgMSkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMSk7IC8vIDEgbWludXRlLCAxIHNlY29uZFxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoSE9VUl9JTl9TRUNPTkRTICsgTUlOVVRFX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIGhvdXIsIDEgbWludXRlLCAwIHNlY29uZHNcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIGNvcnJlY3RseSBjYWxjdWxhdGUgdGhlIGhvdXJzIHBhcnRpYWxcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0bXA6UGVyaW9kLlRpbWVWYWx1ZTtcclxuICAgICAgICB2YXIga2V5ID0gUGVyaW9kLlRpbWVLZXkuaDtcclxuXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcygtMSkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vMCBob3Vyc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoMCkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vMCBob3Vyc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMgLSAxKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8wIGhvdXJzLCAwIG1pbnV0ZXMsIDU5IHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKE1JTlVURV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8wIGhvdXJzLCAxIG1pbnV0ZSwgMCBzZWNvbmRzXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcyhNSU5VVEVfSU5fU0VDT05EUyArIDEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLzAgaG91cnMsIDEgbWludXRlLCAxIHNlY29uZFxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoSE9VUl9JTl9TRUNPTkRTIC0gTUlOVVRFX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLzAgaG91cnMsIDU5IG1pbnV0ZXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKEhPVVJfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMSk7IC8vMSBob3VyLCAwIG1pbnV0ZXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKEhPVVJfSU5fU0VDT05EUyArIE1JTlVURV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgxKTsgLy8xIGhvdXIsIDEgbWludXRlXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcyhEQVlfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vMSBkYXksIDAgaG91cnMsIDAgbWludXRlc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoREFZX0lOX1NFQ09ORFMgKyBIT1VSX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLzEgZGF5LCAxIGhvdXIsIDAgbWludXRlc1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGQgY29ycmVjdGx5IGNhbGN1bGF0ZSB0aGUgZGF5cyBwYXJ0aWFsXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdG1wOlBlcmlvZC5UaW1lVmFsdWU7XHJcbiAgICAgICAgdmFyIGtleSA9IFBlcmlvZC5UaW1lS2V5LkQ7XHJcblxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoLTEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIGRheXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDApLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIGRheXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKERBWV9JTl9TRUNPTkRTIC0gSE9VUl9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8gMjMgaG91cnNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKERBWV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgxKTsgLy8gMSBkYXlcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDIgKiBEQVlfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMik7IC8vIDIgZGF5c1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGQgY29ycmVjdGx5IGNhbGN1bGF0ZSB0aGUgdW5ib3VuZGVkIHBhcnRpYWxzXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdG1wOlBlcmlvZC5UaW1lVmFsdWU7XHJcbiAgICAgICAgdmFyIGtleTpQZXJpb2QuVGltZUtleTtcclxuXHJcbiAgICAgICAga2V5ID0gUGVyaW9kLlRpbWVLZXkuUztcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDApLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIHNlY29uZFxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMgLSAxKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCg1OSk7IC8vIDU5IHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKE1JTlVURV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCg2MCk7IC8vIDYwIHNlY29uZHNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDIgKiBNSU5VVEVfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMTIwKTsgLy8gMTIwIHNlY29uZHNcclxuXHJcbiAgICAgICAga2V5ID0gUGVyaW9kLlRpbWVLZXkuTTtcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKE1JTlVURV9JTl9TRUNPTkRTIC0gMSkuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMCk7IC8vIDAgbWludXRlcywgNTkgc2Vjb25kc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoTUlOVVRFX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIG1pbnV0ZSwgMCBzZWNvbmRzXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcyhIT1VSX0lOX1NFQ09ORFMgKyBNSU5VVEVfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoNjEpOyAvLyA2MSBtaW51dGUsIDAgc2Vjb25kc1xyXG5cclxuICAgICAgICBrZXkgPSBQZXJpb2QuVGltZUtleS5IO1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoSE9VUl9JTl9TRUNPTkRTIC0gTUlOVVRFX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIGhvdXJzLCA1OSBtaW51dGVzXHJcbiAgICAgICAgdG1wID0gUGVyaW9kLm9mU2Vjb25kcyhIT1VSX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIGhvdXIsIDAgbWludXRlc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoMiAqIEhPVVJfSU5fU0VDT05EUykuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgIGV4cGVjdCh0bXAudmFsdWUpLnRvRXF1YWwoMik7IC8vIDIgaG91cnMsIDAgbWludXRlc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoREFZX0lOX1NFQ09ORFMgKyBIT1VSX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDI1KTsgLy8gMjUgaG91cnMsIDAgbWludXRlc1xyXG5cclxuICAgICAgICBrZXkgPSBQZXJpb2QuVGltZUtleS5EO1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoLTEpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIGRheXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDApLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDApOyAvLyAwIGRheXNcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKERBWV9JTl9TRUNPTkRTIC0gSE9VUl9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgwKTsgLy8gMCBkYXlzLCAyMyBob3Vyc1xyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoREFZX0lOX1NFQ09ORFMpLmdldFVuaXQoa2V5KTtcclxuICAgICAgICBleHBlY3QodG1wLnZhbHVlKS50b0VxdWFsKDEpOyAvLyAxIGRheVxyXG4gICAgICAgIHRtcCA9IFBlcmlvZC5vZlNlY29uZHMoMiAqIERBWV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgyKTsgLy8gMiBkYXlcclxuICAgICAgICB0bXAgPSBQZXJpb2Qub2ZTZWNvbmRzKDM2NyAqIERBWV9JTl9TRUNPTkRTKS5nZXRVbml0KGtleSk7XHJcbiAgICAgICAgZXhwZWN0KHRtcC52YWx1ZSkudG9FcXVhbCgzNjcpOyAvLyAzNjcgZGF5XHJcbiAgICB9KTtcclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IExvb3BlciA9IHJlcXVpcmUoJy4vTG9vcGVyJyk7XHJcbmltcG9ydCBQZXJpb2QgPSByZXF1aXJlKCcuLi91bml0L1BlcmlvZCcpO1xyXG5pbXBvcnQgSW5zdGFudCA9IHJlcXVpcmUoJy4uL3VuaXQvSW5zdGFudCcpO1xyXG5pbXBvcnQgZXBvY2ggPSByZXF1aXJlKCcuLi91dGlsL2Vwb2NoJyk7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIG9uY2UgdGhlIGNvdW50ZG93biBoYXMgcmVhY2hlZCB6ZXJvLlxyXG4gICAgICpcclxuICAgICAqIEl0IGlzIGd1YXJhbnRlZWQgdG8gYmUgY2FsbGVkLCBldmVuIGlmIHRoZSBhc3NvY2lhdGVkIGNvdW50ZG93biBoYXMgYWxyZWFkeSByZWFjaGVkIHplcm8gd2hlbiBpdCBiZWdpbnMuXHJcbiAgICAgKi9cclxuICAgIGZpbmlzaGVkQ2FsbGJhY2s/OiAoKSA9PiBhbnk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIG9uY2UgdGhlIGNvdW50ZG93biBoYXMgYmVlbiBjb25zdHJ1Y3RlZCBhbmQgc3RhcnRlZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGlzIGNhbGxiYWNrIHdpbGwgZmlyZSBiZWZvcmUgdGhlIGZpbmlzaGVkQ2FsbGJhY2suXHJcbiAgICAgKi9cclxuICAgIGxvYWRlZENhbGxiYWNrPzogKCkgPT4gYW55O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbnRyb2xsZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcGVyaW9kIHRoYXQgaXMgYWx3YXlzIGVxdWFsIHRvIHRoZSBhbW91bnQgb2YgdGltZSBsZWZ0IHVudGlsIHRoZSBjb3VudGRvd24gZW5kcy5cclxuICAgICAqL1xyXG4gICAgZ2V0VXBkYXRlZFBlcmlvZCgpOiBQZXJpb2QuUGVyaW9kO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbGFzdCBwZXJpb2QgZm9yIHdoaWNoIHRoZSBhY3R1YWwgY291bnRkb3duIGhhcyBiZWVuIHVwZGF0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIHdpbmRvdyBpcyBoaWRkZW4gb3IgaW4gYSB0YWIgdGhlbiB0aGlzIHZhbHVlIG1pZ2h0IG5vdCByZWZsZWN0IHRoZSBhY3R1YWwgcHJvZ3Jlc3Mgb2YgdGhlIGNvdW50ZG93bixcclxuICAgICAqIHVzZSB7QHNlZSBDb250cm9sbGVyI2dldFVwZGF0ZWRQZXJpb2R9IGlmIGl0IHNob3VsZCBhbHdheXMgYmUgdXAgdG8gZGF0ZS5cclxuICAgICAqL1xyXG4gICAgZ2V0Q291bnRkb3duUGVyaW9kKCk6IFBlcmlvZC5QZXJpb2Q7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIHRoZSBjb3VudGRvd24sIG9uY2UgaXQgaGFzIGJlZW4gc3RvcHBlZCBpdCB3aWxsIG5vIGxvbmdlciBmaXJlIHRoZSB1cGRhdGVyIG9yIHVwZGF0ZSBpdHMgaW50ZXJuYWwgcGVyaW9kLlxyXG4gICAgICpcclxuICAgICAqIElmIHRoZSBjb3VudGRvd24gaGFzIGFscmVhZHkgc3RvcHBlZCB0aGlzIG1ldGhvZCB3aWxsIGRvIG5vdGhpbmcuXHJcbiAgICAgKi9cclxuICAgIHN0b3BDb3VudGRvd24oKTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBhIHByZXZpb3VzbHkgc3RvcHBlZCBjb3VudGRvd24sIGl0IHdpbGwgcmV0YWluIGFsbCB0aGUgc3RhdGUgZnJvbSBiZWZvcmUgaXQgd2FzIHN0b3BwZWQuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGNvdW50ZG93biBpcyBhbHJlYWR5IHJ1bm5pbmcsIHRoZSBvbmx5IGVmZmVjdCBvZiB0aGlzIG1ldGhvZCB3aWxsIGJlIGEgZm9yY2VkIGNhbGwgdG8gdGhlIHVwZGF0ZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0Q291bnRkb3duKCk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFVwZGF0ZXIgPSAocGVyaW9kOlBlcmlvZC5QZXJpb2QpID0+IGFueTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIGEgY291bnRkb3duIGxvb3AgdGhhdCB3aWxsIGNhbGwgdGhlIHByb3ZpZGVkIHVwZGF0ZXIgZnVuY3Rpb24gZWFjaCB0aW1lIHRoZSBjb3VudGRvd24gY2hhbmdlcy5cclxuICpcclxuICogV2hlbiB0aGUgZW5kRGF0ZSBpcyByZWFjaGVkIHRoZSBjb3VudGRvd24gd2lsbCBhdXRvbWF0aWNhbGx5IHN0b3AgaXRzZWxmLFxyXG4gKiBpdCB3aWxsIGFsd2F5cyBjYWxsIHRoZSB1cGRhdGVyIGF0IGxlYXN0IG9uY2UuXHJcbiAqXHJcbiAqIElmIG1pbGxpc2Vjb25kcyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBjb3VudGRvd24gdGhlbiB0aGlzIHNob3VsZCBiZSBkb25lIGV4dGVybmFsbHkuXHJcbiAqIFRoZSByZWFzb24gbWlsbGlzZWNvbmRzIGFyZSBub3QgdXNlZCBpcyB0aGF0IHRoZXkgY2hhbmdlIHRvbyByYXBpZGx5IHRvIGFjdHVhbGx5IGJlIHVzZWZ1bCxcclxuICogYSBzaW1pbGFyIGVmZmVjdCB0byBhbiBhY3R1YWwgbWlsbGlzZWNvbmQgY291bnRkb3duIGNhbiBiZSByZWFjaGVkIHdpdGggdmlzdWFsIHRyaWNrcy5cclxuICpcclxuICogQHBhcmFtIHtEYXRlfSBlbmREYXRlIG1vbWVudCB0aGF0IHdlIHdpbGwgYmUgY291bnRpbmcgZG93biB0by5cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlciBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCBlYWNoIHRpbWUgYSBuZXcgcGVyaW9kIGlzIGF2YWlsYWJsZS5cclxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgY2FsbGJhY2sgb3B0aW9ucyB0byB0cmFjayBzb21lIG9mIHRoZSBwcm9ncmVzcyBvZiB0aGUgY291bnRkb3duLlxyXG4gKiBAdGhyb3dzIElmIHRoZSBwcm92aWRlZCBlbmREYXRlIGlzIG5vdCBhIHZhbGlkIGRhdGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKGVuZERhdGU6RGF0ZSwgdXBkYXRlcjpVcGRhdGVyLCBvcHRzOk9wdGlvbnMpOkNvbnRyb2xsZXIge1xyXG4gICAgdmFyIGVuZEluc3RhbnQgPSBJbnN0YW50Lm1ha2UoZW5kRGF0ZSk7XHJcblxyXG4gICAgaWYgKGVuZEluc3RhbnQuaXNWYWxpZCgpKSB7XHJcbiAgICAgICAgdmFyIHByZXZQZXJpb2QgPSBQZXJpb2Qub2ZNaWxsaXMoTnVtYmVyLk1BWF9WQUxVRSk7XHJcblxyXG4gICAgICAgIHZhciBsb29wZXIgPSBMb29wZXIubWFrZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBwZXJpb2QgPSBJbnN0YW50Lm1ha2UoZXBvY2goKSkudW50aWwoZW5kSW5zdGFudCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBlcmlvZC5lcShwcmV2UGVyaW9kKSkge1xyXG4gICAgICAgICAgICAgICAgcHJldlBlcmlvZCA9IHBlcmlvZDtcclxuXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVyKHBlcmlvZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBlcmlvZC5pc0ZpbmlzaGVkKCkgJiYgb3B0cy5maW5pc2hlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0cy5maW5pc2hlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAhcGVyaW9kLmlzRmluaXNoZWQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9CZWdpbiB0aGUgY291bnRkb3duXHJcbiAgICAgICAgbG9vcGVyLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIGlmIChvcHRzLmxvYWRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9wdHMubG9hZGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFVwZGF0ZWRQZXJpb2Q6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBJbnN0YW50Lm1ha2UoZXBvY2goKSkudW50aWwoZW5kSW5zdGFudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldENvdW50ZG93blBlcmlvZDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZQZXJpb2Q7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0b3BDb3VudGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvb3Blci5zdG9wKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0YXJ0Q291bnRkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL0J5IHNldHRpbmcgcHJldlBlcmlvZCwgd2UgZm9yY2UgdGhlIHVwZGF0ZXIgdG8gYmUgY2FsbGVkLlxyXG4gICAgICAgICAgICAgICAgcHJldlBlcmlvZCA9IFBlcmlvZC5vZk1pbGxpcyhOdW1iZXIuTUFYX1ZBTFVFKTtcclxuICAgICAgICAgICAgICAgIGxvb3Blci5zdGFydCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHRhcmdldCBkYXRlIHBhc3NlZCB0byBjb3VudGRvd25cIik7XHJcbiAgICB9XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgUkFGTG9vcGVyID0gcmVxdWlyZSgnLi9SQUZMb29wZXInKTtcclxuaW1wb3J0IFRpbWVvdXRMb29wZXIgPSByZXF1aXJlKCcuL1RpbWVvdXRMb29wZXInKTtcclxuXHJcbi8qKlxyXG4gKiBBIGxvb3BlciBpcyBhIGNvbnRyb2xsYWJsZSBjb25zdHJ1Y3QgdGhhdCBpcyBhYmxlIHRvIGludm9rZSBhIGNhbGxiYWNrIGF0IGEgcmVndWxhciBpbnRlcmZhY2UuXHJcbiAqXHJcbiAqIFRoZSByYXRlIG9mIGludm9jYXRpb24gc2hvdWxkIG5vdCBiZSByZWxpZWQgdXBvbiBhbmQgaXMgbm90IHN0cmljdGx5IGRlZmluZWQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb3BlciB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGludm9raW5nIHRoZSBjYWxsYmFjayBhdCBhIHNwZWNpZmllZCBpbnRlcnZhbC5cclxuICAgICAqXHJcbiAgICAgKiBPbmNlIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB7QHNlZSBpc1J1bm5pbmd9IHdpbGwgbmVlZCB0byByZXR1cm4gdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgc3RhcnQoKTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3BzIGFueSBmdXR1cmUgaW52b2NhdGlvbiBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogT25jZSB0aGlzIGZ1bmN0aW9uIHJldHVybnMge0BzZWUgaXNSdW5uaW5nfSB3aWxsIG5lZWQgdG8gcmV0dXJuIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBzdG9wKCk6IHZvaWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBRdWVyaWVzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBsb29wZXIuXHJcbiAgICAgKlxyXG4gICAgICogSWYgaXQgcmV0dXJucyB0cnVlIHRoZW4gdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIGF0IGxlYXN0IG9uY2UgaW4gdGhlIGZ1dHVyZVxyXG4gICAgICovXHJcbiAgICBpc1J1bm5pbmcoKTogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY29uc3RydWN0IGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMgdGhlIExvb3BlciBpbnRlcmZhY2UgYW5kIGludm9rZXMgdGhlIHByb3ZpZGVkIGNhbGxiYWNrLlxyXG4gKlxyXG4gKiBXaWxsIGF0dGVtcHQgdG8gdXNlIGEgUmVxdWVzdEFuaW1hdGlvbkZyYW1lLWJhc2VkIExvb3BlciwgZmFsbGluZyBiYWNrIHRvIGFcclxuICogVGltZW91dC1iYXNlZCBMb29wZXIgaWYgUkFGIGlzIG5vdCBhdmFpbGFibGUuXHJcbiAqXHJcbiAqIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGZhbHNlIHRoZW4gdGhlIExvb3BlciB3aWxsIHN0b3AgYW55IGZ1dHVyZSBpbnZvY2F0aW9ucyBvZiB0aGUgY2FsbGJhY2suXHJcbiAqXHJcbiAqIEBwYXJhbSBjYiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgcmVwZWF0ZWRseSBpbnZva2VkIGJ5IHRoZSByZXR1cm5lZCBMb29wZXIuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFrZShjYjooKSA9PiBib29sZWFuKTpMb29wZXIge1xyXG4gICAgaWYgKFJBRkxvb3Blci5pc0F2YWlsYWJsZSgpKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSQUZMb29wZXIoY2IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbWVvdXRMb29wZXIoY2IpO1xyXG4gICAgfVxyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHByZWZpeGVkID0gcmVxdWlyZSgnLi4vdXRpbC9wcmVmaXhlZCcpO1xyXG5pbXBvcnQgTG9vcGVyID0gcmVxdWlyZSgnLi9Mb29wZXInKTtcclxuXHJcbi8vIFJldHJpZXZlIChwb3RlbnRpYWxseSB2ZW5kb3ItcHJlZml4ZWQpIHJlcXVlc3RBbmltYXRpb25GcmFtZSBhbmRcclxuLy8gY2FuY2VsQW5pbWF0aW9uRnJhbWUgbWV0aG9kc1xyXG50eXBlIFJBRlR5cGUgPSAoY2I6RnJhbWVSZXF1ZXN0Q2FsbGJhY2spID0+IG51bWJlcjtcclxudHlwZSBDQUZUeXBlID0gKGhhbmRsZTpudW1iZXIpID0+IHZvaWQ7XHJcbnZhciByQUYgPSBwcmVmaXhlZDxSQUZUeXBlPigncmVxdWVzdEFuaW1hdGlvbkZyYW1lJyk7XHJcbnZhciBjQUYgPSBwcmVmaXhlZDxDQUZUeXBlPignY2FuY2VsQW5pbWF0aW9uRnJhbWUnKSB8fCBwcmVmaXhlZDxDQUZUeXBlPignY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJyk7XHJcblxyXG52YXIgUkFGX0VOQUJMRUQgPSB0eXBlb2YgckFGICE9PSBcInVuZGVmaW5lZFwiO1xyXG5cclxuLyoqXHJcbiAqIExvb3BlciBiYXNlZCBvbiB0aGUgSFRNTC01IFJlcXVlc3RBbmltYXRpb25GcmFtZSBBUEkuXHJcbiAqXHJcbiAqIFRoaXMgbG9vcGVyIGhhcyB0aGUgcHJvcGVydHkgdGhhdCBpdCB3aWxsIG5vdCBiZSBjYWxsZWQgaWYgdGhlIGJyb3dzZXIgcGFnZSBpcyBoaWRkZW4gaW4gc29tZSB3YXksIHNpbmNlIGl0IGdldHNcclxuICogZXhlY3V0ZWQgYmVmb3JlIGVhY2ggcmVkcmF3IG9mIHRoZSBwYWdlLlxyXG4gKi9cclxuY2xhc3MgUmVxdWVzdEFuaW1hdGlvbkZyYW1lIGltcGxlbWVudHMgTG9vcGVyLkxvb3BlciB7XHJcbiAgICBwcml2YXRlIGhhbmRsZTpudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBSQUYtYmFzZWQgTG9vcGVyIHRoYXQgd2lsbCBpbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrLlxyXG4gICAgICpcclxuICAgICAqIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGZhbHNlLCB0aGUgTG9vcGVyIHdpbGwgY2FuY2VsIGFueSBmdXR1cmUgaW52b2NhdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGludm9rZWQgYnkgdGhpcyBsb29wZXIuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2I6KCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlID0gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKTp2b2lkIHtcclxuICAgICAgICAvL01ha2Ugc3VyZSB3ZSBhcmVuJ3QgYWxyZWFkeSBydW5uaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9mdW5jdGlvbiBrZWVwcyByZXF1ZXN0aW5nIHRoZSBuZXh0IGZyYW1lIHVudGlsXHJcbiAgICAgICAgLy90aGUgY2FsbGJhY2sgcmV0dXJucyBmYWxzZVxyXG4gICAgICAgIHZhciBmbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2IoKSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlID0gckFGKGZuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vSnVtcC1zdGFydCB0aGUgbG9vcFxyXG4gICAgICAgIGZuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcCgpOnZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1J1bm5pbmcoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL0NsZWFyIHJlcXVlc3QgYW5kIHJlc2V0IGhhbmRsZVxyXG4gICAgICAgIGNBRih0aGlzLmhhbmRsZSk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGUgPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICBpc1J1bm5pbmcoKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUgIT0gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgc3VwcG9ydHMgdXBkYXRlIGxvb3BzIGJhc2VkIG9uIGZyYW1lIHJlZnJlc2hlcy5cclxuICAgICAqXHJcbiAgICAgKiBJZiB0aGlzIG1ldGhvZCByZXR1cm5zIGZhbHNlLCB0aGUgUmVxdWVzdEFuaW1hdGlvbkZyYW1lLWJhc2VkIExvb3BlciB3aWxsIGZhaWwgdG8gd29yay5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGlzQXZhaWxhYmxlKCk6Ym9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIFJBRl9FTkFCTEVEO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgPSBSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHByZWZpeGVkID0gcmVxdWlyZSgnLi4vdXRpbC9wcmVmaXhlZCcpO1xyXG5pbXBvcnQgTG9vcGVyID0gcmVxdWlyZSgnLi9Mb29wZXInKTtcclxuXHJcbnZhciBwU2V0SW50ZXJ2YWwgPSBwcmVmaXhlZDwoaGFuZGxlcjphbnksIHRpbWVvdXQ/OmFueSwgLi4uYXJnczphbnlbXSk9Pm51bWJlcj4oJ3NldEludGVydmFsJyk7XHJcbnZhciBwQ2xlYXJJbnRlcnZhbCA9IHByZWZpeGVkPChoYW5kbGU6bnVtYmVyKT0+dm9pZD4oJ2NsZWFySW50ZXJ2YWwnKTtcclxuXHJcbnZhciBUSU1FT1VUXzYwX0ZQU19JTl9NUyA9IE1hdGguZmxvb3IoMTAwMCAvIDYwKTtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIExvb3BlciB1c2VzIHRoZSBzZXRJbnRlcnZhbC9jbGVhckludGVydmFsIEFQSSBhcyBpdHMgaW1wbGVtZW50YXRpb24uXHJcbiAqXHJcbiAqIFRoZSBpbnRlcnZhbCBhdCB3aGljaCB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIGlzIHNldCB0byB7QHNlZSBUSU1FT1VUXzYwX0ZQU19JTl9NU31cclxuICpcclxuICogSWYgYSB3aW5kb3cgaXMgaGlkZGVuIHRoZW4gbW9zdCBicm93c2VycyB3aWxsIGxpbWl0IHRoZSByYXRlIG9mIGludm9jYXRpb24gb2YgdGhpcyBMb29wZXIgdG8gb25jZSBldmVyeSBzZWNvbmQuXHJcbiAqL1xyXG5jbGFzcyBUaW1lb3V0TG9vcGVyIGltcGxlbWVudHMgTG9vcGVyLkxvb3BlciB7XHJcbiAgICBwcml2YXRlIGhhbmRsZTpudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBzZXRJbnRlcnZhbC1iYXNlZCBMb29wZXIgdGhhdCB3aWxsIGludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGNhbGxiYWNrIHJldHVybnMgZmFsc2UsIHRoZSBMb29wZXIgd2lsbCBjYW5jZWwgYW55IGZ1dHVyZSBpbnZvY2F0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgaW52b2tlZCBieSB0aGlzIGxvb3Blci5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjYjooKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGUgPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpOnZvaWQge1xyXG4gICAgICAgIC8vTWFrZSBzdXJlIHdlIGFyZW4ndCBhbHJlYWR5IHJ1bm5pbmdcclxuICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jYigpICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZSA9IHBTZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYigpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBUSU1FT1VUXzYwX0ZQU19JTl9NUyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0b3AoKTp2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9DbGVhciByZXF1ZXN0IGFuZCByZXNldCBoYW5kbGVcclxuICAgICAgICBwQ2xlYXJJbnRlcnZhbCh0aGlzLmhhbmRsZSk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGUgPSAtMTtcclxuICAgIH1cclxuXHJcbiAgICBpc1J1bm5pbmcoKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUgIT0gLTE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCA9IFRpbWVvdXRMb29wZXI7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZGVjbC9jbGFzcy1saXN0LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9kZWNsL0FycmF5TGlrZS5kLnRzXCIgLz5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IENsYXNzTGlzdCA9IHJlcXVpcmUoXCJjbGFzcy1saXN0XCIpO1xyXG5pbXBvcnQgZm9yRWFjaCA9IHJlcXVpcmUoXCIuL3V0aWwvZm9yZWFjaFwiKTtcclxuaW1wb3J0IENvdW50ZG93biA9IHJlcXVpcmUoJy4vY291bnRkb3duL0NvdW50ZG93bicpO1xyXG5pbXBvcnQgUGVyaW9kID0gcmVxdWlyZSgnLi91bml0L1BlcmlvZCcpO1xyXG5pbXBvcnQgUGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXIvUGFyc2VyJyk7XHJcbmltcG9ydCBBVFBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyL0F0dHJpYnV0ZVRlbXBsYXRlUGFyc2VyJyk7XHJcblxyXG52YXIgREVGQVVMVF9GSU5JU0hFRF9DTEFTUzpzdHJpbmcgPSBcImZpbmlzaGVkXCI7XHJcblxyXG4vKipcclxuICogVGhpcyBmdW5jdGlvbiBjb2VyY2VzIHRoZSBnaXZlbiB0eXBlIHRvIGFuIGFycmF5LWxpa2UgdHlwZS5cclxuICpcclxuICogSWY6IGlucHV0IGlzIGFycmF5LWluZGV4YWJsZSAoaGFzIC5sZW5ndGggcHJvcGVydHkpXHJcbiAqICAgPT4gcmV0dXJucyB3aXRob3V0IGNoYW5nZVxyXG4gKiBFbHNlOlxyXG4gKiAgID0+IHJldHVybiBpbnB1dCB3cmFwcGVkIGluIGFuIEFycmF5XHJcbiAqL1xyXG5mdW5jdGlvbiBjb252ZXJ0VG9BcnJheTxVPihpbnB1dDpVfEFycmF5TGlrZTxVPik6QXJyYXlMaWtlPFU+IHtcclxuICAgIC8vUHJlc2VuY2Ugb2YgbGVuZ3RoIHByb3BlcnR5IGlzIGVub3VnaCB0byBzZXBhcmF0ZSBzaW5nbGUgZWxlbWVudCBhbmQgYXJyYXlcclxuICAgIGlmICh0eXBlb2YgKDxBcnJheUxpa2U8VT4+aW5wdXQpLmxlbmd0aCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHJldHVybiA8QXJyYXlMaWtlPFU+PmlucHV0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gWzxVPmlucHV0XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0T3B0aW9ucyBleHRlbmRzIENvdW50ZG93bi5PcHRpb25zLCBQYXJzZXIuUGFyc2VyT3B0aW9ucyB7XHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHByb3ZpZGVkIHJvb3QgZWxlbWVudHMgb25jZSB0aGUgY291bnRkb3duIGhhcyBmaW5pc2hlZC5cclxuICAgICAqXHJcbiAgICAgKiBEZWZhdWx0cyB0byB7QHNlZSBERUZBVUxUX0ZJTklTSEVEX0NMQVNTfVxyXG4gICAgICovXHJcbiAgICBmaW5pc2hlZENsYXNzPzogc3RyaW5nXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGFzcyBuYW1lIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgcHJvdmlkZWQgcm9vdCBlbGVtZW50cyBvbmNlIHRoZSBjb3VudGRvd24gaGFzIGluaXRpYWxpemVkLlxyXG4gICAgICovXHJcbiAgICBsb2FkaW5nQ2xhc3M/OiBzdHJpbmdcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBkZWZhdWx0IGJlaGF2aW91ciBoYXMgdGhlIGZvbGxvd2luZyBzdGVwczpcclxuICogKiBBZGQgZGVmYXVsdCBiZWhhdmlvciBmb3IgYWRkaW5nIGEgJ2ZpbmlzaGVkJyBjbGFzcyB0byB0aGUgcm9vdHMgb25jZSBmaW5pc2hlZC5cclxuICogKiBJZiBzcGVjaWZpZWQsIGFkZCBjYWxsYmFjayB0byByZW1vdmUgJ2xvYWRpbmcnIGNsYXNzIGZyb20gcm9vdHMuXHJcbiAqICogQ3JlYXRlIGEgXCJkYXRhLSpcIi1iYXNlZCBwYXJzZXIgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cclxuICogKiBQYXJzZSB0aGUgZ2l2ZW4gcm9vdHMgd2l0aCB0aGUgcGFyc2VyIGFuZCBjcmVhdGUgdGhlIGNvdW50ZG93biBsb29wZXIuXHJcbiAqICogUmV0dXJuIHRoZSBjb250cm9scyBmb3IgdGhlIGNyZWF0ZWQgbG9vcGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQ291bnRkb3duKG1pbGxpU2Vjb25kczpudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICByb290czpIVE1MRWxlbWVudHxBcnJheUxpa2U8SFRNTEVsZW1lbnQ+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczpEZWZhdWx0T3B0aW9ucyA9IHt9KTpDb3VudGRvd24uQ29udHJvbGxlciB7XHJcbiAgICB2YXIgcm9vdEFycmF5ID0gY29udmVydFRvQXJyYXkocm9vdHMpO1xyXG5cclxuICAgIC8vRGVmYXVsdCBiZWhhdmlvciwgYWRkIGNsYXNzIG9uIGZpbmlzaFxyXG4gICAgdmFyIG9sZEZpbmlzaGVkQ2FsbGJhY2sgPSBvcHRpb25zLmZpbmlzaGVkQ2FsbGJhY2s7XHJcbiAgICBvcHRpb25zLmZpbmlzaGVkQ2FsbGJhY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIGNsYXp6ID0gb3B0aW9ucy5maW5pc2hlZENsYXNzIHx8IERFRkFVTFRfRklOSVNIRURfQ0xBU1M7XHJcblxyXG4gICAgICAgIC8vQWRkIGNsYXNzIHRvIGFsbCByb290IGVsZW1lbnRzXHJcbiAgICAgICAgZm9yRWFjaChyb290QXJyYXksIChlbGVtOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIENsYXNzTGlzdChlbGVtKS5hZGQoY2xhenopO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL0lmIHRoZXJlIHdhcyBhIGNhbGxiYWNrLCBpbnZva2UgaXRcclxuICAgICAgICBpZiAob2xkRmluaXNoZWRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvbGRGaW5pc2hlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL0RlZmF1bHQgYmVoYXZpb3IsIHJlbW92ZSBsb2FkaW5nIGNsYXNzIG9uY2UgbG9hZGVkXHJcbiAgICBpZiAob3B0aW9ucy5sb2FkaW5nQ2xhc3MpIHtcclxuICAgICAgICB2YXIgb2xkTG9hZGVkQ2FsbGJhY2sgPSBvcHRpb25zLmxvYWRlZENhbGxiYWNrO1xyXG4gICAgICAgIG9wdGlvbnMubG9hZGVkQ2FsbGJhY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vUmVtb3ZlIGxvYWRpbmcgY2xhc3MgZnJvbSBhbGwgcm9vdCBlbGVtZW50c1xyXG4gICAgICAgICAgICBmb3JFYWNoKHJvb3RBcnJheSwgKGVsZW06SFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIENsYXNzTGlzdChlbGVtKS5yZW1vdmUob3B0aW9ucy5sb2FkaW5nQ2xhc3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vSW52b2tlIHRoZSBvbGQgY2FsbGJhY2ssIGlmIGl0IGV4aXN0cy5cclxuICAgICAgICAgICAgaWYgKG9sZExvYWRlZENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBvbGRMb2FkZWRDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyc2VyOlBhcnNlci5QYXJzZXIgPSBuZXcgQVRQYXJzZXIuQXR0cmlidXRlVGVtcGxhdGVQYXJzZXIob3B0aW9ucyk7XHJcbiAgICByZXR1cm4gQ291bnRkb3duLmNyZWF0ZShuZXcgRGF0ZShtaWxsaVNlY29uZHMpLCBwYXJzZXIuYnVpbGQocm9vdEFycmF5KSwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIGEgY291bnRkb3duIHRoYXQgd2lsbCB1cGRhdGUgYSB0ZW1wbGF0ZSB3aXRoaW4gdGhlIGdpdmVuIHJvb3RzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZXBvY2ggdGltZSBpbiBzZWNvbmRzIHNpbmNlIFVOSVggZXBvY2ggYXMgdGFyZ2V0IGZvciB0aGUgY291bnRkb3duLlxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fEFycmF5fSByb290cyBFbGVtZW50cyB0aGF0IGNvbnRhaW4gYSB0ZW1wbGF0ZSB0aGF0IG5lZWRzIHRvIGJlIHVwZGF0ZWQgYmFzZWQgb24gdGhlIGNvdW50ZG93bi5cclxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT3B0aW9ucyB0byBtb2RpZnkgc29tZSBwcm9wZXJ0aWVzIG9mIHRoZSBjb3VudGRvd24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2l0aFNlY29uZHMoZXBvY2g6bnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdHM6SFRNTEVsZW1lbnR8QXJyYXlMaWtlPEhUTUxFbGVtZW50PixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM/OkRlZmF1bHRPcHRpb25zKTpDb3VudGRvd24uQ29udHJvbGxlciB7XHJcbiAgICByZXR1cm4gY3JlYXRlQ291bnRkb3duKGVwb2NoICogMTAwMCwgcm9vdHMsIG9wdGlvbnMpO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBhIGNvdW50ZG93biB0aGF0IHdpbGwgdXBkYXRlIGEgdGVtcGxhdGUgd2l0aGluIHRoZSBnaXZlbiByb290cy5cclxuICpcclxuICogQHBhcmFtIHtEYXRlfG51bWJlcn0gZGF0ZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBzaW5jZSBVTklYIGVwb2NoIGFzIHRhcmdldCBmb3IgdGhlIGNvdW50ZG93bi5cclxuICogQHBhcmFtIHtIVE1MRWxlbWVudHxBcnJheX0gcm9vdHMgRWxlbWVudHMgdGhhdCBjb250YWluIGEgdGVtcGxhdGUgdGhhdCBuZWVkcyB0byBiZSB1cGRhdGVkIGJhc2VkIG9uIHRoZSBjb3VudGRvd24uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgdG8gbW9kaWZ5IHNvbWUgcHJvcGVydGllcyBvZiB0aGUgY291bnRkb3duLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhNaWxsaXMoZGF0ZTpEYXRlfG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdHM6SFRNTEVsZW1lbnR8QXJyYXlMaWtlPEhUTUxFbGVtZW50PixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz86RGVmYXVsdE9wdGlvbnMpOkNvdW50ZG93bi5Db250cm9sbGVyIHtcclxuICAgIHJldHVybiBjcmVhdGVDb3VudGRvd24oTnVtYmVyKGRhdGUpLCByb290cywgb3B0aW9ucyk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVjbC9BcnJheUxpa2UuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWNsL0RpY3QuZC50c1wiIC8+XHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbi8vVE9ET1xyXG5cclxuaW1wb3J0IFBhcnNlciA9IHJlcXVpcmUoJy4vUGFyc2VyJyk7XHJcbmltcG9ydCBQZXJpb2QgPSByZXF1aXJlKCcuLi91bml0L1BlcmlvZCcpO1xyXG5pbXBvcnQgY29weU1hcCA9IHJlcXVpcmUoJy4uL3V0aWwvY29weU1hcCcpO1xyXG5pbXBvcnQgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL3V0aWwvZm9yZWFjaCcpO1xyXG5cclxuZXhwb3J0IHR5cGUgQ2FsbGJhY2sgPSAocGVyaW9kOlBlcmlvZC5QZXJpb2QpID0+IHZvaWQ7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFUUE9wdGlvbnMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0cyB0byB7QHNlZSBET01fRElTUExBWV9BVFRSSUJVVEV9XHJcbiAgICAgKi9cclxuICAgIGRpc3BsYXlBdHRyaWJ1dGU/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0cyB0byB7QHNlZSBET01fSElEQUJMRV9BVFRSSUJVVEV9XHJcbiAgICAgKi9cclxuICAgIGhpZGFibGVBdHRyaWJ1dGU/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0cyB0byB7QHNlZSBERUZBVUxUX0tFWV9QQURESU5HfVxyXG4gICAgICovXHJcbiAgICB6ZXJvUGFkT3ZlcnJpZGVzPzogRGljdDxib29sZWFuPjtcclxufVxyXG5cclxudmFyIERPTV9ESVNQTEFZX0FUVFJJQlVURTpzdHJpbmcgPSBcInRtaW51cy11bml0XCI7XHJcbnZhciBET01fSElEQUJMRV9BVFRSSUJVVEU6c3RyaW5nID0gXCJ0bWludXMtaGlkZS1pZi16ZXJvXCI7XHJcblxyXG4vL0Jhc2VkIG9uIFBlcmlvZC5UaW1lS2V5XHJcbnZhciBERUZBVUxUX0tFWV9QQURESU5HOkRpY3Q8Ym9vbGVhbj4gPSB7XHJcbiAgICBcInNcIjogdHJ1ZSxcclxuICAgIFwiU1wiOiB0cnVlLFxyXG4gICAgXCJtXCI6IHRydWUsXHJcbiAgICBcIk1cIjogdHJ1ZSxcclxuICAgIFwiaFwiOiBmYWxzZSxcclxuICAgIFwiSFwiOiBmYWxzZSxcclxuICAgIFwiRFwiOiBmYWxzZVxyXG59O1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiB6ZXJvUGFkKG51bTpudW1iZXIpOnN0cmluZyB7XHJcbiAgICByZXR1cm4gbnVtIDwgMTAgPyBgMCR7bnVtfWAgOiBgJHtudW19YDtcclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiBub29wWmVyb1BhZChudW06bnVtYmVyKTpzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke251bX1gO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIGFyclxyXG4gKiBAcGFyYW0gaW5kZXhlc1RvUmVtb3ZlXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVBcnJheUluZGV4ZXM8VD4oYXJyOlRbXSwgaW5kZXhlc1RvUmVtb3ZlOm51bWJlcltdKTp2b2lkIHtcclxuICAgIC8vUmVtb3ZlIGVsZW1lbnRzIGluIHJldmVyc2Ugb3JkZXIsIHNpbmNlIHNwbGljZVxyXG4gICAgLy8gY2hhbmdlcyB0aGUgYXJyYXkgbGVuZ3RoIGFuZCBlbGVtZW50IGluZGV4ZXNcclxuICAgIGluZGV4ZXNUb1JlbW92ZS5zb3J0KCk7XHJcbiAgICBmb3IgKHZhciBpID0gaW5kZXhlc1RvUmVtb3ZlLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICAgIGFyci5zcGxpY2UoaW5kZXhlc1RvUmVtb3ZlW2ldLCAxKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHR5cGUgU3ViQ2FsbGJhY2sgPSAocGVyaW9kOlBlcmlvZC5QZXJpb2QpID0+IGJvb2xlYW47XHJcblxyXG4vKipcclxuICpcclxuICogVGhlIGNyZWF0ZWQgY2FsbGJhY2sgd2lsbCByZXR1cm4gZmFsc2Ugd2hlbiBpdCBubyBsb25nZXIgaGFzIHRvIGJlIGNhbGxlZCAoZHVlIHRvIGJlaW5nIGZpbmlzaGVkKVxyXG4gKi9cclxuZnVuY3Rpb24gYnVpbGRVcGRhdGVyKGtleTpQZXJpb2QuVGltZUtleSxcclxuICAgICAgICAgICAgICAgICAgICAgIHplcm9QYWRGdW5jOihuOm51bWJlcikgPT4gc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZEVsZW06SFRNTEVsZW1lbnRbXSxcclxuICAgICAgICAgICAgICAgICAgICAgIGhFbGVtOkhUTUxFbGVtZW50W10sXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbnNpZ25pZmljYW50SGFuZGxlcjooZWw6SFRNTEVsZW1lbnRbXSwga2V5PzpzdHJpbmcpPT52b2lkKTpTdWJDYWxsYmFjayB7XHJcbiAgICB2YXIgcHJldmlvdXNWYWx1ZTpudW1iZXIgPSBOdW1iZXIuTmFOO1xyXG5cclxuICAgIGlmIChkRWxlbS5sZW5ndGggKyBoRWxlbS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy9SZXNldCBoaWRkZW4gdmFsdWVzLCB3aWxsIGJlIGNvcnJlY3RlZCBpbiB0aGUgZmlyc3QgaXRlcmF0aW9uXHJcbiAgICAgICAgZm9yRWFjaChoRWxlbSwgKGVsKSA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiAocGVyaW9kOlBlcmlvZC5QZXJpb2QpID0+IHtcclxuICAgICAgICAgICAgdmFyIHVuaXQgPSBwZXJpb2QuZ2V0VW5pdChrZXkpO1xyXG4gICAgICAgICAgICBpZiAodW5pdC52YWx1ZSAhPT0gcHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNWYWx1ZSA9IHVuaXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGVkVmFsdWUgPSB6ZXJvUGFkRnVuYyhwcmV2aW91c1ZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3JFYWNoKGRFbGVtLCAoZWw6SFRNTEVsZW1lbnQpID0+IGVsLmlubmVySFRNTCA9IHBhZGRlZFZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBPbmNlIGEgdmFsdWUgaXMgbm8gbG9uZ2VyIHNpZ25pZmljYW50IGl0IGNhbm5vdCByZXR1cm4sXHJcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGUgcmV2ZXJzZSBjYXNlIGRvZXMgbm90IG5lZWQgdG8gYmUgaGFuZGxlZFxyXG4gICAgICAgICAgICAgICAgaWYgKCF1bml0LnNpZ25pZmljYW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zaWduaWZpY2FudEhhbmRsZXIoaEVsZW0sIFBlcmlvZC5UaW1lS2V5W2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdW5pdC5zaWduaWZpY2FudDtcclxuICAgICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlVGVtcGxhdGVQYXJzZXIgaW1wbGVtZW50cyBQYXJzZXIuUGFyc2VyIHtcclxuICAgIHByaXZhdGUga0Rpc3BsYXk6c3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBrSGlkYWJsZTpzdHJpbmc7XHJcbiAgICBwcml2YXRlIHBhZEtleXM6RGljdDxib29sZWFuPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdHM6QVRQT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMua0Rpc3BsYXkgPSBvcHRzLmRpc3BsYXlBdHRyaWJ1dGUgfHwgRE9NX0RJU1BMQVlfQVRUUklCVVRFO1xyXG4gICAgICAgIHRoaXMua0hpZGFibGUgPSBvcHRzLmhpZGFibGVBdHRyaWJ1dGUgfHwgRE9NX0hJREFCTEVfQVRUUklCVVRFO1xyXG4gICAgICAgIHRoaXMucGFkS2V5cyA9IGNvcHlNYXAoREVGQVVMVF9LRVlfUEFERElORyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRzLnplcm9QYWRPdmVycmlkZXMpIHtcclxuICAgICAgICAgICAgZm9yRWFjaChPYmplY3Qua2V5cyhvcHRzLnplcm9QYWRPdmVycmlkZXMpLCAoa2V5OnN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKERFRkFVTFRfS0VZX1BBRERJTkdba2V5XSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWRLZXlzW2tleV0gPSBvcHRzLnplcm9QYWRPdmVycmlkZXNba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkKHJvb3RzOkFycmF5TGlrZTxIVE1MRWxlbWVudD4pOkNhbGxiYWNrIHtcclxuICAgICAgICB2YXIgZGlzcGxheUVsZW1lbnRzOkhUTUxFbGVtZW50W10gPSBbXTtcclxuICAgICAgICB2YXIgaGlkYWJsZUVsZW1lbnRzOkhUTUxFbGVtZW50W10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yRWFjaChyb290cywgKGVsOkhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGZvckVhY2goXHJcbiAgICAgICAgICAgICAgICA8Tm9kZUxpc3RPZjxIVE1MRWxlbWVudD4+ZWwucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHt0aGlzLmtEaXNwbGF5fV1gKSxcclxuICAgICAgICAgICAgICAgIChlbCkgPT4gZGlzcGxheUVsZW1lbnRzLnB1c2goZWwpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGZvckVhY2goXHJcbiAgICAgICAgICAgICAgICA8Tm9kZUxpc3RPZjxIVE1MRWxlbWVudD4+ZWwucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHt0aGlzLmtIaWRhYmxlfV1gKSxcclxuICAgICAgICAgICAgICAgIChlbCkgPT4gaGlkYWJsZUVsZW1lbnRzLnB1c2goZWwpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB1cGRhdGVyczpTdWJDYWxsYmFja1tdID0gW107XHJcbiAgICAgICAgZm9yRWFjaChPYmplY3Qua2V5cyh0aGlzLnBhZEtleXMpLCAoa2V5OnN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdXBkYXRlciA9IGJ1aWxkVXBkYXRlcihcclxuICAgICAgICAgICAgICAgIFBlcmlvZC5UaW1lS2V5W2tleV0sXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZEtleXNba2V5XSA/IHplcm9QYWQgOiBub29wWmVyb1BhZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlFbGVtZW50cy5maWx0ZXIoKGVsKSA9PiBlbC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHt0aGlzLmtEaXNwbGF5fWApID09PSBrZXkpLFxyXG4gICAgICAgICAgICAgICAgaGlkYWJsZUVsZW1lbnRzLmZpbHRlcigoZWwpID0+IGVsLmdldEF0dHJpYnV0ZShgZGF0YS0ke3RoaXMua0hpZGFibGV9YCkgPT09IGtleSksXHJcbiAgICAgICAgICAgICAgICAoZWxzKSA9PiBmb3JFYWNoKGVscywgKGVsKSA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIpXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAodXBkYXRlcikge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlcnMucHVzaCh1cGRhdGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gKHA6UGVyaW9kLlBlcmlvZCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdG9SZW1vdmU6bnVtYmVyW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvckVhY2godXBkYXRlcnMsICh1cGRhdGVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVwZGF0ZXIocCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1VwZGF0ZXIgZmluaXNoZWQsIHF1ZXVlIGZvciByZW1vdmFsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUucHVzaCh1cGRhdGVycy5pbmRleE9mKHVwZGF0ZXIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodG9SZW1vdmUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvL1JlbW92ZSB0aGUgZWxlbWVudHMgYXQgdGhlIGdpdmVuIGluZGV4ZXNcclxuICAgICAgICAgICAgICAgIHJlbW92ZUFycmF5SW5kZXhlcyh1cGRhdGVycywgdG9SZW1vdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBQZXJpb2QgPSByZXF1aXJlKCcuL1BlcmlvZCcpO1xyXG5cclxuLyoqXHJcbiAqIEFuIEluc3RhbnQgcmVwcmVzZW50cyBhbiBpbW11dGFibGUgcG9pbnQgaW4gdGltZS5cclxuICpcclxuICogSXQgY2FuIHJlcHJlc2VudCBhbnkgbWlsbGlzZWNvbmQgdGhhdCBpcyByZXByZXNlbnRhYmxlIGFzIGFuIG9mZnNldCBvZiBFcG9jaCB0aW1lLlxyXG4gKi9cclxuY2xhc3MgSW5zdGFudCB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhbiBpbnN0YW50IGZvciB0aGUgZ2l2ZW4gRXBvY2ggdGltZS5cclxuICAgICAqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlcG9jaCBtaWxsaXNlY29uZHMgc2luY2UgemVybyBlcG9jaCAobWlkbmlnaHQgVVRDLCAxc3QgSmFuIDE5NzApXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZXBvY2g6bnVtYmVyKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgamF2YXNjcmlwdCBEYXRlIG9iamVjdCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhpcyBpbnN0YW50IGluIHRpbWUuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhpcyBvYmplY3QgaXMgaW52YWxpZCB7QHNlZSBJbnN0YW50I2lzVmFsaWR9LCB0aGUgcmVzdWx0aW5nIGRhdGUgd2lsbCBiZSBpbnZhbGlkIGFzIHdlbGwuXHJcbiAgICAgKi9cclxuICAgIHRvRGF0ZSgpOkRhdGUge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmVwb2NoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGlzIGluc3RhbnQgcmVwcmVzZW50cyBhIHZhbGlkIG1vbWVudCBpbiB0aW1lXHJcbiAgICAgKi9cclxuICAgIGlzVmFsaWQoKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKCFpc05hTih0aGlzLmVwb2NoKSkgJiYgaXNGaW5pdGUodGhpcy5lcG9jaCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBwZXJpb2Qgb2YgdGltZSB0aGF0IGhhcyB0byBlbGFwc2UgcmVsYXRpdmUgdG8gdGhpcyBpbnN0YW50IGJlZm9yZSBpdCBwYXNzZXMgdGhlIHJlZmVyZW5jZSBpbnN0YW50LlxyXG4gICAgICpcclxuICAgICAqIGVhcmxpZXIudW50aWwobGF0ZXIpIHdpbGwgcmVzdWx0IGluIHRoZSBQZXJpb2QgdW50aWwgdGhhdCBsYXRlciBwb2ludC5cclxuICAgICAqIGxhdGVyLnVudGlsKGVhcmxpZXIpIHdpbGwgcmVzdWx0IGluIGEgemVybyBQZXJpb2QsIHNpbmNlIHRoZSBwb2ludCBpbiB0aW1lIGhhcyBlbGFwc2VkLlxyXG4gICAgICogc2FtZS51bnRpbChzYW1lKSB3aWxsIHJldHVybiBhIHplcm8gUGVyaW9kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SW5zdGFudH0gb3RoZXJJbnN0YW50IHJlZmVyZW5jZSBwb2ludCB0byBzb21lIGZ1dHVyZSBpbnN0YW50XHJcbiAgICAgKi9cclxuICAgIHVudGlsKG90aGVySW5zdGFudDpJbnN0YW50KTpQZXJpb2QuUGVyaW9kIHtcclxuICAgICAgICByZXR1cm4gUGVyaW9kLm9mTWlsbGlzKG90aGVySW5zdGFudC5lcG9jaCAtIHRoaXMuZXBvY2gpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IEluc3RhbnQgdGhhdCBpcyBvZmZzZXQgZnJvbSB0aGlzIEluc3RhbnQgYnkgdGhlIGdpdmVuIFBlcmlvZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBmb2xsb3cgdGhlIGZvbGxvd2luZyBjb250cmFjdDogSW5zdGFudC51bnRpbChJbnN0YW50LmFkZChQZXJpb2QpKS5lcShQZXJpb2QpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtQZXJpb2R9IHBlcmlvZCBvZmZzZXQgb2YgdGhlIHJldHVybmVkIEluc3RhbnQgcmVsYXRpdmUgdG8gdGhpcyBJbnN0YW50XHJcbiAgICAgKi9cclxuICAgIGFkZChwZXJpb2Q6UGVyaW9kLlBlcmlvZCk6SW5zdGFudCB7XHJcbiAgICAgICAgcmV0dXJuIEluc3RhbnQubWFrZSh0aGlzLmVwb2NoICsgcGVyaW9kLnRvU2Vjb25kcygpICogMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgbmV3IEluc3RhbnQgb2JqZWN0cyB1c2luZyBlaXRoZXIgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgc2luY2UgemVybyBlcG9jaCBvclxyXG4gICAgICogYSBqYXZhc2NyaXB0IERhdGUgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfERhdGV9IGRhdGUgcG9pbnQgaW4gdGltZSB0aGF0IHRoZSBuZXcgSW5zdGFudCB3aWxsIHJlZmVyIHRvLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgbWFrZShkYXRlOm51bWJlcnxEYXRlKTpJbnN0YW50IHtcclxuICAgICAgICBpZiAodHlwZW9mIGRhdGUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnN0YW50KGRhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW5zdGFudChkYXRlLmdldFRpbWUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgPSBJbnN0YW50OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBFbnVtIHdoaWNoIHJlcHJlc2VudHMgYWxsIHRoZSB0aW1lIHVuaXRzIHRoYXQgY2FuIGJlIGRlcml2ZWQgZnJvbSBhIFBlcmlvZFxyXG4gKlxyXG4gKiBVcHBlcmNhc2UgdGltZSB1bml0cyBhcmUgYWJzb2x1dGVcclxuICogTG93ZXJjYXNlIHRpbWUgdW5pdHMgYXJlIHJlbGF0aXZlIHRvIHRoZWlyIHBhcmVudCB1bml0cyAoZS5nLiBtaW51dGVzIHNpbmNlIGxhc3QgaG91cilcclxuICpcclxuICogQ3VycmVudGx5IHN1cHBvcnRlZCB1bml0czogU2Vjb25kcywgTWludXRlcywgSG91cnMgYW5kIERheXMuXHJcbiAqXHJcbiAqIEBzZWUge1BlcmlvZCNnZXRVbml0fVxyXG4gKi9cclxuZXhwb3J0IGVudW0gVGltZUtleVxyXG57XHJcbiAgICBzLCAvLyBzZWNvbmRzIHNpbmNlIGxhc3QgbWludXRlXHJcbiAgICBTLCAvLyBzZWNvbmRzIHNpbmNlIGVwb2NoXHJcbiAgICBtLCAvLyBtaW51dGVzIHNpbmNlIGxhc3QgaG91clxyXG4gICAgTSwgLy8gbWludXRlcyBzaW5jZSBlcG9jaFxyXG4gICAgaCwgLy8gaG91cnMgc2luY2UgbGFzdCBkYXlcclxuICAgIEgsIC8vIGhvdXJzIHNpbmNlIGVwb2NoXHJcbiAgICBEICAvLyBkYXlzIHNpbmNlIGVwb2NoXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGltZVZhbHVlIHtcclxuICAgIC8qKlxyXG4gICAgICogVmFsdWUgb2YgdGhlIGluc3RhbnQgd2l0aCB0aGUgZ2l2ZW4gcmVmZXJlbmNlIHBvaW50LiAoQWJzb2x1dGUgb3IgUmVsYXRpdmUsIHNlZSBUaW1lS2V5KVxyXG4gICAgICovXHJcbiAgICB2YWx1ZTpudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIHRoZSB2YWx1ZSBpcyBzdGlsbCBzaWduaWZpY2FudCwgYSB2YWx1ZSBiZWNvbWVzIG5vbi1zaWduaWZpY2FudCBpZiBpdCBwYXNzZXMgYSBwb2ludCB3aGVyZSBpdFxyXG4gICAgICogd2lsbCBldmVyIGJlIG5vbi16ZXJvIGFzc3VtaW5nIHRoZSBwZXJpb2Qgb25seSBkZWNyZWFzZXMuXHJcbiAgICAgKi9cclxuICAgIHNpZ25pZmljYW50OmJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IG1ldGhvZCB0byBjb252ZXJ0IGEgUGVyaW9kIGluIHNlY29uZHMgaW50byBhbm90aGVyIHVuaXQgb2YgdGltZS5cclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHNlY29uZHMgbnVtYmVyIG9mIHNlY29uZHMgdG8gY29udmVydCBmcm9tLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gcGFyZW50Qm91bmRhcnkgbnVtYmVyIG9mIHNlY29uZHMgYXQgd2hpY2ggdGhlIHVuaXQgYmVjb21lcyBhbm90aGVyIHVuaXQsIGFjdHMgYXMgbW9kdWxvLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gc3RlcFNpemUgbnVtYmVyIG9mIHNlY29uZHMgZm9yIDEgdW5pdC5cclxuICovXHJcbmZ1bmN0aW9uIGV4dHJhY3RVbml0KHNlY29uZHM6bnVtYmVyLCBwYXJlbnRCb3VuZGFyeTpudW1iZXIsIHN0ZXBTaXplOm51bWJlcik6VGltZVZhbHVlIHtcclxuICAgIHJldHVybiB7dmFsdWU6IE1hdGguZmxvb3IoKHNlY29uZHMgJSBwYXJlbnRCb3VuZGFyeSkgLyBzdGVwU2l6ZSksIHNpZ25pZmljYW50OiBzZWNvbmRzID49IHN0ZXBTaXplfTtcclxufVxyXG5cclxudmFyIFNFQ09ORF9JTl9TRUNPTkRTID0gMTtcclxudmFyIE1JTlVURV9JTl9TRUNPTkRTID0gU0VDT05EX0lOX1NFQ09ORFMgKiA2MDtcclxudmFyIEhPVVJfSU5fU0VDT05EUyA9IE1JTlVURV9JTl9TRUNPTkRTICogNjA7XHJcbnZhciBEQVlfSU5fU0VDT05EUyA9IEhPVVJfSU5fU0VDT05EUyAqIDI0O1xyXG4vL0luZmluaXRlIGZvciB0aGUgcHVycG9zZXMgb2YgdGhpcyBsaWJyYXJ5XHJcbnZhciBJTkZJTklURV9TRUNPTkRTID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuXHJcbi8qKlxyXG4gKiBBIHBlcmlvZCByZXByZXNlbnRzIGFuIGltbXV0YWJsZSBwb3NpdGl2ZSBsZW5ndGggb2YgdGltZSBpbiBzZWNvbmRzLlxyXG4gKlxyXG4gKiBUaGlzIGNsYXNzIGhhcyBhIG51bWJlciBvZiBtZXRob2RzIHRvIGNvbnZlcnQgaXRzIGxlbmd0aCB0byBkaWZmZXJlbnQgdGltZSBzY2FsZXMsXHJcbiAqIHNlZSB7QHNlZSBQZXJpb2QjZ2V0VW5pdH0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcclxuICAgIHByaXZhdGUgc2Vjb25kczpudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBwZXJpb2QgZm9yIHRoZSBnaXZlbiBsZW5ndGggaW4gc2Vjb25kcy5cclxuICAgICAqIElmIHRoZSBnaXZlbiBsZW5ndGggaXMgbmVnYXRpdmUgaXQgd2lsbCBiZSB0cmVhdGVkIGFzIGlmIGl0IHdhcyB6ZXJvLlxyXG4gICAgICpcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNlY29uZHMgbGVuZ3RoIG9mIHRoaXMgcGVyaW9kXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHNlY29uZHM6bnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZWNvbmRzID0gTWF0aC5tYXgoc2Vjb25kcywgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBlcmlvZCB3aXRoIGEgbGVuZ3RoIHRoYXQgaXMgYWJvdmUgemVybyB3aWxsIG5vdCBiZSBmaW5pc2hlZCwgYW55IG90aGVyIGxlbmd0aHMgd2lsbCBiZSBmaW5pc2hlZC5cclxuICAgICAqL1xyXG4gICAgaXNGaW5pc2hlZCgpOmJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlY29uZHMgPD0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsaWFzIGZvciBQZXJpb2QuZ2V0VW5pdChUaW1lS2V5LlMpLnZhbHVlXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJucyB0aGUgdG90YWwgbGVuZ3RoIG9mIHRoaXMgcGVyaW9kIGluIHNlY29uZHMuXHJcbiAgICAgKi9cclxuICAgIHRvU2Vjb25kcygpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VW5pdChUaW1lS2V5LlMpLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWV0aG9kIHRvIGNvbnZlcnQgdGhpcyBwZXJpb2QgaW50byBvdGhlciB1bml0cyBvZiB0aW1lLlxyXG4gICAgICpcclxuICAgICAqIFNlZSB7QHNlZSBUaW1lS2V5fSBmb3IgdGhlIHN1cHBvcnRlZCB0aW1lIHVuaXRzLlxyXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCByZXR1cm4ge0BzZWUgVGltZVZhbHVlfSBkZXNjcmliaW5nIHRoZSB2YWx1ZSBpbiB0aGUgZ2l2ZW4gdGltZSB1bml0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0ga2V5IHZhbHVlIGtleSB0byBjb252ZXJ0IHRvLCBzZWUge0BzZWUgVGltZUtleX0gZm9yIHBvc3NpYmxlIHZhbHVlcy5cclxuICAgICAqL1xyXG4gICAgZ2V0VW5pdChrZXk6c3RyaW5nfFRpbWVLZXkpOlRpbWVWYWx1ZSB7XHJcbiAgICAgICAgdmFyIGs6VGltZUtleTtcclxuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBrID0gVGltZUtleVtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGsgPSBrZXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2Vjb25kcyA9IHRoaXMuc2Vjb25kcztcclxuICAgICAgICBzd2l0Y2ggKGspIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lS2V5LnM6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdFVuaXQoc2Vjb25kcywgTUlOVVRFX0lOX1NFQ09ORFMsIFNFQ09ORF9JTl9TRUNPTkRTKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lS2V5LlM6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdFVuaXQoc2Vjb25kcywgSU5GSU5JVEVfU0VDT05EUywgU0VDT05EX0lOX1NFQ09ORFMpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVLZXkubTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBleHRyYWN0VW5pdChzZWNvbmRzLCBIT1VSX0lOX1NFQ09ORFMsIE1JTlVURV9JTl9TRUNPTkRTKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lS2V5Lk06XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdFVuaXQoc2Vjb25kcywgSU5GSU5JVEVfU0VDT05EUywgTUlOVVRFX0lOX1NFQ09ORFMpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVLZXkuaDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBleHRyYWN0VW5pdChzZWNvbmRzLCBEQVlfSU5fU0VDT05EUywgSE9VUl9JTl9TRUNPTkRTKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lS2V5Lkg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdFVuaXQoc2Vjb25kcywgSU5GSU5JVEVfU0VDT05EUywgSE9VUl9JTl9TRUNPTkRTKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lS2V5LkQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdFVuaXQoc2Vjb25kcywgSU5GSU5JVEVfU0VDT05EUywgREFZX0lOX1NFQ09ORFMpO1xyXG4gICAgICAgICAgICBkZWZhdWx0IDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA8VGltZVZhbHVlPnt2YWx1ZTogTmFOLCBzaWduaWZpY2FudDogdHJ1ZX07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBnaXZlbiBwZXJpb2QgaXMgZXF1YWwgdG8gdGhpcyBwZXJpb2QgaW4gdGVybXMgb2YgbGVuZ3RoLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwZXJpb2QgdGhlIG90aGVyIHBlcmlvZFxyXG4gICAgICovXHJcbiAgICBlcShwZXJpb2Q6UGVyaW9kKTpib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWNvbmRzID09PSBwZXJpb2Quc2Vjb25kcztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhIHBlcmlvZCB3aXRoIGEgbGVuZ3RoIGVxdWFsIHRvICB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cclxuICpcclxuICogQmUgYXdhcmUgdGhhdCB0aGUgcGVyaW9kIHdpbGwgYmUgbGltaXRlZCB0byBhIHByZWNpc2lvbiBpbiBzZWNvbmRzIGFuZCB3aWxsIGJlIGxpbWl0ZWQgdG8gcG9zaXRpdmUgdmFsdWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWlsbGlTZWNvbmRzIGxlbmd0aCBvZiB0aGUgY3JlYXRlZCBwZXJpb2QgaW4gbWlsbGlzZWNvbmRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb2ZNaWxsaXMobWlsbGlTZWNvbmRzOm51bWJlcik6UGVyaW9kIHtcclxuICAgIHJldHVybiBuZXcgUGVyaW9kKE1hdGguZmxvb3IobWlsbGlTZWNvbmRzIC8gMTAwMCkpO1xyXG59XHJcblxyXG4vKipcclxuICogRmFjdG9yeSBtZXRob2QgdG8gY3JlYXRlIGEgcGVyaW9kIHdpdGggYSBsZW5ndGggZXF1YWwgdG8gdGhlIGdpdmVuIG51bWJlciBvZiBzZWNvbmRzLlxyXG4gKlxyXG4gKiBCZSBhd2FyZSB0aGF0IHRoZSBwZXJpb2Qgd2lsbCBiZSBsaW1pdGVkIHRvIHBvc2l0aXZlIHZhbHVlcy5cclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHNlY29uZHMgbGVuZ3RoIG9mIHRoZSBjcmVhdGVkIHBlcmlvZCBpbiBzZWNvbmRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb2ZTZWNvbmRzKHNlY29uZHM6bnVtYmVyKTpQZXJpb2Qge1xyXG4gICAgcmV0dXJuIG5ldyBQZXJpb2QoTWF0aC5mbG9vcihzZWNvbmRzKSk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVjbC9EaWN0LmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgZm9yRWFjaCA9IHJlcXVpcmUoJy4vZm9yZWFjaCcpO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGdpdmVuIGtleS12YWx1ZSBtYXAuXHJcbiAqXHJcbiAqIE9ubHkgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyB0aGF0IGFyZSBvd25lZCBieSB0aGUgZ2l2ZW4gbWFwIGFyZSBjb3BpZWQuXHJcbiAqIFRoZSBwcm90b3R5cGUgY2hhaW4gd2lsbCBub3QgYmUgY29waWVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gb3JpZ2luYWwgbWFwIHRvIGNvcHkuXHJcbiAqL1xyXG5mdW5jdGlvbiBjb3B5TWFwPFQ+KG9yaWdpbmFsOkRpY3Q8VD4pOkRpY3Q8VD4ge1xyXG4gICAgdmFyIHJldDpEaWN0PFQ+ID0ge307XHJcblxyXG4gICAgZm9yRWFjaChPYmplY3Qua2V5cyhvcmlnaW5hbCksIChrZXk6c3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0W2tleV0gPSBvcmlnaW5hbFtrZXldO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuZXhwb3J0ID0gY29weU1hcDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBudW1iZXIgb2Ygc2Vjb25kcyBzaW5jZSB6ZXJvIGVwb2NoLiAobWlkbmlnaHQgVVRDLCAxc3QgSmFuIDE5NzApXHJcbiAqXHJcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbm90IGltcGxlbWVudGVkIGJ5IHRoZSBIVE1MNSBwZXJmb3JtYW5jZSBBUEkgc2luY2UgdGhlIHJlc29sdXRpb24gaXMgbm90IHJlcXVpcmVkXHJcbiAqIGFuZCBpcyBpdCBzbG93ZXIgaW4gcHJhY3Rpc2UgdGhhbiBvdGhlciBtZXRob2RzOiBodHRwOi8vanNwZXJmLmNvbS9jdXJyZW50LWRhdGVcclxuICovXHJcbnZhciBlcG9jaDooKSA9PiBudW1iZXI7XHJcblxyXG4vL0F0dGVtcHQgRGF0ZS5ub3csIG90aGVyd2lzZSB1c2UgRGF0ZS5nZXRUaW1lIGZhbGxiYWNrXHJcbmlmICh0eXBlb2YgRGF0ZS5ub3cgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZXBvY2ggPSBEYXRlLm5vdztcclxufSBlbHNlIHtcclxuICAgIGVwb2NoID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0ID0gZXBvY2g7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlY2wvQXJyYXlMaWtlLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB3aGljaCB3aWxsIGl0ZXJhdGUgdGhyb3VnaCB0aGUgZ2l2ZW4gYXJyYXkgYW5kIGNhbGwgdGhlIGNhbGxiYWNrIHdpdGhpbiB0aGUgZ2l2ZW4gc2NvcGUuXHJcbiAqIEVsZW1lbnRzIG9mIHRoZSBnaXZlbiBhcnJheSB3aWxsIHByb3ZpZGVkIHRvIHRoZSBjYWxsYmFjayBpbiBzZXF1ZW5jZS5cclxuICpcclxuICogVGhpcyBtZXRob2QgaXMgdXNlZCBpbnN0ZWFkIG9mIHtAc2VlIEFycmF5I2ZvckVhY2h9IHNpbmNlIHRoZXJlIGFyZSBhcnJheS1saWtlIHN0cnVjdHVyZXMgd2hpY2ggZG8gbm90IGhhdmVcclxuICogdGhpcyBtZXRob2QgYW5kIGNhbGxpbmcgdGhlIGZ1bmN0aW9uIHRocm91Z2ggdGhlIHByb3RvdHlwZSByZWxpZXMgb24gaW1wbGVtZW50YXRpb24gZGV0YWlscy5cclxuICpcclxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgYXJyYXkgb2YgdmFsdWVzIHRvIGl0ZXJhdGUgb3ZlclxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBjYWxsYmFjayB0byBjYWxsIG9uIGVhY2ggZWxlbWVudFxyXG4gKiBAcGFyYW0ge29iamVjdH0gc2NvcGUgc2NvcGUgdG8gY2FsbCB0aGUgY2FsbGJhY2sgaW4sIGNhbiBiZSB1bmRlZmluZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JFYWNoPFQ+KGFycmF5OkFycmF5TGlrZTxUPiwgY2FsbGJhY2s6KHZhbHVlOlQsIGluZGV4Om51bWJlcikgPT4gYW55LCBzY29wZT86YW55KTp2b2lkIHtcclxuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgPSBmb3JFYWNoOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB3aW5kb3dSZWYgPSB3aW5kb3c7XHJcblxyXG52YXIgVkVORE9SX1BSRUZJWEVTOnN0cmluZ1tdID0gW1xyXG4gICAgXCJ3ZWJraXRcIixcclxuICAgIFwiV2Via2l0XCIsXHJcbiAgICBcIm1zXCIsXHJcbiAgICBcIk1velwiLFxyXG4gICAgXCJtb3pcIixcclxuICAgIFwiT1wiLFxyXG4gICAgXCJvXCIsXHJcbl07XHJcblxyXG52YXIgcHJlZml4ZXNMZW4gPSBWRU5ET1JfUFJFRklYRVMubGVuZ3RoO1xyXG5cclxuLyoqXHJcbiAqIENhcGl0YWxpemVzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGdpdmVuIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gY2FwaXRhbGl6ZU5hbWUobmFtZTpzdHJpbmcpOnN0cmluZyB7XHJcbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHb2VzIHRocm91Z2ggdGhlIHZhcmlvdXMgdmVuZG9yIHByZWZpeGVzIGFuZCBhdHRlbXB0cyB0byBmaW5kIGEgcHJvcGVydHkgb24gdGhlIGdpdmVuIG9iamVjdCB3aXRoIGEgcHJlZml4ZWRcclxuICogdmFyaWF0aW9uIG9mIHRoZSBnaXZlbiBwcm9wZXJ0eSBuYW1lLlxyXG4gKlxyXG4gKiBXaWxsIHJldHVybiB1bmRlZmluZWQgaWYgaXQgY2Fubm90IGZpbmQgYW55IHZlcnNpb24gb2YgdGhlIHByb3BlcnR5LlxyXG4gKi9cclxuZnVuY3Rpb24gZmluZFByZWZpeGVkT2JqZWN0PFQ+KG5hbWU6c3RyaW5nLCBvYmo6YW55KTpUIHtcclxuICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgIHZhciB1bnByZWZpeGVkTmFtZSA9IGNhcGl0YWxpemVOYW1lKG5hbWUpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXNMZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdG1wID0gb2JqW1ZFTkRPUl9QUkVGSVhFU1tpXSArIHVucHJlZml4ZWROYW1lXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0bXAgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0bXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBvb3IgbWFucyB2ZXJzaW9uIG9mIE1vZGVybml6ci5wcmVmaXhlZCwgaXQgd2lsbCBhdHRlbXB0IHRvIGZpbmQgYSBwb3RlbnRpYWxseSB2ZW5kb3ItcHJlZml4ZWQgcHJvcGVydHkgb24gYSBnaXZlblxyXG4gKiBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gbG9vayBmb3JcclxuICogQHBhcmFtIHtvYmplY3R9IG9iaiBvYmplY3QgaW4gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgc2VhcmNoZWQgZm9yLCBpZiB1bmRlZmluZWQgd2lsbCB1c2UgdGhlIHdpbmRvdyBvYmplY3QuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY29wZSBpZiBhIGZ1bmN0aW9uIGlzIGZvdW5kLCBpdCB3aWxsIGJlIGJvdW5kIHRvIHRoaXMgb2JqZWN0IGJlZm9yZSBiZWluZyByZXR1cm5lZC5cclxuICovXHJcbmZ1bmN0aW9uIFByZWZpeGVkPFQ+KHN0cjpzdHJpbmcsIG9iajphbnkgPSB3aW5kb3dSZWYsIHNjb3BlOmFueSA9IG9iaik6VCB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gb2JqW3N0cl07XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAvL0F0dGVtcHQgdG8gZmluZCBwcmVmaXhlZCB2ZXJzaW9uXHJcbiAgICAgICAgdGFyZ2V0ID0gZmluZFByZWZpeGVkT2JqZWN0KHN0ciwgb2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRhcmdldCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuICg8RnVuY3Rpb24+dGFyZ2V0KS5iaW5kKHNjb3BlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0ID0gUHJlZml4ZWQ7Il19
