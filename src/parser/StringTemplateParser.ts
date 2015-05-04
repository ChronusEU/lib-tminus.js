'use strict';

import Parser = require('./Parser');
import Period = require('../unit/Period');
import ATParser = require('./AttributeTemplateParser');
import forEach = require('../util/foreach');

export type Callback = (period:Period.Period) => void;

export interface STOptions extends ATParser.ATPOptions {
    template:string;
}

function transformTemplateDOM<E extends HTMLElement>(root2:E, template:string):E {
    var root:HTMLElement = root; //temporary for development purposes
    root.innerHTML = template;
    return root2;
}

/**
 *
 */
export class StringTemplateParser implements Parser.Parser {
    private templateDOM:HTMLSpanElement;
    private innerParser:ATParser.AttributeTemplateParser;

    constructor(opts:STOptions) {
        this.templateDOM = transformTemplateDOM(document.createElement("span"), opts.template);
        //TODO: Set up custom identifiers for display/hidable nodes
        this.innerParser = new ATParser.AttributeTemplateParser(opts);

        throw "Not yet ready for use, see parser/StringTemplateParser";
    }

    build(roots:ArrayLike<HTMLElement>):Callback {
        // Idea is to cloneNode the template, move the cloned elements to the new root and
        //  then creating a parser for the elements (perhaps reuse AttributeTemplateParser)
        forEach(roots, (el) => {
            //Remove any existing nodes from the root
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            //Move a clone of the template DOM into the root
            el.appendChild(this.templateDOM.cloneNode(true));
        });

        // We use the attribute template parser to construct the updating function
        return this.innerParser.build(roots);
    }
}