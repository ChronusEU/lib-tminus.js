'use strict';

import RAFLooper = require('./RAFLooper');
import TimeoutLooper = require('./TimeoutLooper');

/**
 * A looper is a controllable construct that is able to invoke a callback at a regular interface.
 *
 * The rate of invocation should not be relied upon and is not strictly defined.
 */
export interface Looper {
    /**
     * Start invoking the callback at a specified interval.
     *
     * Once this function returns {@see isRunning} will need to return true.
     */
    start(): void;

    /**
     * Stops any future invocation of the callback.
     *
     * Once this function returns {@see isRunning} will need to return false.
     */
    stop(): void;

    /**
     * Queries the current state of the looper.
     *
     * If it returns true then the callback will be called at least once in the future
     */
    isRunning(): boolean;
}

/**
 * Utility function to construct an object that implements the Looper interface and invokes the provided callback.
 *
 * Will attempt to use a RequestAnimationFrame-based Looper, falling back to a
 * Timeout-based Looper if RAF is not available.
 *
 * If the callback returns false then the Looper will stop any future invocations of the callback.
 *
 * @param cb callback that will be repeatedly invoked by the returned Looper.
 */
export function make(cb:() => boolean):Looper {
    if (RAFLooper.isAvailable()) {
        return new RAFLooper(cb);
    } else {
        return new TimeoutLooper(cb);
    }
}