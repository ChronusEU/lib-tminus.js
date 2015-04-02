'use strict';

/**
 * Enum which represents all the time units that can be derived from a Period
 *
 * Uppercase time units are absolute
 * Lowercase time units are relative to their parent units (e.g. minutes since last hour)
 *
 * Currently supported units: Seconds, Minutes, Hours and Days.
 *
 * @author http://github.com/Kiskae
 * @version 1
 * @see {Period#getUnit}
 */
export enum TimeKey
{
    s, // seconds since last minute
    S, // seconds since epoch
    m, // minutes since last hour
    M, // minutes since epoch
    h, // hours since last day
    H, // hours since epoch
    D  // days since epoch
}

export interface TimeValue {
    /**
     * Value of the instant with the given reference point. (Absolute or Relative, see TimeKey)
     */
    value:number;

    /**
     * Whether the value is still significant, a value becomes non-significant if it passes a point where it
     * will ever be non-zero assuming the period only decreases.
     */
    significant:boolean;
}

/**
 * Utility method to convert a Period in seconds into another unit of time.
 *
 * @param {number} seconds number of seconds to convert from.
 * @param {number} parentBoundary number of seconds at which the unit becomes another unit, acts as modulo.
 * @param {number} stepSize number of seconds for 1 unit.
 */
function extractUnit(seconds:number, parentBoundary:number, stepSize:number):TimeValue {
    return {value: Math.floor((seconds % parentBoundary) / stepSize), significant: seconds >= stepSize};
}

var SECOND_IN_SECONDS = 1;
var MINUTE_IN_SECONDS = SECOND_IN_SECONDS * 60;
var HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
var DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
//Infinite for the purposes of this library
var INFINITE_SECONDS = Number.MAX_VALUE;

/**
 * A period represents an immutable positive length of time in seconds.
 *
 * This class has a number of methods to convert its length to different time scales,
 * see {@see Period#getUnit} for more information.
 *
 * @author http://github.com/Kiskae
 * @version 1
 */
export class Period {
    private seconds:number;

    /**
     * Create a period for the given length in seconds.
     * If the given length is negative it will be treated as if it was zero.
     *
     * @constructor
     * @param {number} seconds length of this period
     */
    constructor(seconds:number) {
        this.seconds = Math.max(seconds, 0);
    }

    /**
     * A period with a length that is above zero will not be finished, any other lengths will be finished.
     */
    isFinished():boolean {
        return this.seconds <= 0;
    }

    /**
     * Method to convert this period into other units of time.
     *
     * See {@see TimeKey} for the supported time units.
     * This method will return {@see TimeValue} describing the value in the given time unit.
     *
     * @param {string|number} key value key to convert to, see {@see TimeKey} for possible values.
     */
    getUnit(key:string|TimeKey):TimeValue {
        var k:TimeKey;
        if (typeof key === "string") {
            k = TimeKey[key];
        } else {
            k = key;
        }

        var seconds = this.seconds;
        switch (k) {
            case TimeKey.s:
                return extractUnit(seconds, MINUTE_IN_SECONDS, SECOND_IN_SECONDS);
            case TimeKey.S:
                return extractUnit(seconds, INFINITE_SECONDS, SECOND_IN_SECONDS);
            case TimeKey.m:
                return extractUnit(seconds, HOUR_IN_SECONDS, MINUTE_IN_SECONDS);
            case TimeKey.M:
                return extractUnit(seconds, INFINITE_SECONDS, MINUTE_IN_SECONDS);
            case TimeKey.h:
                return extractUnit(seconds, DAY_IN_SECONDS, HOUR_IN_SECONDS);
            case TimeKey.H:
                return extractUnit(seconds, INFINITE_SECONDS, HOUR_IN_SECONDS);
            case TimeKey.D:
                return extractUnit(seconds, INFINITE_SECONDS, DAY_IN_SECONDS);
            default :
                return <TimeValue>{value: NaN, significant: true};
        }
    }

    /**
     * Determines whether the given period is equal to this period in terms of length.
     *
     * @param period the other period
     */
    eq(period:Period):boolean {
        return this.seconds === period.seconds;
    }
}

/**
 * Factory method to create a period with a length equal to  the given number of milliseconds.
 *
 * Be aware that the period will be limited to a precision in seconds and will be limited to positive values.
 *
 * @param {number} milliSeconds length of the created period in milliseconds
 */
export function ofMillis(milliSeconds:number):Period {
    return new Period(Math.floor(milliSeconds / 1000));
}

/**
 * Factory method to create a period with a length equal to the given number of seconds.
 *
 * Be aware that the period will be limited to positive values.
 *
 * @param {number} seconds length of the created period in seconds
 */
export function ofSeconds(seconds:number):Period {
    return new Period(Math.floor(seconds));
}