Development Conventions and Guidelines
======================================

To keep the UI5 code readable and maintainable, please follow these rules, even if you find them violated somewhere. Note that this list is not complete.
When a file is consistently not following these rules and adhering to the rules would make the code worse, follow the local style.

### Table of Contents

1.  [General](#general)
1.  [JavaScript Coding Guidelines](#javascript-coding-guidelines)
    *  [Code Formatting](#code-formatting)
    *  [Naming Conventions](#naming-conventions)
    *  [Creating Classes](#creating-classes)
    *  [Documentation (JSDoc)](#documentation-jsdoc)
1.  [UI5 Control Development Guidelines](#ui5-control-development-guidelines)
    *  [API](#api)
    *  [Behavior](#behavior)
    *  [Renderer](#renderer)
    *  [Themes/CSS](#themescss)
        *  [General](#general-1)
        *  [Naming](#naming)
        *  [Images](#images)
        *  [LESS Theme Parameters](#less-theme-parameters)
1.  [Product Standards / Acceptance Criteria](#product-standards--acceptance-criteria)
1.  [File Names and Encoding](#file-names-and-encoding)
1.  [Git Guidelines](#git-guidelines)
    * [Commit Message](#commit-message)
1.  [Tools](#tools)
    *  [ESLint](#eslint)



General
-------

-   Always consider the developers who USE your control/code! Do not surprise them, but give them what they expect. And make it simple.
-   Use tabs, not spaces, for indentation (but adhere to any local standard in the file)
-   Use Unix line endings (LF-only)
    -   In Eclipse, this is configured in "Preferences - General - Workspace - New text file line delimiter"
-   Text files must be UTF-8 encoded, only `*.properties` and `*.hdbtextbundle` files must be ISO8859-1 encoded (as defined in the corresponding standard)
    -   This is at least the current state, which does cause some issues, so a change is not ruled out
    -   In Eclipse, this is configured in "Preferences - General - Workspace - Text File Encoding"
-   There is *no* 80-character line length guideline
-   Use comments. Don't rephrase the code, but tell the reader what is NOT in the code. Describe why your code does what it does. Prefer line comments.

JavaScript Coding Guidelines
----------------------------

-   No global JavaScript variables; organize all global objects in an `sap.\*` namespace structure or extend the `jQuery.sap` object. The methods `sap.ui.define(...)` and `jQuery.sap.declare(sModuleName)` assist in doing so, find [more details here](guidelines/jsnamespaces.md).
    -   This also means: no undeclared variables
    -   When using global variables introduced by other libraries, declare the usage in a special "global"-comment: `/*global JSZip, OpenAjax */`
-   Do not access internal (private) members of other objects
-   Do not use console.log()
-   Use jQuery.sap.byId("&lt;someId&gt;") instead of jQuery("\#&lt;someId&gt;") when &lt;someId&gt; is not a known string - certain characters in IDs need to be escaped for jQuery to work correctly
-   Keep modifications of jQuery and other embedded Open Source to a minimum and document them clearly with the term "SAP modification"
    -   Such modifications may not alter the standard behavior of the used library in a way that breaks other libraries

### Code Formatting

-   Our ESLint check needs to run successfully (see [the tools section](#Tools) for details); the most important formatting rules are:
    -   Add a semicolon after each statement, even if optional
    -   No spaces before and after round braces (function calls, function parameters), but…
    -   …use spaces after `if/else/for/while/do/switch/try/catch/finally`, around curly braces, around operators and after commas
    -   Opening curly brace (functions, for, if-else, switch) is on the same line
    -   Use `===` and `!==` instead of `==` and `!=` (see the ESLint docu for special cases where `==` is allowed)
    -   The code should therefore look like this:

  ```js
  function outer(c, d) {
      var e = c * d;
      if (e === 0) {
          e++;
      }
      for (var i = 0; i < e; i++) {
          // do nothing
      }

      function inner(a, b) {
          return (e * a) + b;
      }

      return inner(0, 1);
  }
  ```

    -   The Eclipse default settings for the JavaScript editor are pretty fine, but make sure tabs are used for indentation

### Naming Conventions

-   Use hungarian notation (name prefixes indicating the type) for variables and object field names (this is a strong recommendation, no obligation).
But do NOT use hungarian notation for API method parameters: the documentation will specify the type in this case. When using hungarian notation, use the prefixes highlighted below and continue with an uppercase letter (camelCase):


| Sample             | Type               |
|--------------------|--------------------|
| <b>s</b>Id         | string             |
| <b>o</b>DomRef     | object             |
| <b>$</b>DomRef     | jQuery object      |
| <b>i</b>Count      | int                |
| <b>m</b>Parameters | map / assoc. array |
| <b>a</b>Entries    | array              |
| <b>d</b>Today      | date               |
| <b>f</b>Decimal    | float              |
| <b>b</b>Enabled    | boolean            |
| <b>r</b>Pattern    | RegExp             |
| <b>fn</b>Function  | function           |
| <b>v</b>Variant    | variant types      |

-   Class names should use CamelCase, starting with an uppercase letter
-   HTML element IDs starting with `sap-ui-` are reserved for UI5.
-   DOM attribute names starting with `data-sap-ui-` as well as URL parameter names starting with `sap-` and `sap-ui-` are reserved for UI5.
    -   Currently used IDs:

| ID                       | Description                                        |
|--------------------------|----------------------------------------------------|
| `sap-ui-bootstrap`       | ID of the bootstrap script tag                     |
| `sap-ui-library-*`       | Prefix for UI libraries script tags                |
| `sap-ui-theme-*`         | Prefix for theme stylesheets link tags             |
| `sap-ui-highlightrect`   | ID of the highlight rect for controls in TestSuite |
| `sap-ui-blindlayer-*`    | ID for `BlockLayer`                                |
| `sap-ui-static`          | ID of the static popup area of UI5                 |
| `sap-ui-TraceWindowRoot` | ID of the `TraceWindowRoot`                        |
| `sap-ui-xmldata`         | ID of the `XML Data Island`                        |

### Creating Classes

| Implementation | Description |
|-------------|----------------|
| `this.bReady = false;`| Instance fields (members) should be initialized and described in the constructor function. If necessary
 remove them again in <code>MyClass.prototype.exit = function() { delete this.bReady; }</code> to prevent memory leaks |
| `this._bFinalized` | Private members should have a name starting with an underscore |
| `MyClass.prototype.doSomething = function(){...}` | Instance methods are defined as members of the prototype of the constructor function |
| `MyClass.doSomething = function(){...}` | Static members (fields and functions) are defined as members of the constructor function object itself |
| <code>MyClass.prototype.isOpen = function() { return true; }</code> | Members that return a Boolean value should be prefixed with `is`. An exception are Control properties for Boolean values. The Getters are prefixed with `get`.  |
| <code>MyClass.prototype.hasModel = function() { return !!this._oModel; }</code> | Members that check the content of an array, map, or object and return a Boolean value should be prefixed with `has` |
| <code>MyClass.prototype._onMetadataLoaded = function() {...}</code> | Members that are attached to an event and thus are used as event listeners should be prefixed with `on`. Since event listeners usually are used in a private manner they should be prefixed with a <code>_</code> as well. |
| <code>MyClass.prototype.metadataLoaded = function() { return new Promise({...}); }</code> | Members that return a <code>Promise</code> should be named with a verbal phrase in past tense that states what they do |
| <code>MyClass.prototype.setSomething = function() {... return this;}</code> | API methods with no return value should return `this` to enable method chaining |
| <code>SuperClass.extend(…)</code> | Subclasses should use this way to extend a class<br>If there is no base class, the prototype is automatically initialized by JavaScript as an empty object literal and must not be assigned manually. Consider inheriting from `sap.ui.base.Object` |
| `SuperClass.apply(this, arguments);` | Subclasses have to call (or apply) their parent's constructor |

-   Constructor + methods + statics are combined in a single JS source file named and located after the qualified name of the class (precondition for the class loading)
-   Static classes do not have a constructor but an object literal. There is no pattern for inheritance of such classes. If inheritance is needed, use a normal class and create a singleton in the class.

See the [example for creating a class (with documentation)](guidelines/classexample.md).

### Documentation (JSDoc)

For documenting JavaScript, UI5 uses the JSDoc3 toolkit which mimics JavaDoc. See the [JSDoc3 Toolkit Homepage](http://usejsdoc.org/) for an explanation of the available tags.

-   Document the constructor with `@class, @author, @since`, …
-   For subclasses, document the inheritance by using an `@extends` tag in their constructor doclet
-   Document at least public and protected methods with JSDoc, mark them as `@public`/`@protected`
    -   When you also document private methods with JSDoc, mark them with `@private` (this is currently the default in UI5, but not in JSDoc, so it is safer to explicitly specify it)
    -   "Protected" is not clearly defined in a JavaScript environment, in UI5 it means: not for use by applications, but might be used even outside the same class or subclasses, but only in closely related classes.
-   Document method parameters with type (in curly braces) and parameter name (in square brackets if optional)
-   For static helper classes that only provide static methods use `@namespace`

See the [example for creating a class with documentation](guidelines/classexample.md).

Also see the [list of common JSDoc pitfalls](guidelines/jsdocpitfalls.md).

UI5 Control Development Guidelines
----------------------------------

### General

-   Keep things simple! Keep the number of entities created for a new control minimal
-   Re-use is good, but not when it comes with a significant performance penalty. E.g. when a control needs a clickable area, implementing `onclick` and checking where the click came from is easy, comes with zero runtime weight and is hence usually better than instantiating and aggregating a Button control and using not much else than its "press" event. It is always a question how much functionality of the other control is actually needed.

### API

-   Get the API right the first time, you will not be able to change it later (compatibility)
-   Control names start with an uppercase letter and use CamelCase for concatenated words
-   Property, event, aggregation, association, method and parameter names start with a lowercase letter and also use CamelCase
-   Do not use hungarian notation for API parameters, as their type is documented in JSDoc
-   Provide a reasonable default value for properties
    -   Consider the most frequent use-case
    -   Let block elements "auto"-fill the available width instead of explicitly setting "100%" as default width
-   "editable" and "enabled" are two slightly different properties. "Not enabled" controls are not in the focus tab chain
-   In general, check similar controls for consistent naming and modeling of public APIs
    -   Controls for text input have a "value" property
    -   Container controls with one generic area for child controls have a 1..n "content" aggregation
        -   When the child controls are not generic, but have a specific semantics, arrangement or type, the name should be chosen accordingly ("items", "buttons",…)
    -   When there is one most important aggregation, it should be marked as default aggregation (easier usage in XMLViews)
-   Properties, associations and aggregations should be preferred to API methods due to data binding support and easier usage in XMLViews
-   Make sure not to break usage in XMLViews; e.g. types like sap.ui.core/object and sap.ui.core/any may not be used for mandatory properties
-   Be careful about initial dependencies. E.g. the Input control should not always load the table library just because some Inputs may show a value help table after certain user interaction

### Behavior

-   Do not use any hardcoded IDs! When creating internal sub-controls, their ID should be prefixed with `this.getId() + "-"`
-   Make sure not to break data binding
-   Do not make assumptions about how your control is used. It will be used in other ways
-   Do not use `oEvent.preventDefault()` or `oEvent.stopPropagation()` without a good reason and clear documentation why it is really required
-   Use the UI5 event handling methods when available instead of `jQuery.bind()`/`.on()`
    -   When you use jQuery.bind() or jQuery.on(), always unbind them again (e.g. in onBeforeRendering() and in exit()) and re-bind after rendering
-   Use CSS3 for animations, fall back to no animation for legacy browsers (few exceptions where the animation is important)
-   Do not forget that a control can be used multiple times in a page
-   Provide immediate feedback for user interaction
-   If an action takes a longer period of time, visualize this, e.g. by using a BusyIndicator

### Renderer

-   Produce clean, semantic HTML5, as compact as reasonably possible
-   Each control instance must have exactly one root HTML element and can have any HTML element structure below that
-   Unknown strings (e.g. values coming from string properties) need to be escaped before writing to HTML (to avoid security risks via XSS attacks)
    -   Use `RenderManager.writeEscaped(...)` or `jQuery.sap.encodeHTML(...)`
-   Container controls (like Panel, Page, as opposed to layout controls) with a generic "content" aggregation should render the children all directly next to each other with no additional HTML or layout applied
-   When images are needed, use the Icon Pool
-   Provide a sufficiently large touch area for interaction on touch devices (usually 3rem/48px)
-   When internal HTML elements of the control below the root element need an ID, construct the ID like this: `<control ID> + "-" + <someSuffix>`
-   The HTML should adhere to the basic XHTML rules; close all tags, enclose attribute values in quotes and do not use empty attributes without value
-   Avoid &lt;table&gt;-based layouts when there is no logical table
    -   If a table is used for layout, try to use `display:table` or even `table-layout:fixed` tables
-   `RenderManager.writeControlData()` must be called in the root HTML element of the control (to make events work)
-   `RenderManager.writeClasses()` must be called in the root HTML element of a control (otherwise `addStyleClass` does not work), but does *not* need to be used in sub-elements

### Themes/CSS

#### General

-   Write semicolons even where optional
-   In general, use "rem" for dimensions; use "px" only for dimensions that do not depend on the font size
-   The root element of a control should come without outer margins; add any required padding *inside*. Root margins are owned by the parent control
-   Do not hard-code any colors, use LESS parameters and color calculations instead; also recommended for other significant theme aspects like fonts and background images
-   Use other LESS features moderately (the more LESS processing happens, the less clear it is where the runtime CSS originates from)
-   Do not style any HTML element directly; all selectors must include a UI5-specific CSS class (to avoid affecting non-owned HTML)
-   Avoid the star selector (like: ` * { color: black;}`) in CSS, in particular without a "direct child" selector ("\>") in front of it (performance)
-   Only use inline CSS for control instance specific style (like the button width)
-   Do not use `!important` (makes custom adaptations harder), but use more specific selectors
    -   There are rare justified exceptions, but they need to be documented
-   Put browser-prefixed properties before the un-prefixed variant
-   When the visuals of certain controls are different depending on the context/container where they are used, use CSS cascades along with marker CSS classes in the parent control:
    -   The area/container shall write a certain marker CSS class to the HTML and document this CSS class in its JSDoc. The documentation should mention the purpose and contract/meaning of this class, e.g. that it is meant to modify the appearance of children in a way that better fits table cells, toolbars or headers.
    -   This CSS class may not have any CSS styles attached, it is a pure marker
    -   This CSS class has the suffix `-CTX` (e.g. `sapUiTable-CTX` or `sapUiBorderless-CTX`) to make it discernible from "normal" CSS class names
    -   Controls which want to modify their appearance in such an area use the marker class in a cascade: `.sapUiTable-CTX .sapUiInput { border: none; })`

#### Naming

-   All CSS classes must begin with the `sapUi` prefix (or `sapM` in the sap.m library)
    -   Exception: some global CSS classes used in the core start with `sap-`
-   For each control there must be one unique control-specific prefix for CSS classes
    -   E.g. `sapUiBtn` for a Button control, or `sapMITB` for an IconTabBar in the sap.m library
    -   This class must be written to the HTML root element of the control
    -   All CSS classes within the HTML of this control must append a suffix to this class name, e.g. `sapUiBtnInner`, or `sapMITBHeader`

#### Images

-   Themes (including "base") should only refer to existing images inside that theme
-   Images will be loaded relative to the theme where they are referenced (see LESS option "relativeUrls")
  - If an image url defined in base stays active in another theme 'mytheme', derived from base, LESS will calculate a relative URL that points from the mytheme/library.css to the base/library.css.
  - Similar path calculation is necessary when the URL is defined in another library (e.g. from sap/m/themes/mytheme/library.css to sap/ui/core/themes/base/image.png).
  - Last but not least, these URL transformations assume a single repository for all sources. When resources for different themes / libs are located in different libraries, such relative URLs might not work.
-   To override an image within the base theme an additional rule has to be added to the individual theme referencing the image. Otherwise the base image will be loaded.

#### LESS Theme Parameters

-   Use the correct theme parameter - do not find by color value, but by semantics. In general, let the visual designers give the correct parameter to use.
    -   If finding a color for a text, do not use any border or background color parameter. Start with `@sapUiText` and try to find something more specific like `@sapUiHeaderText`
    -   Use parameters like `@sapUiTextInverted` for bright-on-dark scenarios
    -   If no suitable parameter exists, derive the color by calculation from a suitable parameter
-   Do not add parameters to the public API (using annotations) without sufficient clarification with designers and Product Owners
-   If you create your own local parameters, you must ensure that the names you define are unique by using name(space) prefixes.
    -   For **control-specific** parameters in ```*.less``` files, use a combination of the library name and the ```*.less``` file name for the prefix. Start with an underscore. Separate each part of the library namespace and the file name from each other using underscores as well.
    -   **Tip**
    -   For example, you can define the following prefix:
    -   **Library:** ```sap.ui.core```
    -   **File:** ```sap/ui/core/themes/base/MyControl.less```
    -   **Prefix:** ```@_sap_ui_core_MyControl_```
    -   For **library-specific** parameters in ```library.source.less``` files, use the library name for the prefix. Start with an underscore. Separate each part of the library namespace from each other using underscores.
    -   **Tip**
    -   For example, you can define the following prefix:
    -   **Library:** ```sap.ui.core```
    -   **File:** ```sap/ui/core/themes/base/library.source.less```
    -   **Prefix:** ```@_sap_ui_core_```
    -   **Caution**
    -   Local parameters themselves must **not** contain underscores. For example, do not write ```@_sap_ui_core_MyControl_Some_Color```, but write ```@_sap_ui_core_MyControl_SomeColor``` instead.
-   When defining URLs as parameters use the proper `url()` format: ```@sapUiMyUrl: url(./path/to/img.png)```
    -   Do **NOT** use escaped strings (`~`): ~~@sapUiMyUrl: ~"path/to/img.png"~~
    -   Do **NOT** use absolute urls: ~~@sapUiMyUrl: url(/absolute/path/to/img.png)~~

Product Standards / Acceptance Criteria
---------------------------------------

UI5 needs to fulfill certain "product standards" and done criteria in order to be of high quality and usable in mission-critical business software. While these are not directly related to code conventions, the most important ones are mentioned here, because new code needs to fulfill these requirements:

General:

-   Browser support
-   Security (e.g. output encoding against XSS attacks)
-   Performance (not a yes/no question, but needs to be in focus)
-   Automated tests (qunit)
-   Proper API documentation
-   Translation: all texts visible in the UI must be translatable
    -   Do not provide translations, only provide the "developer english" version in messagebundle.properties, but annotate properly for translators, see [this page](guidelines/translationfiles.md) for details.
-   Follow the compatibility rules, as specified [here](https://openui5.hana.ondemand.com/docs/guide/91f087396f4d1014b6dd926db0e91070.html)
-   Make sure other Open Source libraries (or parts of them) are officially approved before adding them to UI5. Do not add code you "found" somewhere.

For controls in addition:

-   Screenreader support (ARIA)
-   Keyboard navigation support
-   Required themes (depending on library, but including "High Contrast Black" for accessibility)
-   Right-to-Left support
-   Example page in Demokit/Explored App

File Names and Encoding
-----------------------

Some of the target platforms of UI5 impose technical restrictions on the naming or structure of resources (files). Hence, these restrictions apply:

-   Folder names must not contain spaces (SAP HANA)
-   To avoid issues with the UI5 module loading and with URL handling in general, resource names also should not contain spaces
-   Single folder names must not be longer than 40 characters (ABAP)
-   Two resource names must not only differ in case (ABAP, some J2EE servers)
-   Avoid non-ASCII characters in resource names



# Git Guidelines
--------------

## Settings
Set the Git `core.autocrlf` configuration property to "false" (and make sure to use Unix-style linebreaks (LF-only))

## Commit Message
The commit message consists of two or three parts, separated by empty lines.

### Commit Summary
The commit summary is the first line of the commit message.
- It should be 50-70 characters long.
- Must be prefixed by `[FIX]` or `[FEATURE]` and should start with the control/component which was the main subject of the change
-   Instead of `[FIX]`/`[FEATURE]` and at any other location in the commit message `[INTERNAL]` can be used for commits/explanations which should not be part of the change log. If you add `[INTERNAL]` as only prefix to the commit message, the entire message won't be part of the change log. If you add this prefix to the middle of the message everything after this prefix will be ignored for the change log.
- Do not use any `[` or `]` within the summary but for the prefixes.

### Description
Describe the problem you fix with this change. Whether your patch is a one-line bug fix or 5000 lines of a new feature, there must be an underlying problem that motivated you to do this work. Make the necessity of the fix clear to the reviewers, so they will continue reading.

Describe the effect that this change has from a user's point of view. App crashes and lockups are pretty convincing for example, but not all bugs are that obvious and should be mentioned in the text. Even if the problem was spotted during code review, describe the impact you think it can have on users.

After that, describe the technical details of what you changed. It is important to describe the change in a most understandable way so the reviewer is able to verify that the code is behaving as you intend it to.

### Data Section
The data section consists of name-value pairs
-   `Fixes: https://github.com/SAP/openui5/issues/(issueNumber)` if the change fixes a GitHub-reported bug
-   `Closes: https://github.com/SAP/openui5/pull/(pullRequestNumber)` if the change comes from a pull request. This is usually added by the OpenUI5 committer handling the pull request
-   Further internal information - like `BCP` (for customer and internal messages reported at SAP and new internal bug reports), a mandatory `Change-Id` for Gerrit, and the `CR-Id` ("Change Request ID", mandatory for maintenance codelines) - is added by SAP developers if required
-   A commit message can thus look like this:

    ``` wiki
    [FIX] sap.m.Popover: scrolling is removed after Popover is rerendered

    - this was caused by the special treatment in dealing with rerendering
    in Popover.

    - Now the normal invalidation is used and Popup.js takes care of the
    focus/blur event listener in onBefore/AfterRerendering

    Change-Id: I3c7d6e4d52fa71e9412b729b7a234a112915c2a4
    Fixes: https://github.com/SAP/openui5/issues/1
    ```


Tools
-----

-   It is helpful to configure your JavaScript editor to display whitespace and linebreak characters; this makes issues with mixed tabs/spaces and windows-style linebreaks immediately obvious
-   It also helps to configure the code formatter of your code editor accordingly. The default formatter for JavaScript in Eclipse is already pretty ok.

### ESLint

UI5 comes with a ruleset for [ESLint](http://eslint.org/). Adhering to these rules is mandatory. You can find the complete list of rules and settings [here](eslint.md).
