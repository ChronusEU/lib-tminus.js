###
Utility module for accessing properties of the global object.

Besides directly allowing access to global properties it has a
utility method to access vendor-prefixed properties.
If a property does not exist, it will return null instead.

call: (String) -> Object
    Access a named property on the global object.
    
    @param 1 name of the property to retrieve
    @return the object with the given name

resolveVendor: (String) -> Object
    Access a potentially vendor-prefixed property on the global object

    @param 1 name of the property to retrieve
    @return the object with the given name or any object with
            a vendor-prefixed variation of the given name
###

# Possible javascript vendor prefixes
VENDOR_PREFIXES = [
    "webkit"
    "Webkit"
    "ms"
    "Moz"
    "moz"
    "O"
    "o"
]

capitalizeString = (str) ->
    if str.length > 1
        str[0].toUpperCase() + str.slice(1)
    else
        str.toUpperCase()

# Create a reference to the global object.
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
    possibleObjects[0] ? null

# Default action, just proxy the request
windowProxy = (name) -> globalRef[name] ? null

# Expanded action, try to directly proxy,
# otherwise try to resolve with vendor prefixes
windowProxy.resolveVendor = (name) ->
    globalRef[name] ? resolveWindowObject name

module.exports = windowProxy