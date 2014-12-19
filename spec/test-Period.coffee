describe 'Period', ->
    createDate = (options) ->
        d = new Date 0
        d.setUTCFullYear options.year if options.year?
        d.setUTCMonth options.month if options.month?
        d.setUTCDate options.day if options.day?
        d.setUTCHours options.hour if options.hour?
        d.setUTCMinutes options.minute if options.minute?
        d
    
    beforeEach ->
        @Instant = require '../src/unit/Instant'
        Period = require '../src/unit/Period'
        @createInstant = (options) ->
            new @Instant(createDate options)
        @createPeriod = (duration) ->
            new Period(duration)
    
    it 'should handle a normal situation correctly', ->
        testInstant = @createInstant (
            hour: 1
            minute: 3
        )
        zero = @createInstant {}
        period = zero.until testInstant
        
        #seconds should be 0, but still significant
        [seconds, sig] = period.getUnit "s"
        expect(seconds).toEqual 0
        expect(sig).toEqual true
        
        #minutes should be 3
        [minutes, sig] = period.getUnit "m"
        expect(minutes).toEqual 3
        expect(sig).toEqual true
        
        #hours should be 1
        [hours, sig] = period.getUnit "h"
        expect(hours).toEqual 1
        expect(sig).toEqual true
        
        #days should be 0
        [days, sig] = period.getUnit "d"
        expect(days).toEqual 0
        expect(sig).toEqual false
    
    it 'should not be affected by DST transitions', ->
        # Since these tests depends on the timezone they are executed in, they are only applied if the timezone of the two dates actually differ.
        
        Instant = @Instant #Move to local scope, required for createDSTTest
        createDSTTest = (options1, options2, callback) ->
            date1 = createDate options1
            date2 = createDate options2
            return if date1.getTimezoneOffset() is date2.getTimezoneOffset()
            callback (new Instant(date2)).until(new Instant (date1))
        
        #DST transition for Europe
        createDSTTest (
            year: 2014
            month: 9
            day: 27
        ), (
            year: 2014
            month: 9
            day: 25
        ), (period) ->
            [hours] = period.getUnit "H"
            expect(hours).toEqual 48 #2 day difference, if it is modified by DST changing it won't match
        
        #DST transition for America
        createDSTTest (
            year: 2014
            month: 10
            day: 3
        ), (
            year: 2014
            month: 10
            day: 1
        ), (period) ->
            [hours] = period.getUnit "H"
            expect(hours).toEqual 48 #2 day difference, if it is modified by DST changing it won't match
    
    it 'should return true for Period.isFinished if the same instant is used on both ends', ->
        testInstant = @createInstant (
            hour: 1
            minute: 3
        )
        expect(testInstant.until(testInstant).isFinished()).toEqual(true)
    
    it 'should return true for Period.isFinished if the target time is in the past', ->
        testInstant = @createInstant (
            hour: 1
            minute: 3
        )
        zero = @createInstant {}
        expect(testInstant.until(zero).isFinished()).toEqual(true)
    
    it 'should return false for Period.isFinished if the target time is in the future', ->
        testInstant = @createInstant (
            hour: 1
            minute: 3
        )
        zero = @createInstant {}
        expect(zero.until(testInstant).isFinished()).toEqual(false)
        
    it 'should correctly calculate the seconds partial', ->
        [seconds] = @createPeriod(-1000).getUnit("s");
        expect(seconds).toEqual(0); #0 seconds
        [seconds] = @createPeriod(0).getUnit("s");
        expect(seconds).toEqual(0); #0 seconds
        [seconds] = @createPeriod(1000).getUnit("s");
        expect(seconds).toEqual(1); #1 second
        [seconds] = @createPeriod(59000).getUnit("s");
        expect(seconds).toEqual(59); #59 seconds
        [seconds] = @createPeriod(60000).getUnit("s");
        expect(seconds).toEqual(0); #1 minute, 0 seconds
        [seconds] = @createPeriod(61000).getUnit("s");
        expect(seconds).toEqual(1); #1 minute, 1 second
        
    it 'should correctly calculate the minutes partial', ->
        [seconds] = @createPeriod(-1000).getUnit("m");
        expect(seconds).toEqual(0); #0 minutes
        [seconds] = @createPeriod(0).getUnit("m");
        expect(seconds).toEqual(0); #0 minutes
        [seconds] = @createPeriod(59000).getUnit("m");
        expect(seconds).toEqual(0); #0 minutes, 59 seconds
        [seconds] = @createPeriod(60000).getUnit("m");
        expect(seconds).toEqual(1); #1 minute, 0 seconds
        [seconds] = @createPeriod(61000).getUnit("m");
        expect(seconds).toEqual(1); #1 minute, 1 second
        
    it 'should correctly calculate the hours partial', ->
        [seconds] = @createPeriod(-1000).getUnit("h");
        expect(seconds).toEqual(0); #0 hours
        [seconds] = @createPeriod(0).getUnit("h");
        expect(seconds).toEqual(0); #0 hours
        [seconds] = @createPeriod(59000).getUnit("h");
        expect(seconds).toEqual(0); #0 hours, 0 minutes, 59 seconds
        [seconds] = @createPeriod(60000).getUnit("h");
        expect(seconds).toEqual(0); #0 hours, 1 minute, 0 seconds
        [seconds] = @createPeriod(61000).getUnit("h");
        expect(seconds).toEqual(0); #0 hours, 1 minute, 1 second
        [seconds] = @createPeriod(59 * 60000).getUnit("h");
        expect(seconds).toEqual(0); #0 hours, 59 minutes
        [seconds] = @createPeriod(60 * 60000).getUnit("h");
        expect(seconds).toEqual(1); #1 hour, 0 minutes
        [seconds] = @createPeriod(61 * 60000).getUnit("h");
        expect(seconds).toEqual(1); #1 hour, 1 minute
        