###
TODO: comment

class: ([Options]) -> AttributeTemplateParser
    @param 1

    build: (Array(DOMElement)) -> (Period) -> void
        @param 1
        @return
Options:
    displayAttribute: String
    hidableAttribute: String
    zeroPadOverrides: String => bool
###
        
# Array(Array(T)) -> Array(T)
flatten = (outer) ->
    out = [] #Array(T)
    #out <- elem for outer(inner(elem))
    out.push(elem) for elem in inner for inner in outer
    out

cloneObj = (original) ->
    ret = {}
    for key, val of original
        ret[key] = val
    ret

zeroPad = (num) -> if num < 10 then "0#{num}" else "#{num}"
noopZeroPad = (num) -> "#{num}"

class AttributeTemplateParser
    DOM_DISPLAY_ATTRIBUTE = "tminus-unit"
    DOM_HIDABLE_ATTRIBUTE = "tminus-hide-if-zero"
    
    # Period.getUnit keys -> shouldZeroPad
    # Uses a dictionary instead of an object
    # because the names have semantic value
    RECOGNIZED_KEYS = {}
    RECOGNIZED_KEYS["s"] = true
    RECOGNIZED_KEYS["S"] = true
    RECOGNIZED_KEYS["m"] = true
    RECOGNIZED_KEYS["M"] = true
    RECOGNIZED_KEYS["h"] = false
    RECOGNIZED_KEYS["H"] = false
    RECOGNIZED_KEYS["d"] = false
        
    createUpdater = (key, shouldZeroPad, filteredDisplay, filteredHidable) ->
        localZeroPad = if shouldZeroPad then zeroPad else noopZeroPad
        
        previousValue = Number.NaN
        
        # Do not waste time updating if there are
        # no elements that listen for this key
        if (filteredDisplay.length + filteredHidable.length) > 0
            (period) ->
                [value, significant] = period.getUnit key
                if previousValue isnt value
                    previousValue = value
                    paddedValue = localZeroPad value
                    
                    (el.innerHTML = paddedValue) for el in filteredDisplay
                    
                    # Once a value is no longer significant it cannot return,
                    # so the reverse case does not need to be handled
                    if not significant
                        (el.style.display = "none") for el in filteredHidable
                false
        else
            false
    
    constructor: (options) ->
        @displayAttribute = options?.displayAttribute ? DOM_DISPLAY_ATTRIBUTE
        @hidableAttribute = options?.hidableAttribute ? DOM_HIDABLE_ATTRIBUTE
        @zeroPadSettings = cloneObj RECOGNIZED_KEYS
        
        if options?.zeroPadOverrides?
            for key, val of options.zeroPadOverrides
                if RECOGNIZED_KEYS[key]?
                    @zeroPadSettings[key] = val
    
    build: (rootElements) ->
        # html5 attribute keys
        displayAttributeKey = "data-#{@displayAttribute}"
        hidableAttributeKey = "data-#{@hidableAttribute}"
        
        # Gather all elements marked with the attribute keys from
        # the root elements and flatten the resulting arrays
        displayElements = flatten rootElements.map (el) ->
            el.querySelectorAll("[#{displayAttributeKey}]")
        hidableElements = flatten rootElements.map (el) ->
            el.querySelectorAll("[#{hidableAttributeKey}]")
        
        #Create updaters for each key
        updaters = for key, shouldZeroPad of @zeroPadSettings
            #Filter node-lists by comparing their data values and the selected key
            filteredDisplay = Array::filter.call displayElements, (x) ->
                x.getAttribute(displayAttributeKey) is key
            filteredHidable = Array::filter.call hidableElements, (x) ->
                x.getAttribute(hidableAttributeKey) is key
                
            #Create the updater function
            createUpdater key, shouldZeroPad, filteredDisplay, filteredHidable
            
        # filter out the cases where #createUpdater returned false
        updaters = updaters.filter (x) -> x isnt false
        
        (period) ->
            updater(period) for updater in updaters
            true

module.exports = AttributeTemplateParser