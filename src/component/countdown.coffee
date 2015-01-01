###
TODO: description

function: (Number | Date, (Period) -> void [, Options]) -> StateWindow | False
    @param 1:
    @param 2:
    @param 3:
    @return

Options:
    loadedCallback: () -> void
    finishedCallback: () -> void

StateWindow:
    getUpdatedPeriod: () -> Period
    getCountdownPeriod: () -> Period
    stopCountdown: () -> void
###

looper = require './looper'
Instant = require '../unit/Instant'
Period = require '../unit/Period'
currentEpoch = require '../unit/epoch'

module.exports = (endDate, updater, options = {}) ->
    endInstant = new Instant(endDate)
    
    if isNaN endInstant.epoch
        false
    else
        lastPeriod = new Period(Number.MAX_VALUE)

        loopCanceller = looper ->
            period = new Instant(currentEpoch()).until(endInstant)

            if period.duration isnt lastPeriod.duration
                lastPeriod = period

                #Update countdown
                updater(period)

                #If done, call the possible finishing callback
                if period.isFinished()
                    options['finishedCallback']?()

            not period.isFinished()

        options['loadedCallback']?()

        getUpdatedPeriod: -> new Instant(currentEpoch()).until(endInstant)
        getCountdownPeriod: -> lastPeriod
        stopCountdown: loopCanceller