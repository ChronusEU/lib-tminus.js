/// <reference path="../../typings/tsd.d.ts" />
'use strict';

import Countdown = require("../../src/countdown/Countdown");

describe("Countdown", () => {
    it("should throw an error if an invalid date is passed", function () {
        expect(() => {
            Countdown.create(
                new Date("hi mark"),
                () => {
                },
                {}
            );
        }).toThrow();
    });
});