JSDoc Common Pitfalls
=====================

There are some common pitfalls when writing JSDoc comments:

Types
-----

A common source of errors in JSDoc comments are type references. When specifying the type of a member field,
a method parameter or return value or the type of a thrown error, JSDoc expects a specific syntax. Type 
references that violate those syntax rules lead to build time errors and/or the type references might be broken
or at least not represented as hyperlinks in the SDK. 

Additionally, UI5 came up with a convention how some basic types should be named in the documentation. 
The following table gives an overview about the most important syntax rules and conventions:  

Type String | Category | Description
----------- | -------- | -----------
*SomeType* | Syntax | Type names that consist of a single token usually denote built-in types, like `Window` or `Promise`
*some.qualified.Type* | Syntax | names that consist of a dot-separated sequence of tokens usually represent global names. UI5 currently uses such names for all its classes
*oneType* `\|` *otherType* | Syntax | a sequence of types separated by a single pipe symbol denotes alternative types (a union type)
*someType*`[]` | Syntax | a type followed by a pair of square brackets denotes an array of *someType* values
*someType*`[][]` | Syntax | multi-dimensional arrays are represented by a corresponding number of square-bracket pairs
`Array<`*someType*`>` | Syntax | alternative representation of an array type, can be nested for multiple dimensions. In UI5 documentation, the syntax with square brackets is preferred. But the Array<*someType*> syntax can be used when *someType* is already a complex type, e.g. a union type
`Object<`*keyType*`,`*valueType*`>` | Syntax | For Objects, the key and value types can be specified. Note that the key type is purely informational. JavaScript always converts key values to strings.
`Promise<`*fulfillmentType*`>` | Syntax | a promise that fulfills with a value of the given type
`{`*prop1*`:`*type1*`, ... }` | Syntax | a structured type: an object with a well defined set of properties, each of a specific type. Note that the pair of curly braces is an additional pair, e.g. `@param {{doc:string, type:string}} oInfo an object with a doc and a type property both of type string`
`string` | UI5 Convention | a simple JavaScript string
`int` | UI5 Convention | a JavaScript number which is not expected to have decimals. `ìnt` is not really a JavaScript built-in type, but in UI5 we decided to document integer values with this type, for clarity. BTW: the name is also inspired by TypeScript.
`float` | UI5 Convention | a JavaScript number
`boolean` | UI5 Convention | a JavaScript boolean (`true` or `false`)
`object` | UI5 Convention | a plain JavaScript object (an object constructed as `new Object()` or `{prop1:value1, prop2:value2, ...}`)
`any` | UI5 Convention | any JavaScript value (primitive or object), alternatively, an asterisk '*' can be used
`RegExp` | UI5 Convention | regular expression
`HTMLElement`| UI5 Convention | Standardized Web APIs should be referenced by their official name (e.g. as documented on mozilla.org - MDN) 

:bomb: Typical errors: 
 * `int || object` - double pipe instead of single pipe when documenting alternative types (a union type)
 * `[any]` - defining array types by enclosing the type name in square brackets (instead of appending them)
 * `*[]` - JSDoc doesn't allow the usage of * with square brackets, either use `Array<*>` or `any[]` 
 * `Object<key:int,value:string>` - mixture of the Object<key,value> syntax with the structured type syntax
 * `int | <code>sap.ui.base.Object</code> or null` - use of HTML tags or prosa in type references
 * `integer` or `Bool` - using other than the suggested type names for `int` and `boolean`
 * `Object` (upper case 'O') - this is indeed a valid type, but by convention it should be used only when it is not meant to be a plain object but some instance deriving from class Object.
 * `String` (upper case 'S') - also a valid type, but by convention it should be used only when it should refer to the object wrapper for a primitive `string` 



Syntax for Optional Parameters
------------------------------

To document a method parameter as optional, you should not add a text "(optional)" or similar, but instead enclose the name of the parameter in square brackets: 

```js
    /**
     * Triggers rerendering of this element and its children.
     * ...
     * @param {sap.ui.base.ManagedObject} [oOrigin] Child control for which the method was called
     * @protected
     */
    Control.prototype.invalidate = function(oOrigin) {
    ...
```
:bomb: Typical errors: 
 * `@param {[int]} index` often, square brackets are put around the type name instead of around the parameter name



Cross-References using a {@link} tag
------------------------------------

When using the @link tag, the JSDoc toolkit basically allows any kind of target reference. The only restriction is that the first whitespace
character or pipe symbol separates the cross reference from an optional caption text. 

The UI5 tooling and the SDK however support only a more limited set of cross references. In UI5 documentation, the target must be one of the following

