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
# Documentation

## Introduction

Hype Style Caster is a powerful extension for Tumult Hype that allows you to dynamically style elements on your web page. With this extension, you can easily change the appearance of an element based on user interaction or other conditions on the page without writing any CSS code in Head HTML.

## Getting Started

1. Download and include the Hype Style Caster extension in your Hype project.
2. Add the `data-style-declaration` attribute to the element you want to style.
3. Specify the style you want to apply in the value of the `data-style-declaration` attribute.
4. Optionally, use `data-style-action` attribute in combination with Hype Action Events to apply styles dynamically.

## FAQ

**Q: Can I use Hype Style Caster with Hype Action Events?**

A: Yes, you can use Hype Style Caster with Hype Action Events. You can use the `data-style-action` attribute along with JavaScript code to apply styles dynamically based on user interactions or other conditions on the page.

**Q: What if I want to change the style of an element based on other conditions on the page?**

A: You can use the `data-style-action` attribute along with JavaScript code to apply styles based on other conditions on the page, such as browser width or scroll position.

**Q: Can I use Hype Style Caster to set the width, height, and position of elements in a Hype symbol?**

A: Yes, using the `data-style-declaration` attribute, you can set the width, height, and position of elements in a Hype symbol, which is especially useful since Hype symbols don't support the built-in flexible layouts method yet.

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
| hypeDocument.setElementStyle          | Sets the style of an element                              |
| hypeDocument.refreshStyleActions      | Refreshes the style actions for an element                |

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


---

# Usage Guide

Hype Style Caster is a powerful tool that allows you to dynamically style elements on your web page without writing CSS code in the Head HTML. This guide will walk you through the process of using Hype Style Caster, starting with easy tasks and gradually increasing in complexity.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Working with Hype Action Events](#working-with-hype-action-events)
3. [Changing Styles Based on Page Conditions](#changing-styles-based-on-page-conditions)
4. [Using Hype Functions with data-style-action](#using-hype-functions-with-data-style-action)
5. [Styling Elements in Hype Symbols](#styling-elements-in-hype-symbols)
6. [Using data-style-var and data-style-closest](#using-data-style-var-and-data-style-closest)
7. [Advanced Styling Options](#advanced-styling-options)

## Basic Usage

To start using Hype Style Caster, add a `data-style-declaration` attribute to the element you want to style. Then, specify the style you want to apply in the attribute's value.

For example, to change the color of an element to red, add the following attribute to the element:

| key | value |
| --- | --- |
| data-style-declaration | color: red; |

Hype Style Caster will then apply the specified style to the element.

**[Download example1.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example1.hype.zip) (23.2 KB)**

## Working with Hype Action Events

You can use Hype Style Caster with Hype Action Events. To do this, add a `data-style-action` attribute to the element you want to style. Then, specify the code you want to execute when the event occurs.

For example, to change the color of an element to red when the user clicks on it, add the following attribute to the element:

| key | value |
| --- | --- |
| data-style-action | element.style.color='red'; |

Hype Style Caster will take care of applying the style to the element.

**[Download example2.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example2.hype.zip) (22.4 KB)**

## Changing Styles Based on Page Conditions

Hype Style Caster allows you to change the style of an element based on other conditions on the page, such as browser window width or scroll position.

To do this, add a `data-style-action` attribute to the element and specify the JavaScript code you want to run in the attribute.

For example, to change the background color of an element to red or green depending on if the browser width is less than 768px, use the following code:

| key | value |
| --- | --- |
| data-style-action | { backgroundColor: window.innerWidth < 768?  'red' : 'green' } |

In this example, the element's background color will change after refreshes when the browser width is less than 768px.

**[Download example3.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example3.hype.zip) (18.5 KB)**

## Using Hype Functions with data-style-action

You can use Hype functions with `data-style-action` to change the style of an element based on a function's result.

For example, to change the color of an element to red when the user clicks on it, add the following attribute to the element:

| key | value |
| --- | --- |
| data-style-action | myStyle() |

In your Hype function, use the following code:

```javascript
function myStyle(hypeDocument, element, event) {
	return { color: 'red' };
}
```

When the scene is prepared for display, the `myStyle()` function will be executed, and the color of the element will be set to red.

**[Download example4.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example4.hype.zip) (22.6 KB)**

## Styling Elements in Hype Symbols

Hype symbols don't support the built-in flexible layouts method, but you can use the `data-style-declaration` attribute to set the width, height, and position of elements within them.

For example, to set the width of an element to 50%, use the following code:

| key | value |
| --- | --- |
| data-style-declaration | width: 50% |

To set the height of an element to 100%, use the following code:

| key | value |
| --- | --- |
| data-style-declaration | height: 100% |

You can also use the `calc` function in the `data-style-declaration` attribute to set element width, height, and position.

For example, to set the width of an element to 100% of the width - 100px of the symbol and the left position to 50px, use the following code:

| key | value |
| --- | --- |
| data-style-declaration | width: calc(100% - 100px); left: 50px; |

**[Download example6.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example6.hype.zip) (188.4 KB)**

## Using data-style-var and data-style-closest

With `data-style-var`, you can mirror mutations to CSS variables. `data-style-closest` allows you to define the closest selector to set styles on. This approach lets you create responsive designs and animations based on other element properties.

For example, to set the values `--foo-width` and `--foo-height` on the Hype scene root, use the following attributes:

| key | value |
| --- | --- |
| data-style-var | foo |

To set the same values on the closest element matched by `.bar`, use the following attributes:

| key | value |
| --- | --- |
| data-style-var | foo |
| data-style-closest | .bar |

## Advanced Styling Options

With version 1.0.4, you can request any style value or transform value to be set as a CSS custom property.

For example, to monitor the width and height of an element, use the following attribute:

| key | value |
| --- | --- |
| data-cast-properties | foo |

To monitor only the height and translateX, use the following attribute:

| key | value |
| --- | --- |
| data-cast-properties | foo:height, translateX |

You can also cast values using built-in functions like `int` (parseInt) and `float` (parseFloat), or register new casting functions:

| key | value |
| --- | --- |
| data-cast-properties | foo:(int)width, (float)translateY |

**[Download example7.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example7.hype.zip) (23.5 KB)**
**[Download example8.hype.zip](https://playground.maxziebell.de/Hype/StyleCaster/example8.hype.zip) (24 KB)**

This guide should help you get started with using Hype Style Caster, from basic tasks to more advanced techniques. Happy styling!
