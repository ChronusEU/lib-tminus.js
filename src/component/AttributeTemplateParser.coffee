###
TODO: comment

class: ([String [, String]]) -> AttributeTemplateParser
    @param 1
    @param 2

    build: (Array(DOMElement)) -> (Period) -> void
        @param 1
        @return
###

class AttributeTemplateParser
    DOM_DISPLAY_ATTRIBUTE = "countdown-unit"
    DOM_HIDABLE_ATTRIBUTE = "countdown-hide-if-zero"
    
    # Period.getUnit keys -> shouldZeroPad
    RECOGNIZED_KEYS = {}
    RECOGNIZED_KEYS["s"] = true
    RECOGNIZED_KEYS["S"] = true
    RECOGNIZED_KEYS["m"] = true
    RECOGNIZED_KEYS["M"] = true
    RECOGNIZED_KEYS["h"] = false
    RECOGNIZED_KEYS["H"] = false
    RECOGNIZED_KEYS["d"] = false
        
    concatArrays = (inputArrays) ->
        out = []
        out.push(x) for x in arr for arr in inputArrays
        out
    
    zeroPad = (num) -> if num < 10 then "0#{num}" else "#{num}"
    
    constructor: (@displayAttribute = DOM_DISPLAY_ATTRIBUTE, @hidableAttribute = DOM_HIDABLE_ATTRIBUTE) ->
        
    createUpdater: (key, shouldZeroPad, displayElements, hidableElements) ->
        #Filter nodelists by their attribute keys
        displayAttributeKey = "data-#{@displayAttribute}" #Cache key because function scope messes with it
        filteredDisplay = Array::filter.call displayElements, (x) -> 
            x.getAttribute(displayAttributeKey) is key
        hidableAttributeKey = "data-#{@hidableAttribute}" #Cache key because function scope messes with it
        filteredHidable = Array::filter.call hidableElements, (x) -> 
            x.getAttribute(hidableAttributeKey) is key
        
        previousValue = Number.NaN
        
        #Do not waste time updating if there are no elements that listen for this key
        if (filteredDisplay.length + filteredHidable.length) > 0
            (period) ->
                [value, significant] = period.getUnit key
                if previousValue isnt value
                    previousValue = value
                    paddedValue = if shouldZeroPad then zeroPad(value)  else "#{value}"
                    
                    displayElem.innerHTML = paddedValue for displayElem in filteredDisplay
                    
                    if !significant #Once a value is no longer significant it cannot return, so one-way is acceptable.
                        hidableElem.style.display = "none" for hidableElem in filteredHidable
                false
        else
            false
    
    build: (rootElements) ->
        displayAttributeKey = "[data-#{@displayAttribute}]" #Cache key because function scope messes with it
        displayElements = concatArrays (element.querySelectorAll(displayAttributeKey) for element in rootElements)
        hidableAttributeKey = "[data-#{@hidableAttribute}]" #Cache key because function scope messes with it
        hidableElements = concatArrays (element.querySelectorAll(hidableAttributeKey) for element in rootElements)
        
        #Create updaters for each key, filter out the keys without updaters and flatmap to a single array
        updaters = (@createUpdater key, shouldZeroPad, displayElements, hidableElements for key, shouldZeroPad of RECOGNIZED_KEYS).filter (x) -> x isnt false
        (period) -> 
            updater(period) for updater in updaters
            true

module.exports = AttributeTemplateParser