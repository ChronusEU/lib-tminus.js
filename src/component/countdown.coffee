###
TODO: description

function: (Number | Date, (Period) -> void [, Options]) -> StateWindow
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
    
    ret = {}
    ret['getUpdatedPeriod'] = -> new Instant(currentEpoch()).until(endInstant)
    ret['getCountdownPeriod'] = -> lastPeriod
    ret['stopCountdown'] = loopCanceller
    ret