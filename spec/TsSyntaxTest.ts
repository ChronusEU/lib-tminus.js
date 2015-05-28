/**
 This file purely exists to make sure the expected syntax passes typescript type-checking
 */

import TminusLib = require("../src/lib");

function noop() {
    var control = TminusLib.countdown({
        endTime: new Date().getTime() + (1000 * 60 * 60),
        target: <NodeListOf<HTMLElement>>document.querySelectorAll('#countdown'),
        finishedClass: "finished",
        loadingClass: "loading",
        finishedCallback: () => {
            console.log("finished");
        },
        loadingCallback: () => {
            console.log("loaded");
        },
        displayAttribute: "tminus-unit",
        hidableAttribute: "tminus-hide-if-zero",
        zeroPadOverrides: {
            "D": false
        }
    });
    control.stop(); //Stop the countdown!
    control.start();
    control.currentPeriod();
    control.lastUpdate();
}