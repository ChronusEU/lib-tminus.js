lib-tminus.js [![Build Status](https://travis-ci.org/ChronusEU/lib-tminus.js.svg)](https://travis-ci.org/ChronusEU/lib-tminus.js)
=============

A lightweight countdown library for the browser. 

**Features**
- Creates correct countdowns, even across Daylight Saving Time (DST) shifts.
- Minimal number of assumptions and dependencies.
- Uses the DOM to define the format of the countdown, instead of relying on string templates.

Assumptions
------------
Since browsers have evolved since the days of Internet Explorer 6 this library assumes a number of modern features are available in the target browsers. If features are not supported in the target browsers then it is possible to apply [polyfills](http://en.wikipedia.org/wiki/Polyfill) before embedding the library to add support.

The following features are assumed to be available in the target browsers:
- [Object.Keys](http://kangax.github.io/compat-table/es5/#Object.keys)
- [querySelector/querySelectorAll](http://caniuse.com/#feat=queryselector) *(Used by [AttributeTemplateParser](src/parser/AttributeTemplateParser.ts))*
- [data-* attributes](http://caniuse.com/#feat=dataset) *(Used by [AttributeTemplateParser](src/parser/AttributeTemplateParser.ts))*

The following features are used but have fallbacks embedded in the library:
- [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe) - A setInterval-based method will be used as a fallback if requestAnimationFrame is not available.
- [classList](http://caniuse.com/#feat=classlist) - The `class-list` polyfill is included in the project.

Standalone use
------------
*lib-tminus* is available as a standalone library by downloading a distribution and embedding it into the website.

#### Distribution

There are two ways of downloading the distribution:

1. Through [the github releases](https://github.com/ChronusEU/lib-tminus.js/releases), simply download the latest release.
2. Through [bower](http://bower.io/)

   `bower install lib-tminus`

#### How to use

To use the library there are two concepts that need to be explained.
This section will explain how to use the library, the configuration options and give an example.

---

Countdown styling is done through normal HTML. Simply create a HTML block that styles the countdown and use the following data-attributes to mark the elements that need to be manipulated by the library:

`data-tminus-unit="<value key>"` is used to indicate the countdown needs to inject a **value** into the element, the element cannot contain any other content. Any existing content will be deleted when the countdown is initialized.
The available *value keys* are found below.

`data-tminus-hide-if-zero="<value key>"` is used to indicate that an element needs to be **hidden** (`display=none`) once the specified *value key* is zero. A *value key* is considered zero when it cannot become non-zero anymore. (Examples include the `D` key being considered zero once the countdown passes the 24-hour mark)

Available **value keys**:
- `D` - Total days remaining until the countdown ends.
- `H` - Total hours remaining until the countdown ends.
- `h` - Hours until the next day of the countdown passes, capped to 23.
- `M` - Total minutes remaining until the countdown ends.
- `m` - Minutes until the next hour of the countdown passes, capped to 59.
- `S` - Total seconds remaining until the countdown ends.
- `s` - Seconds until the next minute of the countdown passes, capped to 59.

---

Once the countdown has been styled it is initialized by passing an enclosing element to *lib-tminus* with the following call:

```javascript
var control = TminusLib.countdown({
  endTime: {time}
  target: {element}
});
```

The full overview of the options as well as the controller object returned by the function call can be found below.

Options:
- `endTime` (required) - Date that the countdown will be counting down towards. Can be either a Date object or a specific number of milliseconds since UNIX epoch (1st Jan 1970 00:00 UTC)
  - `endTime: Date.now() + (1000 * 60 * 60)` - Specifies a countdown for 1 hour in the future.
  - `endTime: new Date(Date.UTC(2015, 12, 31))` - Specifies a countdown for the 31st of December 2015 at 00:00 UTC.
  - *Beware that the string constructor for Date* (`new Date('December 17, 2015 03:24:00')`) *assumes the user's timezone is used if no timezone is specified in the string. This means it will produce Date object for different moments depending on the user's timezone.*
- `target` (required) - Either a single DOM element or an array-like list of DOM elements. The contents of these elements will be scanned to determine where the countdown needs to manipulate the DOM.
  - `target: document.getElementById('countdown')` - Single element selection
  - `target: document.querySelectorAll('#countdown')` - Array-like element selection
  - `target: $('#countdown')` - jQuery returns an array-like element selection
- `finishedClass` (optional) - Specifies a css class that is to be added to the `target` elements once the countdown has ended. The class will always be added, even if the specified `endTime` has already passed. Defaults to `finished`.
- `loadingClass` (optional) - Specifies a css class that to be removed from the `target` elements once the countdown has been initialized.
- `finishedCallback` (optional) - Specifies a function callback that will be called once the countdown has ended.
  - `finishedCallback: function () { console.log('countdown ended'); }`
- `loadedCallback` (optional) - Specifies a function callback that will be called once the countdown has been initialized.
  - `loadedCallback: function () { console.log('countdown started'); }`
- `displayAttribute` (optional) - data-attribute name that will be used to identify elements that need to be injected with a specified countdown value. Defaults to `tminus-unit`.
- `hidableAttribute` (optional) - data-attribute name that will be used to identify elements that need to be hidden once a specified countdown values becomes insignificant. Defaults to `tminus-hide-if-zero`.
- `zeroPadOverrides` (optional) - A mapping of countdown value keys to booleans that specify whether a given value needs to be zero-padded. By default only `M`, `m`, `S` and `s` will be zero-padded.
  - `zeroPadOverrides: { D: true, h: true, m: false }` enables zero-padding for `D` and `h` keys, while disabling zero-padding for the `m` key.

---

After a countdown has been created a controller object with the following methods will be returned:
- `start()` - Starts the countdown. This will always force an update of the countdown, even if the countdown has already ended.
- `stop()` - Stops the countdown from updating until `start()` is called.
- `currentPeriod()` - Retrieves a [Period](src/unit/Period.ts) object that always describes the current Period between `Date.now()` and the end time of the countdown.
- `lastUpdate()` - Retrieves the [Period](src/unit/Period.ts) for which the countdown was last updated.
  - If the countdown is not currently updating (due to being stopped or some implementation-specific reason) then this value will not update until the actual countdown starts updating.

---

Example: (Uses jQuery)
```html
<div class="loading countdown" id="countdown">
  <span data-tminus-hide-if-zero="D">
    <span data-tminus-unit="D"></span>d 
  </span>
  <span data-tminus-unit="h"></span>h 
  <span data-tminus-unit="m"></span>m 
  <span data-tminus-unit="s"></span>s
</div>

<script src="lib-tminus.min.js"></script>
<script>
  var control = TminusLib.countdown({
    endTime: Date.now() + (1000 * 60 * 60), // 1 hour in the future (in milliseconds)
    target: $('#countdown') // or document.getElementById('countdown')
  });
  control.stop(); //Stop the countdown!
  control.start(); //After stopping, start it again
</script>
```

#### jQuery Integration

By adding the following piece of code after including jQuery and TminusLib, the `countdown` function will be added to all jQuery objects, making it possible to create countdowns with: `$(selector).countdown(Date.now() + 1000 * 60 * 60)`.
```javascript
!function ($, tMinus, name) {
    $.fn[name] = function (e, u) {
        return tMinus.countdown($.extend({}, u, {
            endTime: e,
            target: this
        }))
    }
}(jQuery, TminusLib, "countdown");
```

Usage as a library
------------
TODO:
- Library is available through [npm](https://www.npmjs.com/package/lib-tminus)
- Typescript is supported by adding a reference to `<npm-dir>/lib-tminus/src-gen/modules.d.ts`
- Library can be directly require'd into application code through tools like [browserify](http://browserify.org/)