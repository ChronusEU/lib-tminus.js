###
TODO: description

exposed through window.TminusLib or require('lib-tminus'):
    createCountdownWithEpoch: (Number, DOMElement | Array(DOMElement) [, Options]) -> countdown.StateWindow
        @param 1 Target date in seconds since epoch
        @param 2 Either a single or list of DOMElements which will be parsed for tminus attributes
        @param 3 See Options
        @return See countdown.StateWindow
    createCountdownWithChronus: (String, DOMElement | Array(DOMElement) [, Options]) -> countdown.StateWindow
        @param 1 Target date as a chronus date identifier (hexadecimal encoding of number of minutes since epoch)
        @param 2 Either a single or list of DOMElements which will be parsed for tminus attributes
        @param 3 See Options
        @return See countdown.StateWindow
    createCountdownWithDate: (Date, DOMElement | Array(DOMElement) [, Options]) -> countdown.StateWindow
        @param 1 Target date as a native javascript date object
        @param 2 Either a single or list of DOMElements which will be parsed for tminus attributes
        @param 3 See Options
        @return See countdown.StateWindow

Options:
    finishedCallback: () -> void
    finishedClass: String
    loadedCallback: () -> void
    loadingClass: String
countdown.StateWindow: (Copied from component/countdown)
    getUpdatedPeriod: () -> Period
    getCountdownPeriod: () -> Period
    stopCountdown: () -> void
###

baseCountdown = require './component/countdown'
AttributeTemplateParser = require './component/AttributeTemplateParser'
ClassList = require 'class-list'

createCountdown = (endDate, elements, options = {}) ->
    #The AttributeTemplateParser expects an array
    if not elements.length? then elements = [elements]
    
    #By default, add the options.finishedClass class to the elements when they are finished counting down
    oldFinishedCallback = options['finishedCallback']
    options['finishedCallback'] = ->
        finishedClass = options['finishedClass'] ? "finished"
        ClassList(elem).add finishedClass for elem in elements
        oldFinishedCallback?()
    
    #By default, if options.loadingClass is set, remove that class from the elements when the countdown is loaded
    if options['loadingClass']?
        oldLoadedCallback = options['loadedCallback']
        options['loadedCallback'] = ->
            ClassList(elem).remove(options['loadingClass']) for elem in elements
            oldLoadedCallback?()
    
    baseCountdown endDate, new AttributeTemplateParser().build(elements), options


module.exports = 
    Instant: require './unit/Instant'
    createCountdownWithEpoch: (epoch, elements, options) ->
        createCountdown epoch * 1000, elements, options
    createCountdownWithChronus: (ident, elements, options) ->
        if not /^[0-9A-Fa-f]+$/.test(ident) then throw new Error("#{ident} is not a valid Chronus identifier")
        createCountdownWithEpoch parseInt(ident, 16) * 60, elements, options
    createCountdownWithDate: createCountdown