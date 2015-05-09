'use strict';

import Looper = require('./Looper');
import Period = require('../unit/Period');
import Instant = require('../unit/Instant');
import epoch = require('../util/epoch');

export interface Options {
    /**
     * Function that will be called once the countdown has reached zero.
     *
     * It is guaranteed to be called, even if the associated countdown has already reached zero when it begins.
     */
    finishedCallback?: () => any;

    /**
     * Function that will be called once the countdown has been constructed and started.
     *
     * There is no guarantee that this callback will fire before the finishedCallback.
     */
    loadedCallback?: () => any;
}

export interface Controller {
    /**
     * Returns a period that is always equal to the amount of time left until the countdown ends.
     */
    getUpdatedPeriod(): Period.Period;

    /**
     * Returns the last period for which the actual countdown has been updated.
     *
     * If the window is hidden or in a tab then this value might not reflect the actual progress of the countdown,
     * use {@see Controller#getUpdatedPeriod} if it should always be up to date.
     */
    getCountdownPeriod(): Period.Period;

    /**
     * Stop the countdown, once it has been stopped it will no longer fire the updater or update its internal period.
     *
     * If the countdown has already stopped this method will do nothing.
     */
    stopCountdown(): void;

    /**
     * Starts a previously stopped countdown, it will retain all the state from before it was stopped.
     *
     * If the countdown is already running, the only effect of this method will be a forced call to the updater.
     */
    startCountdown(): void;
}

export type Updater = (period:Period.Period) => any;

/**
 * Constructs a countdown loop that will call the provided updater function each time the countdown changes.
 *
 * When the endDate is reached the countdown will automatically stop itself,
 * it will always call the updater at least once.
 *
 * If milliseconds are required for the countdown then this should be done externally.
 * The reason milliseconds are not used is that they change too rapidly to actually be useful,
 * a similar effect to an actual millisecond countdown can be reached with visual tricks.
 *
 * @param {Date} endDate moment that we will be counting down to.
 * @param {Function} updater function which will be called each time a new period is available.
 * @param {object} opts callback options to track some of the progress of the countdown.
 * @throws If the provided endDate is not a valid date.
 */
export function create(endDate:Date, updater:Updater, opts:Options):Controller {
    var endInstant = Instant.make(endDate);

    if (endInstant.isValid()) {
        var prevPeriod = Period.ofMillis(Number.MAX_VALUE);

        var looper = Looper.make(() => {
            var period = Instant.make(epoch()).until(endInstant);

            if (!period.eq(prevPeriod)) {
                prevPeriod = period;

                updater(period);

                if (period.isFinished() && opts.finishedCallback) {
                    opts.finishedCallback();
                }
            }

            return !period.isFinished();
        });

        //Begin the countdown
        looper.start();

        if (opts.loadedCallback) {
            opts.loadedCallback();
        }

        return {
            getUpdatedPeriod: () => {
                return Instant.make(epoch()).until(endInstant);
            },
            getCountdownPeriod: () => {
                return prevPeriod;
            },
            stopCountdown: () => {
                looper.stop();
            },
            startCountdown: () => {
                //By setting prevPeriod, we force the updater to be called.
                prevPeriod = Period.ofMillis(Number.MAX_VALUE);
                looper.start();
            }
        }
    } else {
        throw new Error("Invalid target date passed to countdown");
    }
}