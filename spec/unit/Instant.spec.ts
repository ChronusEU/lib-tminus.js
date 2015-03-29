/// <reference path="../../typings/tsd.d.ts" />
'use strict';

import Instant = require('../../src/unit/Instant');

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
});