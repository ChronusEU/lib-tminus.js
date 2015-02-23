###
TODO: comment

class: (Number) -> Period
    @param 1

    isFinished: () -> bool

    getUnit: (String) -> [Number, bool]
        @param 1
            "s" seconds since last minute
            "S" seconds since epoch
            "m" minutes since last hour
            "M" minutes since epoch
            "h" hours since last day
            "H" hours since epoch
            "D" days since epoch
        @return
###

class Period
    MINUTE_IN_SECONDS = 60
    HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60
    DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
    #Infinite for the purposes of this library
    INFINITE_SECONDS = Number.MAX_VALUE
    
    extractUnit = (duration, upperBound, lowerBound) ->
        if lowerBound isnt 0
            [duration % upperBound // lowerBound, duration > lowerBound]
        else
            [duration % upperBound, true]
    
    constructor: (duration) ->
        @duration = Math.max duration // 1000, 0
        
    isFinished: -> @duration <= 0

    getUnit: (identifier) ->
        switch identifier
            when "s" #seconds
                extractUnit @duration, MINUTE_IN_SECONDS, 0
            when "S" #absolute seconds
                extractUnit @duration, INFINITE_SECONDS , 0
            when "m" #minutes
                extractUnit @duration, HOUR_IN_SECONDS  , MINUTE_IN_SECONDS
            when "M" #absolute minutes
                extractUnit @duration, INFINITE_SECONDS , MINUTE_IN_SECONDS
            when "h" #hours
                extractUnit @duration, DAY_IN_SECONDS   , HOUR_IN_SECONDS
            when "H" #absolute hours
                extractUnit @duration, INFINITE_SECONDS , HOUR_IN_SECONDS
            when "D" #absolute days
                extractUnit @duration, INFINITE_SECONDS , DAY_IN_SECONDS
            else [NaN, true]

module.exports = Period