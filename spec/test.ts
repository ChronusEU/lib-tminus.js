/// <reference path="../typings/tsd.d.ts" />
'use strict';

//Bug in PhantomJS requires this polyfill
require("./BindPolyfill");

require("./unit/Instant.spec");
require("./unit/Period.spec");
require("./countdown/Countdown.spec");
require("./parser/AttributeTemplate.spec");