Example | Description
------- | -----------
`{@link #localMethod}` | the name of an instance method or property of the current class
`{@link #.staticMethod}` | the name of a static method or property of the current class or namespace
`{@link some.Class#method}` | the name of an instance method or property in the specified class, class name must be fully qualified
`{@link some.ObjectOrClass.staticMethod}` | the name of a static method or property in the specified class, class name must be fully qualified
`{@link topic:*guid*}` | a topic in the developer guide (identified by the GUID of the topic)
`{@link https://...}` | a standard URL using the https:// or http:// protocol

In any case, a text (caption) can be added within the curly braces, separated from the reference by a whitespace.
That text will be used as text of the hyperlink in the SDK.

:bomb: Typical errors: 
 * `{@link Button#attachPress}` using an unqualified name instead of the qualified one (correct: `sap.m.Button#attachPress`)
 * `{@link #attachPress|attach a listener to the press event}` using the pipe symbol to separate caption and reference. JSDoc supports this, but UI5 tooling doesn't (not yet)
 

Static Classes
---------------
In the older version 2 of the JSDoc toolkit, helper classes could be marked with the tags `@class` and `@static` to identify them 
as static classes (classes without instances). JSDoc3 no longer supports this, the `@static` tag always describes the relationship between 
a symbol and its enclosing symbol, but not the nature of the symbol itself (class with instances or without instances).
Therefore, such static helpers should be described with  
```js
  /*
   * Some description here.
   *
   * @namespace qualified.name.of.the.namespace
   */ 
```
instead of using `@class` and `@static`. Note that control renderers are another typical use case for this pattern.



Multiple Doc Comments before a Symbol
-------------------------------------

If there are multiple doc comments before a JavaScript symbol, JSDoc will only associate the last one with the symbol. Therefore multiple doc comments before a symbol must be avoided. The following comment and code sequence will result in an unwanted documentation for symbol `adjustFilters`:
```js
    /**
     * Maps the UI filter objects to the internal Filter object.
     *
     * @param {string[]} filteredColumns The current UI filters that will be mapped to the internal format.
     * @returns {string} The newly formatted format.
     * @private
     */
    /** TODO: Call getOperator when custom filters are supported */
    /** TODO: getValue2 to fix later when we have ranges with BETWEEN operator */
    sap.ui.table.internal.BehaviorManager.prototype.adjustFilters = function(filteredColumns) {
      // ...
    }
```
The safest way to avoid such issues is to avoid multiple doc comments before a symbol. Move the TODOs within the function or before the doc comment.

Special Case: Section separators
--------------------------------

JSDoc interprets any multiline comment which starts with a double asterisks (` /** `) as a documentation comment for the subsequent JavaScript symbol. But some developers like to use some kind of decorative comment to separate sections in their JavaScript modules and using a multiline comment consisting of asterisks is just one such decorative comment:
```js
      // Update aggregation
      this.insertSection(oSection, iTargetIndex, true);

      /****Update index/id mapping table********************************/
      aSections = this.getSections();
      for (var i = 0; i < aSections.length; i++) {
        this.aIdMappings[aSections[i].getId()] = i;
      }
```
Unfortunately, for JSDoc this looks like a doc comment for the aSections variable. And if this is the last doc comment for aSections, it will appear in the finally generated JSDoc for the enclosing module or class.

The only way to avoid such nonsense documentation is to avoid the pairing of multiline doc comments and symbols to be documented. So

-   don’t use stars/asterisks for a separating banner comment. You might use some other characters, e.g. ` /* ==== */ ` or ` /* ----- */ `
-   or at least avoid the double asterisks at the beginning. A very unnoticeable replacement might be the double quote ` /*"************/ `
-   as only the last doc comment before a symbol is used, another very good way to avoid misinterpretation of banner comments is to document the following symbol

HTML tags in Doc comments
-------------------------

JSDoc explicitly allows HTML tags in doc comments. This allows - as in JavaDoc - to structure longer or more complex documentation comments with the help of some HTML markup. Typical use cases are ordered/unordered lists or semantic tags like &lt;code&gt; or &lt;em&gt;.

But be aware that the support for HTML tags for formatting purposes unfortunately implies that JSDoc must not escape them!

So if you want to use include an HTML ***literally*** (e.g. to explain what kind of HTML is produced by a control), then that HTML tag must be HTML-escaped in the source code, otherwise it will not be displayed, but interpreted as markup.

Example (note the escaped &lt;TR&gt; in the first and third line of the doc comment):
```js
    /**
     * This function returns the rowNumber given a row&lt;TR&gt;.
     *
     * @private
     * @param {HTMLTableRowElement} oDomRow &lt;TR&gt; DOM object.
     * @returns {int} the row number maintained in the data object.
     */
    sap.ui.table.Table.prototype.getRowNumber = function(oDomRow) {
```