'use strict';

import prefixed = require('../util/prefixed');
import Looper = require('./Looper');

var pSetInterval = prefixed<(handler:any, timeout?:any, ...args:any[])=>number>('setInterval');
var pClearInterval = prefixed<(handle:number)=>void>('clearInterval');

var TIMEOUT_60_FPS_IN_MS = Math.floor(1000 / 60);

/**
 * This Looper uses the setInterval/clearInterval API as its implementation.
 *
 * The interval at which the function is called is set to {@see TIMEOUT_60_FPS_IN_MS}
 *
 * If a window is hidden then most browsers will limit the rate of invocation of this Looper to once every second.
 */
class TimeoutLooper implements Looper.Looper {
    private handle:number;

    /**
     * Create a setInterval-based Looper that will invoke the given callback.
     *
     * If the callback returns false, the Looper will cancel any future invocations.
     *
     * @param {Function} cb callback that will be invoked by this looper.
     */
    constructor(private cb:() => boolean) {
        this.handle = -1;
    }

    start():void {
        //Make sure we aren't already running
        if (this.isRunning()) return;

        if (this.cb() !== false) {
            this.handle = pSetInterval(() => {
                if (this.cb() === false) {
                    this.stop();
                }
            }, TIMEOUT_60_FPS_IN_MS);
        }
    }

    stop():void {
        if (!this.isRunning()) return;

        //Clear request and reset handle
        pClearInterval(this.handle);
        this.handle = -1;
    }

    isRunning():boolean {
        return this.handle != -1;
    }
}

export = TimeoutLooper;