import RAFLooper = require('./RAFLooper');
import TimeoutLooper = require('./TimeoutLooper');

/**
 *
 */
export interface Looper {
    /**
     *
     */
    start(): void;

    /**
     *
     */
    stop(): void;

    /**
     *
     */
    isRunning(): boolean;
}

/**
 *
 * @param cb
 */
export function make(cb:() => boolean):Looper {
    if (RAFLooper.isAvailable()) {
        return new RAFLooper(cb);
    } else {
        return new TimeoutLooper(cb);
    }
}