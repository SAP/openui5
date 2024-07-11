# JSDoc Guidelines

Provides an overview of guidelines for creating JSDoc documentation.

To document JavaScript coding, you can add documentation comments to the code. Based on these comments, the descriptions of the OpenUI5 entities are generated and shown in the *API Reference* of the Demo Kit. OpenUI5 uses the JSDoc4 toolkit, which resembles JavaDoc, to generate the descriptions. For an explanation of the available tags, see [https://jsdoc.app](https://jsdoc.app).

## Basics of JSDoc

Here are some general principles for writing comments:

- Document the constructor with `@class`, `@author`, `@since`, and so on.

- For subclasses, document the inheritance by using an `@extends` tag in their constructor doclet.

- Document the visibility level of your methods according to section [Visibility Levels](#visibility-levels). Document at least public and protected methods with JSDoc; mark them as `@public` or `@protected`.

- Document method parameters with type (in curly braces) and parameter name (in square brackets if optional)

- For static helper classes that only provide static methods use `@namespace`

For an example of how to create a class, see [Example for Defining a Class](classexample.md).

Also see the [list of common JSDoc pitfalls](guidelines/jsdocpitfalls.md).
## Descriptions

A documentation comment should provide the following content:

- Summary sentence at the beginning; the summary is reused, for example, for tooltips and in summaries in the *API Reference*

- Background information required to understand the object

- Special considerations that apply

- Detailed description with additional information that does not repeat the self-explanatory API name or summary

> **Note**:  
> Avoid implementation details and dependencies unless they are important for usage.

### Dos and Don'ts

- To avoid line wrapping, make sure that each line of the description has a similar length as the code. In the *API Reference*, the line breaks in a description are ignored, and it appears as a continuous text.

- Use a period at the end of each summary sentence. The punctuation is required for JSDoc to identify the first sentence.

- Don’t use a period inside a summary sentence. For example, don’t use “e.g.”, but write “for example” instead. Otherwise the summary sentence will be cut off.

> **Note**:  
> You can create links to external sources. The source should comply with standard legal requirements. The OpenUI5 SDK adds an icon before the external link, as required and described in [Terms of Use](https://www.sap.com/corporate/en/legal/terms-of-use.html). For more information about creating links, see the explanations below \(@see and \{@link\}\).

### Recommendations for Writing Descriptions

- Don’t use exclamation marks.

- Make sure you spell acronyms correctly, for example, ID, JSON, URL.

- In the summary sentence, omit repetitive clauses like "This class" or "This method".

- For objects, use a noun phrase. Example: Base class for navigation

- For actions, start directly with an appropriate verb in the third person: Adds, allocates, constructs, converts, deallocates, destroys, gets, provides, reads, removes, represents, returns, sets, saves, and so on.

- For methods, use the following verbs:

| Type | Verb |
| ---- | ---- |
| Constructor | Constructs |
| Boolean | Indicates (whether) |
| Getter | Gets |
| Setter | Sets |
| Other | Adds/Removes/Creates/Releases/Other verb that applies |

For more information about descriptions, see the general standards and guidelines for API documentation [Documentation Comments / Description](https://github.com/SAP-docs/api-style-guide/blob/main/docs/40-java-javascript-and-msnet/description-33a5538.md).

## Inline and HTML Tags

You can use inline and HTML tags in your comments.

**Inline tags** can be placed anywhere in the comments. Inline tags are denoted by curly brackets and have the following syntax: \{@tagname comment\}.

**HTML tags** are used to format documentation comments. HTML tags have the standard HTML syntax: <tag\>...</tag\>.

The table provides an overview of the most common inline and HTML tags.

| Tag | Use | Example | How to Use / Details | Type of Tag |
| --- | --- | ------- | -------------------- | ----------- |
| `{@link}` | Links within API Reference | `{@link sap.ui.generic.app.navigation.service.NavError Error}` </br> `{@link sap.ui.comp.smarttable.SmartTable#event:beforeRebindTable}` | To replace the path with a display text, use it like this: `{@link <path> space <display text>}`. You can also use `#myMethod` for links within a class or control to individual methods, for example. The leading hash will then be removed automatically. For other links, use the required syntax, for example, `#event:name`. | Inline |
| Empty line | Creates a paragraph | | Using `<p>` is not necessary, since empty lines are used to define paragraphs. | HTML |
| `<code>…</code>` | Technical entities (optional) | `the <code>Button</code> control` | | HTML |
| `<pre>…</pre>` | Code samples | | | HTML |
| <pre>`<ul>`</br>`<li>…</li>`</br>`<li>…</li>`</br>`</ul>`</pre> | Unordered lists | | | HTML |
| <pre>`<ol>`</br>`<li>…</li>`</br>`<li>…</li>`</br>`</ol>`</pre> | Ordered lists | | | HTML |
| `<strong>…</strong>` or `<b>…</b>` | Bold font | | | HTML |
| `<i>…</i>` | Italics | | | HTML |
| `&nbsp;` | Non-breaking space | | | HTML |

## Block Tags

You can also use block tags in your comments.

**Block tags** can only be placed in the tag section below the description. They are separated from the description by an empty line \(recommended, but not a technical requirement\). Block tags have the following syntax: @tagname content.

The table provides an overview of the most common block tags.

| Tag | Use | Example | How to Use / Details |
| --- | --- | ------- | -------------------- |
| `@param` | Adds parameters | `@param {string} statement The SQL statement to be prepared` | Begin description with a capital letter. |
| `@returns` | Adds return values | `@returns {type1\|type2\|...} Description` | Begin description with a capital letter. |
| `@throws` | Adds the description of an exception if an error occurs | `@throws {type} Description` | Begin description with a capital letter. |
| `@author` | Adds the name of the developer responsible for the code | `@author Max Mustermann` | This is an optional tag that is not displayed in JSDoc. If you need to use the version tag, use ${version} so you don't have to update this manually for each new version. |
| `@version` | Names the version for an entity | `@version 14.1.2` | This is an optional tag that is not displayed in JSDoc. Use ${version} so you don't have to update this manually for each new version. |
| `@see` | Adds information (for example, link to documentation or the SAP Fiori Design Guidelines) in the header section of the **API Reference** | `@see path`</br> `@see free text`</br> `@see {@link topic:bed8274140d04fc0b9bcb2db42d8bac2 Smart Table}`</br> `@see {@link fiori:/flexible-column-layout/ Flexible Column Layout}` | `@see {@link topic:loio <semantic control name>}` provides a link to the documentation (developer guide). If there are several `@see` tags with documentation links, only the first one is shown in the header. The other ones are displayed under *Documentation Links* in the *Overview* section. For more generic topics that are not directly related to a class or control, use inline links. |
| `@since` | Adds the version in which an entity was first introduced | `@since 1.30` | Be as specific as possible (without mentioning patch levels for new development), since this information is useful even for internal purposes. For example, mention 1.27, even though this is not an external release. |
| `@deprecated` | Adds the version in which an entity was deprecated | `@deprecated As of version 1.28, replaced by {@link class name}.`</br>**or**</br>`@deprecated As of version 1.28, the concept has been discarded.`</br>**or**</br>`@deprecated As of version 1.28 with no replacement.` | Be as specific as possible (without mentioning patch levels) since this information is useful even for internal purposes. Indicate either what replaces the deprecated entity or mention that the concept has been discarded. |
| `@experimental` | Classifies an entity that is not ready for production use yet, but available for testing purposes | `@experimental As of version 1.56` | The example provides the following output: **Experimental API since 1.56** Hence, no separate `@since` tag is required. Similar to deprecations, the patch level usually should be omitted.|
| `@example` | Inserts a code sample after the comment | <pre>/**</br>* ...</br>* @example</br>* var id = myjob.schedules.add({</br>* description: "Added at runtime, run every 10 minutes",</br>* xscron: "* * * * * *\/10 0",</br>* parameter: {</br>* a: "c"</pre> | The code sample is inserted automatically with `<pre>`. It is always inserted right after the comment. To insert an example somewhere else, for example, in the middle of a comment, use `<pre>`. You can add a header for the example by using `<caption>`.|

### Tips for Using Block Tags

- The order of the block tags is not mandatory from a technical perspective, but recommended to ensure consistency.
  For parameters, however, a fixed order is mandatory.
- There are more tags available, such as `@class`or `@name`.

For more information about tags, see the general standards and guidelines for API documentation under [Java and JavaScript Tags](https://github.com/SAP-docs/api-style-guide/blob/main/docs/40-java-javascript-and-msnet/java-and-javascript-tags-6d32db8.md).

## Links to API Documentation

To refer to another entity within the **API Reference**, you can use `{@link}` in combination with the reference types shown in the table below.

| Type of Reference | Description | Example | Comment |
| ----------------- | ----------- | ------- | ------- |
| `full.path.ClassName` | Refers to a class, interface, enumeration, or namespace that has a global name | `{@link sap.ui.comp.smarttable.SmartTable}` | |
| `full.path.ClassName#method` | Refers to an instance method of a class | `{@link sap.ui.comp.smarttable.SmartTable#getHeader}` | `.prototype.` and `#` are interchangeable |
| `full.path.ClassName.prototype.method` | Refers to an instance method of a class | | |
| `full.path.ClassName.method` | Refers to a static method (or any other static property) | | |
| `module:full/module/name#method` | Refers to an instance method from a class that does not expose a global name | | |
| `module:full/module/name.method` | Refers to a static method from a module that does not expose a global name | | |
| `#method` | Refers to an instance method **within** a class | `#getHeader` | You must use this type of reference **within** an API that you are documenting, for example, within the SmartTable control documentation, if you want to link to a method that belongs to the control itself. |
| `#.method` | Refers to a static method **within** a class | | |
| `full.path.ClassName#event:name` | Refers to an event fired by an instance of a class | `sap.ui.comp.smarttable.SmartTable#event:beforeRebindTable` | |
| `#event:name` | Refers to an event **within** a class | | |
| `full.path.ClassName#annotation:name` | Refers to an instance annotation of a class | | |
| `#annotation:name` | Refers to an annotation **within** a class | | |

## Visibility Levels

Tags such as `@public` or `@private` allow you to control the visibility of the JSDoc documentation.

You can select from several block tags to determine if and how the JSDoc documentation for your API is displayed in the *API Reference*. The tag you choose also affects API usage and compatibility, namely

-   whether your API is meant to be used in application development or OpenUI5 framework development,
-   whether you have to keep your API compatible. For more information, see [Compatibility Rules](https://sdk.openui5.org/topic/91f087396f4d1014b6dd926db0e91070).

The following table gives an overview over the available tags:

**Tags for Visibility**

| Tag          | Description | Compatibility Required | Can be used by applications | Further Details | Example |
| ------------ | ----------- | ---------------------- | --------------------------- | --------------- | ------- |
| `@public`    | Indicates that the API, such as a class or method, is generally available for application developers. | 🟢 | 🟢 | | [`ManagedObject.prototype.getId`](https://github.com/SAP/openui5/blob/c67c74d5de985904b50fb250b0d335c08b275025/src/sap.ui.core/src/sap/ui/base/ManagedObject.js#L1266) |
| `@protected` | Indicates that usage of the API is restricted. It is not meant to be used by applications. | 🟢  | 🔴 | The API might be used outside the relevant class or subclasses, but only in closely related classes (so called "friends") in OpenUI5 framework development. Currently, there is no way to document "friends" properly in the UI5 *API Reference*. | [`Control.prototype.invalidate`](https://github.com/SAP/openui5/blob/c67c74d5de985904b50fb250b0d335c08b275025/src/sap.ui.core/src/sap/ui/core/Control.js#L323) |
| `@private` | Indicates that the API is not meant for use outside of OpenUI5 framework development. It won't be visible in the OpenUI5 documentation. <p><blockquote><h3>Note:</h3>If you also document private methods with JSDoc, mark them as `@private`. This is currently the default in OpenUI5, but not in JSDoc, so it is safer to explicitly specify this.</blockquote></p> | 🔴 | 🔴 | The API is not meant to be used outside its own class, module, package, or library. We recommend to use the underscore character "`_`" as a prefix for technical names of private entities. | [`Icon.prototype._getOutputTitle`](https://github.com/SAP/openui5/blob/c67c74d5de985904b50fb250b0d335c08b275025/src/sap.ui.core/src/sap/ui/core/Icon.js#L477) |
| `@ui5-restricted` | Indicates that the API is only meant for certain stakeholders within OpenUI5 framework development and won't be visible in the OpenUI5 documentation. <p><blockquote><h3>Note:</h3>`@ui5-restricted` should always be preceded by `@private`. This is to make sure that content isn't accidentally made public if an external JSDoc generator is used that doesn't recognize this tag.</blockquote></p> | 🔴 | 🔴 | To specify the stakeholders that are allowed to use this API, insert a comma-separated list of stakeholders after the tag, typically package names like `sap.ui.core`, like this: <p> `@ui5-restricted package_name_1, package_name_2` You can also add free text. </p> | `@ui5-restricted sap.ui.core, sap.m, sap.viz` in [`Control.prototype.setBlocked`](https://github.com/SAP/openui5/blob/c67c74d5de985904b50fb250b0d335c08b275025/src/sap.ui.core/src/sap/ui/core/Control.js#L944) |
| `@sap-restricted`| Deprecated, replaced by `@ui5-restricted` | 🔴 | 🔴 | | |

1) There’s no compatibility promise for `ui5-restricted` APIs. However, before introducing incompatible changes the owner is expected to announce them to the listed stakeholders, so that all affected parties can cooperate to achieve a smooth migration.
2) Any potential new usage should be discussed with the owner first, then the stakeholder information should be updated, and only then should the API be used.

If more than one of the above tags is used, the last one wins.

> **Note**:
> The OpenUI5 *API Reference* only includes APIs of categories `@public` and `@protected`.
