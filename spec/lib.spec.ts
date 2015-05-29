/// <reference path="../typings/jasmine/jasmine.d.ts" />
'use strict';

import lib = require('../src/lib');

describe("Library entry point", () => {
    it("should accept different input permutations", function () {
        expect(() => lib.countdown({
            endTime: 0,
            target: []
        })).not.toThrow();
        expect(() => lib.countdown({
            endTime: new Date(),
            target: []
        })).not.toThrow();
        expect(() => lib.countdown({
            endTime: Date.now(),
            target: []
        })).not.toThrow();
    });
});