proxyquire = require 'proxyquire'

describe 'countdown base', ->
    countdown = null
    
    beforeEach ->
        # Stub out looper and epoch, since they use window objects
        countdown = proxyquire '../src/component/countdown',
            './looper': 
                '@noCallThru': true
            '../unit/epoch':
                '@noCallThru': true
    
    it 'should return false if the date is invalid', ->
        invalidDate = new Date(NaN)
        expect(countdown invalidDate, null, null).toEqual false
        