describe 'Instant', ->
    Instant = null
    
    beforeEach ->
        Instant = require '../src/unit/Instant'
    
    it 'should be possible to create an instant with a Date', ->
        expect(-> new Instant(new Date)).not.toThrow()
    
    it 'should be possible to create an instant with a Number', ->
        expect(-> new Instant(12)).not.toThrow()