###
TODO: describe

call: (String) -> Object
    @param 1
    @return
resolveVendor: (String) -> Object
    @param 1
    @return
###

# Possible javascript vendor prefixes
VENDOR_PREFIXES = [
    "webkit"
    "ms"
    "moz"
    "o"
]

capitalizeString = (str) ->
    if str.length > 1
        str[0].toUpperCase() + str.slice(1)
    else
        str.toUpperCase()

# Create a copy of the global object.
globalRef = global or {}

# Maps the given name to a set of vendor-prefixed names,
# then looks for these objects in the global namespace
resolveWindowObject = (name) ->
    capitalizedName = capitalizeString name
    # Build a list of possible objects, then filter null results
    possibleObjects = VENDOR_PREFIXES
        .map (prefix) ->
            globalRef[prefix + capitalizedName]
        .filter (obj) ->
            obj?
    # Return either the first object or null
    possibleObjects[0] or null

# Default action, just proxy the request
windowProxy = (name) -> globalRef[name]

# Expanded action, try to directly proxy,
# otherwise try to resolve with vendor prefixes
windowProxy.resolveVendor = (name) ->
    globalRef[name] ? resolveWindowObject name

module.exports = windowProxy