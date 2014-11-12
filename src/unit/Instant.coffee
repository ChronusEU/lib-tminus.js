###
TODO: comment

class: (Date | Number) -> Instant
    @param 1

    toDate: () -> Date
        @return

    until: (Instant) -> Period
        @param 1
        @return
###

class Instant
    Period = require './Period'
    
    constructor: (/* Number | Date */ date) ->
        @epoch = if typeof date is "number" then date else date.getTime()

    toDate: -> new Date(@epoch)
        
    until: (/* Instant */ otherInstant) ->
        new Period(otherInstant.epoch - @epoch)
            
module.exports = Instant