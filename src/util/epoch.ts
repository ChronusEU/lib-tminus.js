'use strict';

/**
 * A utility function that returns the current number of seconds since zero epoch. (midnight UTC, 1st Jan 1970)
 *
 * This function is not implemented by the HTML5 performance API since the resolution is not required
 * and is it slower in practise than other methods: http://jsperf.com/current-date
 */
var epoch:() => number;

//Attempt Date.now, otherwise use Date.getTime fallback
if (typeof Date.now === "function") {
    epoch = Date.now;
} else {
    epoch = () => {
        return new Date().getTime();
    }
}

export = epoch;