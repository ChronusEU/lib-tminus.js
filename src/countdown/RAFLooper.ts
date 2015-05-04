'use strict';

import prefixed = require('../util/prefixed');
import Looper = require('./Looper');

// Retrieve (potentially vendor-prefixed) requestAnimationFrame and
// cancelAnimationFrame methods
type RAFType = (cb:FrameRequestCallback) => number;
type CAFType = (handle:number) => void;
var rAF = prefixed<RAFType>('requestAnimationFrame');
var cAF = prefixed<CAFType>('cancelAnimationFrame') || prefixed<CAFType>('cancelRequestAnimationFrame');

var RAF_ENABLED = typeof rAF !== "undefined";

/**
 *
 */
class RequestAnimationFrame implements Looper.Looper {
    private handle:number;

    /**
     *
     *
     * @param {Function} cb
     */
    constructor(private cb:() => boolean) {
        this.handle = -1;
    }

    start():void {
        //Make sure we aren't already running
        if (this.isRunning()) return;

        //function keeps requesting the next frame until
        //the callback returns false
        var fn = () => {
            if (this.cb() !== false) {
                this.handle = rAF(fn);
            }
        };

        //Jump-start the loop
        fn();
    }

    stop():void {
        if (!this.isRunning()) return;

        //Clear request and reset handle
        cAF(this.handle);
        this.handle = -1;
    }

    isRunning():boolean {
        return this.handle != -1;
    }

    /**
     * Determines whether the current environment supports update loops based on frame refreshes.
     *
     * If this method returns false, the RequestAnimationFrame-based Looper will fail to work.
     */
    static isAvailable():boolean {
        return RAF_ENABLED;
    }
}

export = RequestAnimationFrame;