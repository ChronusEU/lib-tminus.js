/// <reference path="../decl/ArrayLike.d.ts" />
/// <reference path="../decl/Dict.d.ts" />
'use strict';

import Parser = require('./Parser');
import Period = require('../unit/Period');
import copyMap = require('../util/copyMap');
import forEach = require('../util/foreach');

export type Callback = (period:Period.Period) => void;

export interface ATPOptions {
    /**
     * Defaults to {@see DOM_DISPLAY_ATTRIBUTE}
     */
    displayAttribute?: string;

    /**
     * Defaults to {@see DOM_HIDABLE_ATTRIBUTE}
     */
    hidableAttribute?: string;

    /**
     *
     */
    zeroPadOverrides?: Dict<boolean>;
}

var DOM_DISPLAY_ATTRIBUTE:string = "tminus-unit";
var DOM_HIDABLE_ATTRIBUTE:string = "tminus-hide-if-zero";

//Based on Period.TimeKey
var DEFAULT_KEY_PADDING:Dict<boolean> = {
    "s": true,
    "S": true,
    "m": true,
    "M": true,
    "h": false,
    "H": false,
    "D": false
};

/**
 *
 */
function zeroPad(num:number):string {
    return num < 10 ? `0${num}` : `${num}`;
}

/**
 *
 */
function noopZeroPad(num:number):string {
    return `${num}`;
}

/**
 *
 * @param arr
 * @param indexesToRemove
 */
function removeArrayIndexes<T>(arr:T[], indexesToRemove:number[]):void {
    //Remove elements in reverse order, since splice
    // changes the array length and element indexes
    for (var i = indexesToRemove.length; i--;) {
        arr.splice(indexesToRemove[i], 1);
    }
}

export type SubCallback = (period:Period.Period) => boolean;

/**
 *
 * The created callback will return false when it no longer has to be called (due to being finished)
 */
function buildUpdater(key:Period.TimeKey,
                      zeroPadFunc:(n:number) => string,
                      dElem:HTMLElement[],
                      hElem:HTMLElement[]):SubCallback {
    var previousValue:number = Number.NaN;

    if (dElem.length + hElem.length > 0) {
        //Reset hidden values, will be corrected in the first iteration
        forEach(hElem, (el) => el.style.display = "");

        return (period:Period.Period) => {
            var unit = period.getUnit(key);
            if (unit.value !== previousValue) {
                previousValue = unit.value;
                var paddedValue = zeroPadFunc(previousValue);

                forEach(dElem, (el:HTMLElement) => el.innerHTML = paddedValue);

                // Once a value is no longer significant it cannot return,
                // so the reverse case does not need to be handled
                if (!unit.significant) {
                    forEach(hElem, (el:HTMLElement) => el.style.display = "none");
                }
            }

            return unit.significant;
        };
    } else {
        return null;
    }
}

/**
 *
 */
export class AttributeTemplateParser implements Parser.Parser {
    private kDisplay:string;
    private kHidable:string;
    private padKeys:Dict<boolean>;

    /**
     * @param {object} opts
     */
    constructor(opts:ATPOptions) {
        this.kDisplay = opts.displayAttribute || DOM_DISPLAY_ATTRIBUTE;
        this.kHidable = opts.hidableAttribute || DOM_HIDABLE_ATTRIBUTE;
        this.padKeys = copyMap(DEFAULT_KEY_PADDING);

        if (opts.zeroPadOverrides) {
            forEach(Object.keys(opts.zeroPadOverrides), (key:string) => {
                if (DEFAULT_KEY_PADDING[key] !== undefined) {
                    this.padKeys[key] = opts.zeroPadOverrides[key];
                }
            });
        }
    }

    build(roots:ArrayLike<HTMLElement>):Callback {
        var displayElements:HTMLElement[] = [];
        var hidableElements:HTMLElement[] = [];

        forEach(roots, (el:HTMLElement) => {
            forEach(
                <NodeListOf<HTMLElement>>el.querySelectorAll(`[data-${this.kDisplay}]`),
                (el) => displayElements.push(el)
            );
            forEach(
                <NodeListOf<HTMLElement>>el.querySelectorAll(`[data-${this.kHidable}]`),
                (el) => hidableElements.push(el)
            );
        });

        var updaters:SubCallback[] = [];
        forEach(Object.keys(this.padKeys), (key:string) => {
            var updater = buildUpdater(
                Period.TimeKey[key],
                this.padKeys[key] ? zeroPad : noopZeroPad,
                displayElements.filter((el) => el.getAttribute(`data-${this.kDisplay}`) === key),
                hidableElements.filter((el) => el.getAttribute(`data-${this.kHidable}`) === key)
            );

            if (updater) {
                updaters.push(updater);
            }
        });

        return (p:Period.Period) => {
            var toRemove:number[] = [];

            forEach(updaters, (updater) => {
                if (!updater(p)) {
                    //Updater finished, queue for removal
                    toRemove.push(updaters.indexOf(updater));
                }
            });

            if (toRemove.length) {
                //Remove the elements at the given indexes
                removeArrayIndexes(updaters, toRemove);
            }
        };
    }
}