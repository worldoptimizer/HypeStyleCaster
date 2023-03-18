# Hype Style Caster

![HypeStyleCaster|690x487](https://playground.maxziebell.de/Hype/StyleCaster/HypeStyleCaster.jpg)

Create and override inline styles or cast value changes to custom properties (CSS Vars)

## Documentation

There is a [JSDoc](https://en.wikipedia.org/wiki/JSDoc) based documentation of the functions at https://doxdox.org/worldoptimizer/HypeStyleCaster

Content Delivery Network (CDN)
--

Latest version can be linked into your project using the following in the head section of your project:

```html
<script src="https://cdn.jsdelivr.net/gh/worldoptimizer/HypeStyleCaster/HypeStyleCaster.min.js"></script>
```
Optionally you can also link a SRI version or specific releases. 
Read more about that on the JsDelivr (CDN) page for this extension at https://www.jsdelivr.com/package/gh/worldoptimizer/HypeStyleCaster

Learn how to use the latest extension version and how to combine extensions into one file at
https://github.com/worldoptimizer/HypeCookBook/wiki/Including-external-files-and-Hype-extensions

---
# Hype Style Caster Extension

This extension allows you to use custom CSS properties and styles in your Hype projects. It enables you to easily cast CSS variables, create and manage style sheets, and parse transform properties. You can also register new casting functions and set global defaults for the extension. When casting variables they will be set on the current scene and propagate normally from there as regular CSS. 

## Getting Started

* Make sure to include the HypeStyleCaster script in your project and utilize the available API functions to enhance your project's styling capabilities.

## FAQ

**Q: What does this extension do?**

A: Hype Style Caster extension adds custom CSS properties and styles to your Hype projects. It allows you to cast CSS variables, create and manage style sheets, parse transform properties, and register new casting functions.

**Q: How do I use this extension in my project?**

A: Include the Hype Style Caster extension script in your HTML file and make use of the available API functions.

## Data Attributes

The following data attributes are accessible to users:

| Attribute               | Function                                                  |
| ----------------------- | --------------------------------------------------------- |
| data-style-declaration  | Sets the style declaration for an element                 |
| data-style-expression   | Sets the style expression for an element                  |
| data-cast-properties    | Sets the cast properties for an element                   |
| data-cast-to-closest    | Sets the closest selector to set the cast properties on   |
| data-cast-to-target     | Sets the target selector to set the cast properties on    |
| data-cast-to-targets    | Sets multiple target selectors to set the cast properties on |

## Extended hypeDocument API

The following table shows all the available hypeDocument commands:

| Command                  | Function                                                  |
| ------------------------ | --------------------------------------------------------- |
| setElementStyle          | Sets the style of an element                              |
| refreshStyleActions      | Refreshes the style actions for an element                |

## HypeStyleCaster API

The following table documents the HypeStyleCaster API and its functions:

| Command                             | Function                                                  |
| ----------------------------------- | --------------------------------------------------------- |
| HypeStyleCaster.version            | Returns the current version of Hype Style Caster          |
| HypeStyleCaster.setDefault         | Sets a global default by key or all defaults at once      |
| HypeStyleCaster.getDefault         | Returns the value of a default by key or all defaults     |
| HypeStyleCaster.isValidCSS         | Checks if the string is a valid CSS property              |
| HypeStyleCaster.styleToString      | Converts a style object to a string                        |
| HypeStyleCaster.createStyleSheet   | Creates a style sheet with the given id and returns it    |
| HypeStyleCaster.parseTransform     | Parses the transform property and returns the value       |
| HypeStyleCaster.removeStyleVariable| Removes a style variable from all elements in the base element |
| HypeStyleCaster.registerCastingFunction | Registers a new casting function                      |
| HypeStyleCaster.resolveCastingFunction | Resolves the casting of the CSS property               |
