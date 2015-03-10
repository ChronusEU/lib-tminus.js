###
The looper module calls a provided callback function as long as the
function has not returned false or has not been cancelled through the
cancellation function.

call: (() -> bool) -> (() -> void)
    Creates a loop that will call the provided callback function
    at regular intervals. The loop can be stopped by calling the
    cancellation function returned by this function or by having
    the callback return false.

    @param 1 callback
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
        #force the cancellationId into this scope.
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