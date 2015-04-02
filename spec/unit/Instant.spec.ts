/// <reference path="../../typings/tsd.d.ts" />
'use strict';

import Instant = require('../../src/unit/Instant');
import Period = require('../../src/unit/Period');

describe("Instant", () => {
    it('should allow construction with a number', function () {
        expect(() => Instant.make(0)).not.toThrow();
        expect(Instant.make(0).isValid()).toEqual(true);
    });

    it('should allow construction with a Date', function () {
        expect(() => Instant.make(new Date())).not.toThrow();
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
    })
});