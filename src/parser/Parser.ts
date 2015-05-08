/// <reference path="../decl/ArrayLike.d.ts" />
'use strict';

import Period = require("../unit/Period");
import ATParser = require('./AttributeTemplateParser');
import forEach = require('../util/foreach');

export type Callback = (period:Period.Period) => void;

export interface ParserOptions extends ATParser.ATPOptions {
}

/**
 * A parser takes a set of DOM elements and creates a function that updates those elements to represent
 * a given countdown period. This function should be repeatably callable so it can be reused.
 */
export interface Parser {
    /**
     * Create an updater function, this function takes a given Period of time that has to expire and updates
     * its internal state and external representation accordingly.
     *
     * The library will attempt to limit invocations of the callback to cases where the Period is different from the
     * previous period.
     *
     * @param {Array} roots root elements of the DOM that needs to be updated by this countdown.
     */
    build(roots:ArrayLike<HTMLElement>): Callback;
}