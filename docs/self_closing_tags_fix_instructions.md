# jQuery self-closing tag fix
UI5 uses a custom variant of jQuery (currently fixed to Version 2.2.3), which is maintained by SAP.
The internal `htmlPrefilter()` method of jQuery used to replace self-closing HTML tags (e.g. `<div/>`) with properly closed HTML elements (e.g. `<div></div>`).

Since jQuery 3.5.0, this replacement is no longer done. Instead, the browser will automatically close the self-closing HTML element based on the
DOM hierarchy, which could very likely occur at the wrong place. The custom jQuery variant used in UI5 also implements this change,
because self-closing HTML tags for non-void HTML elements are not valid in HTML5. This change is incompatible and may require adaptations
of code relying on that feature.

Please use the following instructions to identify and fix any affected application or library code:

## Part 1: Check if there is an impact on your application or library code
The related jQuery fix may cause incompatibilities in libraries and custom application code when working with HTML directly.
The following examples should help developers to check whether such code is used. Note that this could apply to either static HTML
or dynamic HTML provided by a database or file.

### Custom Control Renderers
Any custom UI5 Controls you use will most likely modify HTML.

Custom Controls derive from `sap.ui.core.Control` and have a `renderer` method or object, for example:

```javascript
sap.ui.define(["sap/ui/core/Control"], function (Control) {
   return Control.extend("sap.ui.myApp.control.MyCustomControl", {
        renderer : function (oRM, oControl) {
            // HTML modifications, for example:

            // This self-closing HTML tag needs to be replaced:
            oRM.write("<div/>");

            // with an additional closing HTML tag:
            oRM.write("<div></div>");
        }
   });
});
```

Instead of the `renderer` method, they can have an own renderer file which is a dependency of the actual control, for example:
```
webapp/control/MyCustomControl.js
webapp/control/MyCustomControlRenderer.js
```

### HTML Control
The [sap.ui.core.HTML](https://sdk.openui5.org/api/sap.ui.core.HTML) control of UI5 embeds standard HTML into the UI5 control tree. HTML content is passed to the control via its `content` attribute, either as a value in the XML view / constructor or via a binding. The elements of this HTML content need to be properly closed in all cases.

Usages of HTML controls can be found in JavaScript source files (typical extension `js`) as well as in XML views, fragments and composite controls (typical extensions `view.xml`, `fragment.xml`, `control.xml`).

### jQuery API usage
The code deals with HTML when using the DOM part of the jQuery API, for example:
- `$("<div/><span/>")`
- `jQuery("<a/><p/>")`

### Indirect jQuery API usage
It may also be possible that the jQuery API is used indirectly:
- `sap.ui.core.Element.prototype.$()`

Usages of the jQuery API can be found in JavaScript source files (typical extension `js`) as well as in HTML files (typical extensions `html` / `htm`) with inline script.

Please note that this is not about other areas of the jQuery API, such as AJAX calls, and also not about the SAP extensions `jQuery.sap.*`.

## Part 2: The application or library may have self-closing tags which need to be fixed
Custom application code (as mentioned in **Part 1**) needs to be checked for the closing part of a self-closing HTML element: `/>`

Most (normal) HTML elements need to be closed with a separate end tag. Declaring them as self-closing is basically an error in HTML5,
but the browsers ignore it. The following HTML tags need to be closed properly:

```
a|abbr|address|article|aside|audio|b|bdi|bdo|blockquote|body|button|canvas|caption|cite|code|colgroup|
data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|fieldset|figcaption|figure|footer|form|h1|h2|h3|
h4|h5|h6|head|header|hgroup|html|i|iframe|ins|kbd|label|legend|li|main|map|mark|menu|meter|nav|
noscript|object|ol|optgroup|option|output|p|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|
select|slot|small|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|
thead|time|title|tr|u|ul|var|video
```

This also applies to custom HTML elements, which can’t be listed here!

Here is an example for a (normal) non-void HTML element:

Before:
```html
<div style="clear:both"/>
```

After:
```html
<div style="clear:both"></div>
```

For void elements no end tags are allowed. They can stay self-closing in HTML5 and do not have to be changed:
```
area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr
```

Please note that there is no need to change XML content. This includes the XML content of SVG and MathML as well as the `<svg>` and the `<math>` elements themselves.
Of course, this also includes UI5 XML views, fragments and composite controls - even if there is [embedded native HTML](https://sdk.openui5.org/topic/be54950cae1041f59d4aa97a6bade2d8)
in them. Some HTML elements share their name with UI5 controls. For example, there is a native `label` HTML element and a [sap.m.Label](https://sdk.openui5.org/api/sap.m.Label) UI5 control.
If `sap.m` is the default namespace in an XML view, the `sap.m.Label` element will appear as Label in this XML view. However, there is no need to change the self-closing of such XML tags.

Please also note that if a [sap.ui.core.HTML](https://sdk.openui5.org/api/sap.ui.core.HTML) control is used inside an XML view or fragment, its content property has to be checked!

## Testing
We have added a test mode to UI5 which logs an error to the console and shows a popup (or a native alert) in the browser after a short delay to ensure it is not missed in any manual testing.

Add the URL Parameter `sap-ui-xx-self-closing-check=true` to enable the test mode. For example: `https://some-url/index.html?sap-ui-xx-self-closing-check=true`

Please check the browser console logs for the following error:
```
jQuery incompatibility: non-void HTML tags must not use self-closing syntax.
```

Full example of the console error:
```
jQuery incompatibility: non-void HTML tags must not use self-closing syntax.
HTML element used as self-closing tag: <div/>
HTML element should be closed correctly, such as: <div></div>
Please check the following note for more information:
https://launchpad.support.sap.com/#/notes/2944336 or
https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md
```

**Please note that the usage of this test mode is only intended for test or development systems! The test mode does not replace the manual code review!**