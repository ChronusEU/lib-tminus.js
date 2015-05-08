/// <reference path="../typings/jasmine/jasmine.d.ts" />
'use strict';

import lib = require('../src/lib');

describe("Library entry point", () => {
    it("should accept seconds", function () {
        expect(() => lib.withSeconds(0, [])).not.toThrow();
        expect(() => lib.withSeconds(Date.now() / 1000, [])).not.toThrow();
    });

    it("should accept milliseconds", function () {
        expect(() => lib.withMillis(0, [])).not.toThrow();
        expect(() => lib.withMillis(new Date(), [])).not.toThrow();
        expect(() => lib.withMillis(Date.now(), [])).not.toThrow();
    });
});