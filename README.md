lib-tminus.js [![Build Status](https://travis-ci.org/ChronusEU/lib-tminus.js.svg)](https://travis-ci.org/ChronusEU/lib-tminus.js)
=============

A lightweight countdown library for the browser. 
There are currently two ways that the project can be used.

Environmental Dependencies
-------------
This library is entirely self-contained once built, it does however use a couple of javascript features that might not be available depending on the project requirements.
- [HTML5 requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe) (The library will fall back to `setInterval` if it detects that the feature is not available, but this is less efficient.)
- [HTML5 data attributes](http://caniuse.com/#feat=dataset) (Used by the default build for formatting, it is possible to replace this by building a custom version of the library. See [#commonjs-modules](#commonjs-modules))
- [querySelectorAll](http://caniuse.com/#feat=queryselector) (Like the data attributes, used for the default build for formatting. Can be replaced the same way.) 

Use as an independent library
-------------
Simply include the file `dist/lib-tminus.js` or `dist/lib-tminus.min.js` in your project.
These files contain all the code necessary, exposing the object `TminusLib` in the global scope.

This version of the library uses the data-attribute feature of HTML5, which allows the user to format the countdown through html.
```html
<div class="loading countdown">
  <span data-tminus-hide-if-zero="d">
    <span data-tminus-unit="d"></span>d 
  </span>
  <span data-tminus-unit="h"></span>h 
  <span data-tminus-unit="m"></span>m 
  <span data-tminus-unit="s"></span>s
</div>
```
What the library will do is inject the elements with the attribute `data-tminus-unit` with the value of the specified unit, the attribute specifying the unit through its value.
The `data-tminus-hide-if-zero` attribute will make the library set `display: 'none'` on the element once the value of the specified unit is no longer significant, which means that it has become zero and won't ever be anything other than zero past that point.

The library exposes three methods that can be used to initialize the countdown. They differ in the way that the target date is specified but share the last two parameters.

- The first parameter specifies the target time for when the countdown should end.
  - `TminusLib.createCountdownWithEpoch` accepts the time in **seconds** since epoch.
  - `TminusLib.createCountdownWithChronus` accepts a [Chronus](http://a.chronus.eu/) time identifier, which is a hexidecimal string.
  - `TminusLib.createCountdownWithDate` accepts a native javascript `Date` object or the target time in milliseconds
- The second parameter specifies the elements that represent the countdown, this can be either a `DOMElement`, a `jQuery` object, the result of `Element.querySelector(All)` or an array of `DOMElement`s. The elements provided will also be the ones recieving specific css-classes based on their state.
- The third parameter is optional and should be an object that specifies some options.
  - `finishedCallback` is a function that will be called **once** when the countdown ends. It will ALWAYS be called even if the countdown has already expired when it is initialized.
  - `finishedClass` is the class that will be added to the root elements when the countdown ends, defaults to `finished`
  - `loadedCallback` is a function that will be called once the countdown has been initialized, there are no guarentees about the order in which `loadedCallback` and `finishedCallback` are called.
  - `loadingClass` is a class that will be removed from the root elements once the countdown has been loaded. Can be used to hide the countdown formatting until it is initialized.
- All the calls will return an object that contains the following methods.
  - `getUpdatedPeriod` will return a new [Period](src/unit/Period.coffee) object which will be up-to-date regardless of the state of the countdown.
  - `getCountdownPeriod` will return the last [Period](src/unit/Period.coffee) for which the countdown has been updated.
  - `stopCountdown` will stop the countdown if called, used for cleanup purposes. Once a countdown has reached zero it will stop itself from updating.

**Example (with jQuery)**
```html
<div class="loading countdown" id="countdown">
  <span data-tminus-hide-if-zero="d">
    <span data-tminus-unit="d"></span>d 
  </span>
  <span data-tminus-unit="h"></span>h 
  <span data-tminus-unit="m"></span>m 
  <span data-tminus-unit="s"></span>s
</div>

<script src="lib-tminus.min.js"></script>
<script>
  var control = TminusLib.createCountdownWithDate(new Date().getTime() + (1000 * 60 * 60), $('#countdown'));
  //control.stopCountdown(); //Stop the countdown!
</script>
```

CommonJS modules
-------------
*TODO*
