'use strict';

import prefixed = require("./prefixed");

var perf:Performance = prefixed<Performance>('performance');

/**
 * A utility function that returns the current number of seconds since zero epoch. (midnight UTC, 1st Jan 1970)
 *
 * Where possible it will use the high-resolution HTML5 performance api,
 * otherwise it will fall back to Date-based methods.
 */
var epoch:() => number;

if (perf && perf.timing && typeof perf.now === "function") {
    //HTML5 performance API is available
    epoch = () => {
        return perf.now() + perf.timing.navigationStart;
    };
} else {
    //Attempt Date.now, otherwise use Date.getTime fallback
    if (typeof Date.now === "function") {
        epoch = Date.now;
    } else {
        epoch = () => {
            return new Date().getTime();
        }
    }
}

export = epoch;