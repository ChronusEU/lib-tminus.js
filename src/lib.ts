/// <reference path="./decl/class-list.d.ts" />
/// <reference path="./decl/ArrayLike.d.ts" />
'use strict';

import ClassList = require("class-list");
import forEach = require("./util/foreach");
import Countdown = require('./countdown/Countdown');
import Period = require('./unit/Period');
import Parser = require('./parser/Parser');
import ATParser = require('./parser/AttributeTemplateParser');

var DEFAULT_FINISHED_CLASS:string = "finished";

/**
 * This function coerces the given type to an array-like type.
 *
 * If: input is array-indexable (has .length property)
 *   => returns without change
 * Else:
 *   => return input wrapped in an Array
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
     * Class name that should be added to the provided root elements once the countdown has finished.
     *
     * Defaults to {@see DEFAULT_FINISHED_CLASS}
     */
    finishedClass?: string

    /**
     * Class name that should be removed from the provided root elements once the countdown has initialized.
     */
    loadingClass?: string
}

/**
 * The default behaviour has the following steps:
 * * Add default behavior for adding a 'finished' class to the roots once finished.
 * * If specified, add callback to remove 'loading' class from roots.
 * * Create a "data-*"-based parser with the given options.
 * * Parse the given roots with the parser and create the countdown looper.
 * * Return the controls for the created looper.
 */
function createCountdown(milliSeconds:number,
                         roots:HTMLElement|ArrayLike<HTMLElement>,
                         options:DefaultOptions = {}):Countdown.Controller {
    var rootArray = convertToArray(roots);

    //Default behavior, add class on finish
    var oldFinishedCallback = options.finishedCallback;
    options.finishedCallback = () => {
        var clazz = options.finishedClass || DEFAULT_FINISHED_CLASS;

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
 * Initialize a countdown that will update a template within the given roots.
 *
 * @param {number} epoch time in seconds since UNIX epoch as target for the countdown.
 * @param {HTMLElement|Array} roots Elements that contain a template that needs to be updated based on the countdown.
 * @param {object} options Options to modify some properties of the countdown.
 */
export function withSeconds(epoch:number,
                            roots:HTMLElement|ArrayLike<HTMLElement>,
                            options?:DefaultOptions):Countdown.Controller {
    return createCountdown(epoch * 1000, roots, options);
}

/**
 * Initialize a countdown that will update a template within the given roots.
 *
 * @param {Date|number} date time in milliseconds since UNIX epoch as target for the countdown.
 * @param {HTMLElement|Array} roots Elements that contain a template that needs to be updated based on the countdown.
 * @param {object} options Options to modify some properties of the countdown.
 */
export function withMillis(date:Date|number,
                           roots:HTMLElement|ArrayLike<HTMLElement>,
                           options?:DefaultOptions):Countdown.Controller {
    return createCountdown(Number(date), roots, options);
}