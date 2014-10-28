###
TODO: describe

function: () -> Number
    @return current epoch in ms with the highest precision possible
###

if typeof Date.now is "function"
    now = Date.now
else
    now = -> new Date().getTime()
perf = window.performance

if typeof perf?.now is "function"
    epoch = -> perf.now() + perf.timing.navigationStart
else
    epoch = now

module.exports = epoch