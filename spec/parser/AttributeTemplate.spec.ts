/// <reference path="../../typings/tsd.d.ts" />
'use strict';

import ATP = require("../../src/parser/AttributeTemplateParser");
import Period = require("../../src/unit/Period");

describe("AttributeTemplateParser", () => {
    function setupDefaultTemplate(q:JQuery):void {
        q.affix('span[data-tminus-hide-if-zero="D"] span[data-tminus-unit="D"]');
        q.affix('span[data-tminus-unit="h"]');
        q.affix('span[data-tminus-unit="m"]');
        q.affix('span[data-tminus-unit="s"]');
    }

    function runUpdater(q:JQuery, p:Period.Period):void {
        var updater = new ATP.AttributeTemplateParser({}).build(q);
        updater(p);
    }

    function setupWithPeriod(q:JQuery, p:Period.Period):void {
        setupDefaultTemplate(q);
        runUpdater(q, p);
    }

    function expectDOMstate(node:JQuery, content:string, visibility?:boolean) {
        if (visibility !== undefined) {
            expect(node.is(":visible")).toEqual(visibility);
        }
        expect(node.text()).toEqual(content);
    }

    function setupContainer() {
        this.container = affix('.loading.countdown#countdown');
        return this.container;
    }

    beforeEach(setupContainer);

    it("should correctly mutate the DOM on invocation", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(121));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0");
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "0");
        expectDOMstate(root.find('[data-tminus-unit="m"]'), "02");
        expectDOMstate(root.find('[data-tminus-unit="s"]'), "01");
    });

    it("should correctly handle element hiding", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24 - 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0", false);
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "23", true);
    });

    it("should correctly handle element showing", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "1", true);
        expectDOMstate(root.find('[data-tminus-unit="h"]'), "0", true);
    });

    it("should reset if a countdown template is reused.", function () {
        var root = this.container;
        setupWithPeriod(root, Period.ofSeconds(60 * 60 * 24 - 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "0", false);

        //Run updater since the template has already been set up
        runUpdater(root, Period.ofSeconds(60 * 60 * 24 + 1));
        expectDOMstate(root.find('[data-tminus-unit="D"]'), "1", true);
    })
});