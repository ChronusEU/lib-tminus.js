//-- ROOT
declare module "lib-tminus" { //Possibly auto-generate title
    import Tmp = require("lib");
    export = Tmp;
}

declare module "lib-tminus/lib" {
    import Tmp = require("lib");
    export = Tmp;
}

//-- countdown
declare module "lib-tminus/countdown/Countdown" {
    import Tmp = require("countdown/Countdown");
    export = Tmp;
}

declare module "lib-tminus/countdown/Looper" {
    import Tmp = require("countdown/Looper");
    export = Tmp;
}

declare module "lib-tminus/countdown/RAFLooper" {
    import Tmp = require("countdown/RAFLooper");
    export = Tmp;
}

declare module "lib-tminus/countdown/TimeoutLooper" {
    import Tmp = require("countdown/TimeoutLooper");
    export = Tmp;
}

//-- parser
declare module "lib-tminus/parser/Parser" {
    import Tmp = require("parser/Parser");
    export = Tmp;
}

declare module "lib-tminus/parser/AttributeTemplateParser" {
    import Tmp = require("parser/AttributeTemplateParser");
    export = Tmp;
}

declare module "lib-tminus/parser/StringTemplateParser" {
    import Tmp = require("parser/StringTemplateParser");
    export = Tmp;
}

//-- unit
declare module "lib-tminus/unit/Instant" {
    import Tmp = require("unit/Instant");
    export = Tmp;
}

declare module "lib-tminus/unit/Period" {
    import Tmp = require("unit/Period");
    export = Tmp;
}

//-- util
declare module "lib-tminus/util/copyMap" {
    import Tmp = require("util/copyMap");
    export = Tmp;
}

declare module "lib-tminus/util/epoch" {
    import Tmp = require("util/epoch");
    export = Tmp;
}

declare module "lib-tminus/util/foreach" {
    import Tmp = require("util/foreach");
    export = Tmp;
}

declare module "lib-tminus/util/prefixed" {
    import Tmp = require("util/prefixed");
    export = Tmp;
}