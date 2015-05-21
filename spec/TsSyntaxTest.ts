/**
 This file purely exists to make sure the expected syntax passes typescript type-checking
 */

import TminusLib = require("../src/lib");

function noop() {
    var control = TminusLib.countdown({
        endTime: new Date().getTime() + (1000 * 60 * 60),
        target: <NodeListOf<HTMLElement>>document.querySelectorAll('#countdown')
    });
    control.stopCountdown(); //Stop the countdown!
}