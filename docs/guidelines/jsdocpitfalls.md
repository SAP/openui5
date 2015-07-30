JSDoc Common Pitfalls
=====================

There are some common pitfalls when using the JSDoc toolkit:

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
-   or at least avoid the double astersiks at the beginning. A very unnoticeable replacement might be the double quote ` /*"************/ `
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
     * @param {DomRow} &lt;TR&gt; dom object.
     * @returns {int} the row number maintained in the data object.
     */
    sap.ui.table.Table.prototype.getRowNumber = function(oDomRow) {
```