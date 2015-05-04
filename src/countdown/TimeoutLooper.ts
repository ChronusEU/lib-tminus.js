'use strict';

import prefixed = require('../util/prefixed');
import Looper = require('./Looper');

var pSetInterval = prefixed<(handler:any, timeout?:any, ...args:any[])=>number>('setInterval');
var pClearInterval = prefixed<(handle:number)=>void>('clearInterval');

var TIMEOUT_60_FPS_IN_MS = Math.floor(1000 / 60);

/**
 *
 */
class TimeoutLooper implements Looper.Looper {
    private handle:number;

    /**
     *
     * @param {Function} cb
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