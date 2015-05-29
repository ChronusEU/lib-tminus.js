/// <reference path="../typings/node/node.d.ts" />
'use strict';

//Bug in PhantomJS requires this polyfill
require("./BindPolyfill");

require("./lib.spec");
require("./unit/Instant.spec");
require("./unit/Period.spec");
require("./countdown/Countdown.spec");
require("./parser/AttributeTemplate.spec");
require("./TsSyntaxTest");