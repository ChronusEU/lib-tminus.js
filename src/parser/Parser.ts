/// <reference path="../decl/ArrayLike.d.ts" />
'use strict';

import Period = require("../unit/Period");
import ATParser = require('./AttributeTemplateParser');

export type Callback = (period:Period.Period) => void;

export interface ParserOptions extends ATParser.ATPOptions {
}

/**
 *
 */
export interface Parser {
    /**
     *
     * @param {Array} roots
     */
    build(roots:ArrayLike<HTMLElement>): Callback;
}