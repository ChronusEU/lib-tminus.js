describe 'countdown base', ->
    countdown = null
    
    beforeEach ->
        countdown = require '../src/component/countdown'

    it 'should return false if the date is invalid', ->
        invalidDate = new Date(NaN)
        expect(countdown invalidDate, null, null).toEqual false
        