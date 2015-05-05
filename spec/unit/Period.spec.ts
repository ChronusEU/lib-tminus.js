/// <reference path="../../typings/jasmine/jasmine.d.ts" />
'use strict';

interface DateParams {
    year?:number;
    month?:number;
    day?:number;
    hour?:number;
    minute?:number;
}

import Period = require("../../src/unit/Period");
import Instant = require('../../src/unit/Instant');

function createDate(param:DateParams, base:Date = new Date(0)):Date {
    var d = new Date(base.getTime());
    if (param.year) d.setUTCFullYear(param.year);
    if (param.month) d.setUTCMonth(param.month);
    if (param.day) d.setUTCDate(param.day);
    if (param.hour) d.setUTCHours(param.hour);
    if (param.minute) d.setUTCMinutes(param.minute);
    return d;
}

var MINUTE_IN_SECONDS = 60;
var HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
var DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

describe("Period", () => {
    it("should handle a normal situation correctly", function () {
        var testInstant = Instant.make(createDate({
            hour: 1,
            minute: 3
        }));
        var period = Instant.make(0).until(testInstant);

        var tmp:Period.TimeValue;

        // seconds should be 0, but still significant
        tmp = period.getUnit(Period.TimeKey.s);
        expect(tmp.value).toEqual(0);
        expect(tmp.significant).toEqual(true);

        // minute should be 3
        tmp = period.getUnit(Period.TimeKey.m);
        expect(tmp.value).toEqual(3);
        expect(tmp.significant).toEqual(true);

        // hours should be 1
        tmp = period.getUnit(Period.TimeKey.h);
        expect(tmp.value).toEqual(1);
        expect(tmp.significant).toEqual(true);

        // days should be 0
        tmp = period.getUnit(Period.TimeKey.D);
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
        expect(p.getUnit(Period.TimeKey.S).value).toEqual(p.toSeconds());
    });

    it("should be equivalently constructed", function () {
        //Ensure the equality checker is working as it should
        var p = Period.ofSeconds(123);
        expect(p.eq(p)).toEqual(true);
        expect(p.eq(Period.ofSeconds(0))).toEqual(false);
        //Different objects, same length
        expect(p.eq(Period.ofSeconds(123))).toEqual(true);

        expect(Period.ofMillis(1000).eq(
            Period.ofSeconds(1)
        )).toEqual(true);

        //Are both rounded down to nearest second
        expect(Period.ofMillis(999).eq(
            Period.ofSeconds(0.999)
        )).toEqual(true);
    });

    it("should not be affected by DST transitions", function () {
        // Since these tests depends on the timezone they are executed in,
        // they are only applied if the timezone of the two dates actually differ.
        function createDSTTest(param1:DateParams,
                               param2:DateParams,
                               cb:(p:Period.Period) => void):void {
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
        }, (p) => {
            var tmp = p.getUnit(Period.TimeKey.H);
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
        }, (p) => {
            var tmp = p.getUnit(Period.TimeKey.H);
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
        var tmp:Period.TimeValue;
        var key = Period.TimeKey.s;

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
        var tmp:Period.TimeValue;
        var key = Period.TimeKey.m;

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
        var tmp:Period.TimeValue;
        var key = Period.TimeKey.h;

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
        var tmp:Period.TimeValue;
        var key = Period.TimeKey.D;

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
        var tmp:Period.TimeValue;
        var key:Period.TimeKey;

        key = Period.TimeKey.S;
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

        key = Period.TimeKey.M;
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS - 1).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 minutes, 59 seconds
        tmp = Period.ofSeconds(MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 minute, 0 seconds
        tmp = Period.ofSeconds(HOUR_IN_SECONDS + MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(61); // 61 minute, 0 seconds

        key = Period.TimeKey.H;
        tmp = Period.ofSeconds(HOUR_IN_SECONDS - MINUTE_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(0); // 0 hours, 59 minutes
        tmp = Period.ofSeconds(HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(1); // 1 hour, 0 minutes
        tmp = Period.ofSeconds(2 * HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(2); // 2 hours, 0 minutes
        tmp = Period.ofSeconds(DAY_IN_SECONDS + HOUR_IN_SECONDS).getUnit(key);
        expect(tmp.value).toEqual(25); // 25 hours, 0 minutes

        key = Period.TimeKey.D;
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