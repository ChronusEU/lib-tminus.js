###
The looper component calls a provided callback function as long as that
function has not returned false or has not been cancelled with the
cancellation function.

function: (() -> bool) -> () -> void
    @param 1 callback, to cancel the loop the callback needs to return false
    @return function that will cancel the loop if called.
###

privateRequestAnimationFrame = window.requestAnimationFrame or
                        window.webkitRequestAnimationFrame or
                        window.mozRequestAnimationFrame or
                        null
privateCancelAnimationFrame =  window.cancelAnimationFrame or
                        window.webkitCancelAnimationFrame or
                        window.mozCancelAnimationFrame or
                        window.webkitCancelRequestAnimationFrame or
                        window.mozCancelRequestAnimationFrame or
                        null
INTERVAL_60_FPS = (1000 // 60)

if privateRequestAnimationFrame?
    looperCreator = (func) ->
        #force this variable to be in this scope so it is shared.
        cancellationId = false
        
        timerCallback = ->
            if func() isnt false
                cancellationId = privateRequestAnimationFrame timerCallback
            false
        timerCallback() #Kickstart the loop
        
        () -> privateCancelAnimationFrame cancellationId
else
    #Fall back to interval-based loop if there is no requestAnimationFrame
    looperCreator = (func) ->
        if func() isnt false
            intervalId = window.setInterval ->
                if func() is false
                    window.clearInterval intervalId
            , INTERVAL_60_FPS
        
        () -> window.clearInterval intervalId

module.exports = looperCreator