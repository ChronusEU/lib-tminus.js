'use strict';

import Period = require('./Period');

/**
 * An Instant represents an immutable point in time.
 *
 * It can represent any millisecond that is representable as an offset of Epoch time.
 *
 * @author http://github.com/Kiskae
 * @version 1
 */
class Instant {
    /**
     * Construct an instant for the given Epoch time.
     *
     * @constructor
     * @param {number} epoch milliseconds since zero epoch (midnight UTC, 1st Jan 1970)
     */
    constructor(private epoch:number) {
    }

    /**
     * Creates a javascript Date object that is equivalent to this instant in time.
     *
     * If this object is invalid {@see Instant#isValid}, the resulting date will be invalid as well.
     */
    toDate():Date {
        return new Date(this.epoch);
    }

    /**
     * Returns whether this instant represents a valid moment in time
     */
    isValid():boolean {
        return (!isNaN(this.epoch)) && isFinite(this.epoch);
    }

    /**
     * Calculates the period of time that has to elapse relative to this instant before it passes the reference instant.
     *
     * earlier.until(later) will result in the Period until that later point.
     * later.until(earlier) will result in a zero Period, since the point in time has elapsed.
     * same.until(same) will return a zero Period.
     *
     * @param {Instant} otherInstant reference point to some future instant
     */
    until(otherInstant:Instant):Period.Period {
        return Period.ofMillis(otherInstant.epoch - this.epoch);
    }

    /**
     * Create a new Instant that is offset from this Instant by the given Period.
     *
     * This method follow the following contract: Instant.until(Instant.add(Period)).eq(Period)
     *
     * @param {Period} period offset of the returned Instant relative to this Instant
     */
    add(period:Period.Period):Instant {
        return Instant.make(this.epoch + period.getUnit(Period.TimeKey.S).value * 1000);
    }

    /**
     * Factory method to create new Instant objects using either the number of milliseconds since zero epoch or
     * a javascript Date object.
     *
     * @param {number} date point in time that the new Instant will refer to.
     */
    static make(date:number|Date):Instant {
        if (typeof date === "number") {
            return new Instant(date);
        } else {
            return new Instant(date.getTime());
        }
    }
}

export = Instant;