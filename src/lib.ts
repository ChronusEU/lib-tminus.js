/// <reference path="./decl/class-list.d.ts" />
/// <reference path="./decl/ArrayLike.d.ts" />
'use strict';

import ClassList = require("class-list");
import forEach = require("./util/foreach");
import Countdown = require('./countdown/Countdown');
import Period = require('./unit/Period');
import Parser = require('./parser/Parser');
import ATParser = require('./parser/AttributeTemplateParser');

/**
 *
 */
function convertToArray<U>(input:U|ArrayLike<U>):ArrayLike<U> {
    //Presence of length property is enough to separate single element and array
    if (typeof (<ArrayLike<U>>input).length !== "undefined") {
        return <ArrayLike<U>>input;
    } else {
        return [<U>input];
    }
}

export interface DefaultOptions extends Countdown.Options, Parser.ParserOptions {
    /**
     *
     */
    finishedClass?: string

    /**
     *
     */
    loadingClass?: string
}

/**
 *
 */
function createCountdown(milliSeconds:number,
                         roots:HTMLElement|ArrayLike<HTMLElement>,
                         options:DefaultOptions = {}):Countdown.Controller {
    var rootArray = convertToArray(roots);

    //Default behavior, add class on finish
    var oldFinishedCallback = options.finishedCallback;
    options.finishedCallback = () => {
        var clazz = options.finishedClass || "finished";

        //Add class to all root elements
        forEach(rootArray, (elem:HTMLElement) => {
            ClassList(elem).add(clazz);
        });

        //If there was a callback, invoke it
        if (oldFinishedCallback) {
            oldFinishedCallback();
        }
    };

    //Default behavior, remove loading class once loaded
    if (options.loadingClass) {
        var oldLoadedCallback = options.loadedCallback;
        options.loadedCallback = () => {
            //Remove loading class from all root elements
            forEach(rootArray, (elem:HTMLElement) => {
                ClassList(elem).remove(options.loadingClass);
            });

            //Invoke the old callback, if it exists.
            if (oldLoadedCallback) {
                oldLoadedCallback();
            }
        };
    }

    var parser:Parser.Parser = new ATParser.AttributeTemplateParser(options);
    return Countdown.create(new Date(milliSeconds), parser.build(rootArray), options);
}

/**
 *
 * @param {number} epoch
 * @param {HTMLElement|Array} roots
 * @param {object} options
 */
export function withSeconds(epoch:number,
                            roots:HTMLElement|ArrayLike<HTMLElement>,
                            options?:DefaultOptions):Countdown.Controller {
    return createCountdown(epoch * 1000, roots, options);
}

/**
 *
 * @param {Date|number} date
 * @param {HTMLElement|Array} roots
 * @param {object} options
 */
export function withMillis(date:Date|number,
                           roots:HTMLElement|ArrayLike<HTMLElement>,
                           options?:DefaultOptions):Countdown.Controller {
    return createCountdown(typeof date === "number" ? date : date.getTime(), roots, options);
}