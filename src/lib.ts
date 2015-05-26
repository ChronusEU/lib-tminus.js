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

export interface LibOptions extends Countdown.Options, Parser.ParserOptions {
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

export interface InputOptions extends LibOptions {
    /**
     * Instant that the countdown will be counting down to.
     *
     * Accepts either a Date instance or milliseconds since UNIX epoch (1st Jan 1970 00:00 UTC)
     */
    endTime: number|Date

    /**
     * DOM element(s) that will be injected with the countdown.
     *
     * By default the {@see AttributeTemplateParser} is used to determine the format of the countdown.
     * This parser uses data contained in the pre-existing DOM tree of the targets to inject the countdown.
     */
    target: HTMLElement|ArrayLike<HTMLElement>
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
                         options:LibOptions):Countdown.Controller {
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
 * Entry point for the library, initializes a countdown using the target DOM and moment specified in the options.
 */
export function countdown(opts:InputOptions):Countdown.Controller {
    return createCountdown(Number(opts.endTime), opts.target, opts)
}