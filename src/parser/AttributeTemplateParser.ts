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
     * Data attribute that is used to identify which elements need to be injected by countdown components, as well as
     * specify which type of component to inject.
     *
     * {@code <div data-{displayAttribute}="D"></div>} will be injected with the amount of days left over for the
     * countdown.
     *
     * The injection is performed by replacing the innerHTML of the tagged elements with the (possibly zero-padded)
     * value, any previous content will be discarded.
     *
     * Defaults to {@see DOM_DISPLAY_ATTRIBUTE}
     */
    displayAttribute?: string;

    /**
     * Data attribute that is used to identify which elements need to be hidden once a specific countdown component
     * becomes insignificant, as well as specify the exact component type to monitor for this event.
     *
     * For more information about significance {@link Period.TimeValue.significant}.
     *
     * {@code <div data-{hidableAttribute}="D"></div>} will be hidden when the countdown has less than 1 day remaining.
     *
     * The element is hidden by setting the css attribute 'display' to 'none', essentially removing the element from
     * the visual part of the DOM.
     *
     * Defaults to {@see DOM_HIDABLE_ATTRIBUTE}
     */
    hidableAttribute?: string;

    /**
     * Modify the default zero-padding behavior for the various {@link Period.TimeKey} components.
     * If a key is set to true in this map, it will zero-pad the values in the template.
     *
     * Defaults to {@see DEFAULT_KEY_PADDING}
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
 * If the given (positive) number is below 10, append a '0' before the number and return the string.
 */
function zeroPad(num:number):string {
    return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Returns the given number as a string with no further modifications.
 */
function noopZeroPad(num:number):string {
    return `${num}`;
}

/**
 * Removes all the elements at the given indexes from the given array.
 * Both the indexes array and the target array will be modified by this function.
 *
 * @param arr Target array from which elements will be removed.
 * @param indexesToRemove Array indexes that need to be removed, cannot contain duplicate indexes.
 */
function removeArrayIndexes<T>(arr:T[], indexesToRemove:number[]):void {
    //Remove elements in reverse order, since splice
    // changes the array length and element indexes
    // for all items after the removed item.
    indexesToRemove.sort();
    for (var i = indexesToRemove.length; i--;) {
        arr.splice(indexesToRemove[i], 1);
    }
}

export type SubCallback = (period:Period.Period) => boolean;

/**
 * Creates an updater function for the given {@link Period.TimeKey}.
 *
 * This returned callback will not attempt to update the given elements if the Period that it is provided does not
 * differ from the previous Period.
 *
 * Once the {@link Period.TimeKey} has become insignificant, this updater will be deactivated since it no longer
 * needs to be updated.
 *
 * The created callback will return false when it no longer has to be called (due to being finished)
 */
function buildUpdater(key:Period.TimeKey,
                      zeroPadFunc:(n:number) => string,
                      dElem:HTMLElement[],
                      hElem:HTMLElement[],
                      insignificantHandler:(el:HTMLElement[], key?:string)=>void):SubCallback {
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
                    insignificantHandler(hElem, Period.TimeKey[key]);
                }
            }

            return unit.significant;
        };
    } else {
        return null;
    }
}

/**
 * The AttributeTemplateParser builds a countdown using a pre-existing DOM structure containing specific data-attribute
 * values to mark which elements need to be injected with values for the countdown.
 *
 * data-{opts.displayAttribute} specifies injection of countdown components. {@see Period.TimeKey}
 * data-{opts.hidableAttribute} specifies elements that need to be hidden once a countdown component becomes
 * insignificant.
 */
export class AttributeTemplateParser implements Parser.Parser {
    private kDisplay:string;
    private kHidable:string;
    private padKeys:Dict<boolean>;

    /**
     * Construct a data-attribute-based parser with the given options.
     *
     * @param {object} opts options to modify some parsing behaviours.
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

    build(roots:ArrayLikeShim<HTMLElement>):Callback {
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
                hidableElements.filter((el) => el.getAttribute(`data-${this.kHidable}`) === key),
                (els) => forEach(els, (el) => el.style.display = "none")
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