###
The looper component calls a provided callback function as long as that
function has not returned false or has not been cancelled with the
cancellation function.

function: (() -> bool) -> () -> void
    @param 1 callback, to cancel the loop the callback needs to return false
    @return function that will cancel the loop if called.
###

proxyWindow = require '../window'

requestAnimationFrameRef = proxyWindow.resolveVendor('requestAnimationFrame')
cancelAnimationFrameRef =
    proxyWindow.resolveVendor('cancelAnimationFrame') or
    proxyWindow.resolveVendor('cancelRequestAnimationFrame')
setIntervalRef = proxyWindow.resolveVendor('setInterval')
clearIntervalRef = proxyWindow.resolveVendor('clearInterval')
INTERVAL_60_FPS = (1000 // 60)

if requestAnimationFrameRef?
    looperCreator = (func) ->
        #force this variable to be in this scope so it is shared.
        cancellationId = false
        
        timerCallback = ->
            if func() isnt false
                cancellationId = requestAnimationFrameRef timerCallback
            false
        timerCallback() #Kickstart the loop
        
        () -> cancelAnimationFrameRef cancellationId
else
    #Fall back to interval-based loop if there is no requestAnimationFrame
    looperCreator = (func) ->
        if func() isnt false
            intervalId = setIntervalRef ->
                if func() is false
                    clearIntervalRef intervalId
            , INTERVAL_60_FPS
        
        () -> clearIntervalRef intervalId

module.exports = looperCreator