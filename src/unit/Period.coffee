###
TODO: comment

class: (Number) -> Period
    @param 1

    isFinished: () -> bool

    getUnit: (String) -> [Number, bool]
        @param 1
            "s"
            "S"
            "m"
            "M"
            "h"
            "H"
            "d"
        @return
###

class Period
    MINUTE_IN_SECONDS = 60
    HOURS_IN_SECONDS = MINUTE_IN_SECONDS * 60
    DAY_IN_SECONDS = HOURS_IN_SECONDS * 24
    #Infinite for the purposes of this library
    INFINITE_SECONDS = Number.MAX_VALUE
    
    extractUnit = (/* Number */ duration, /* Number */ upperBound, /* Number */ lowerBound) ->
        if lowerBound isnt 0
            [duration % upperBound // lowerBound, duration > lowerBound]
        else
            [duration % upperBound, true]
    
    constructor: (/* Number */ duration) ->
        @duration = Math.max duration // 1000, 0
        
    isFinished: -> @duration <= 0

    getUnit: (/* string */ identifier) ->
        switch identifier
            when "s" #seconds
                extractUnit @duration, MINUTE_IN_SECONDS, 0
            when "S" #absolute seconds
                extractUnit @duration, INFINITE_SECONDS , 0
            when "m" #minutes
                extractUnit @duration, HOURS_IN_SECONDS , MINUTE_IN_SECONDS
            when "M" #absolute minutes
                extractUnit @duration, INFINITE_SECONDS , MINUTE_IN_SECONDS
            when "h" #hours
                extractUnit @duration, DAY_IN_SECONDS   , HOURS_IN_SECONDS
            when "H" #absolute hours
                extractUnit @duration, INFINITE_SECONDS , HOURS_IN_SECONDS
            when "d" #days
                extractUnit @duration, INFINITE_SECONDS , DAY_IN_SECONDS
            else [NaN, true]

module.exports = Period