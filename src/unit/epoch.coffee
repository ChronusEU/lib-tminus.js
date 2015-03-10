###
Utility module to determine the current seconds since epoch.

Will use the HTML5 'performance' API if it is supported by the
current environment.

call: () -> Number
    @return current time since UNIX epoch in ms with 
    		the highest precision possible
###

proxyWindow = require '../window'

if typeof Date.now is "function"
    now = Date.now
else
    now = -> new Date().getTime()
perf = proxyWindow 'performance'

if typeof perf?.now is "function"
    epoch = -> perf.now() + perf.timing.navigationStart
else
    epoch = now

module.exports = epoch