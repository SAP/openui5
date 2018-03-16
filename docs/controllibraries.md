Developing Content for UI5
=============================

1.  [Control Libraries](#control-libraries)
    1.  [File Structure](#file-structure)
    2.  [The .library file](#the-library-file)
    3.  [library.js file](#libraryjs-file)
    4.  [Translation file (messagebundle.properties) and translation](#translation-file-messagebundleproperties-and-translation)
    5.  [Themes (library.source.less, shared.css, img, img-RTL)](#themes-librarysourceless-sharedcss-img-img-rtl)

2.  [Developing a Control inside a Library](#developing-a-control-inside-a-library)
    1.  [The Control API and Behavior](#the-control-api-and-behavior)
    2.  [The Control Renderer](#the-control-renderer)
    3.  [Control CSS/LESS files](#control-cssless-files)
    4.  [Right-to-Left Support](#right-to-left-support)
    5.  [Test Pages](#test-pages)
    6.  [QUnit Tests](#qunit-tests)
    

Control Libraries
-----------------

Control libraries are logical packages of UI5 controls. Only controls developed in libraries can make use of the build tools provided by UI5.

### File Structure

This diagram depicts the complete folder structure of a library named "some.lib" containing one control named "SomeControl" (so the full control name is "some.lib.SomeControl"):

``` wiki
some.lib/
+---src/
|   +---some/
|       +---lib/
|           +---themes/
|               +---base/
|                   +---img/
|                       img-RTL/
|                       library.source.less
|                       SomeControl.less
|                   sap_bluecrystal/
|                   +---img/
|                       img-RTL/
|                       library.source.less
|                       SomeControl.less
|           .library
|           library.js
|           messagebundle.properties
|           messagebundle_<any-locale>.properties
|           SomeControl.js
|           SomeControlRenderer.js
+---test/
    +---some/
        +---lib/
            +---SomeControl.html
                qunit/
                +---testsuite.qunit.html
                    SomeControl.qunit.html
                visual/
                +---visual.suite.js
                    SomeControl.spec.js
```

At runtime (and after the Grunt build) all libraries are merged into one directory tree, but during development libraries are separated, hence the duplication of the library name, once as folder containing the complete library and twice inside as folder structure for the runtime sources as well as for the test pages.

Below the "themes" folder, there is one directory for each supported theme, with sub-folders for image resources if required (including the right-to-left version). Inside the folders for the themes, there can be any CSS files. The convention is to have one CSS file per control and one "shared.css" file for styles that are not specific to one control, but rather valid for the entire library. The library.source.less files are responsible for making LESS aware of all files that should be combined and how parts of the theme are connected. All CSS files should reside at the same directory level to avoid changing image paths when they are combined to one file in the build step.
 Note: themes can also be in separate theme libraries. For the standard UI5 controls sap\_bluecrystal and sap\_belize are such separate theme libraries. Their internal file structure is identical to control libraries, but when they support several control libraries, all their paths are contained.

The main implementation folder (src/some/lib) contains the implementation of controls and their renderers (they are typically separate when developed in control libraries and resolved by naming convention), the message bundles (translation texts), any other JavaScript files (may be in sub-folders) and two central library files: `.library` contains metadata and `library.js` contains the library declaration, the control list, and any library-level JavaScript.

Finally, below `test/some/lib` there are any test pages for manual testing and pages used during development, and - in the `qunit` sub-folder - the automated unit tests.

### The .library file

The `.library` file is an XML file describing the library and its dependencies, as well as other information required at build time, e.g. related to tests, test coverage and documentation resources. This file is not used by the UI5 runtime (but in the SDK/Demokit for finding the file `docuindex.json` to collect documentation pages).

This is one example file from an existing library:
``` xml
<?xml version="1.0" encoding="UTF-8" ?>
<library xmlns="http://www.sap.com/sap.ui.library.xsd" >

  <name>sap.ui.unified</name>
  <vendor>SAP SE</vendor>
  <copyright>${copyright}</copyright>
  <version>${version}</version>
  
  <documentation>Unified controls intended for both, mobile and desktop scenarios</documentation>
  
  <dependencies>
	<dependency>
	  <libraryName>sap.ui.core</libraryName>
	</dependency>
  </dependencies>
  
  <appData>
	<selenium xmlns="http://www.sap.com/ui5/buildext/selenium" package="com.sap.ui5.selenium.unified" />
	<!-- excludes for the JSCoverage -->
	<jscoverage xmlns="http://www.sap.com/ui5/buildext/jscoverage" >
	  <exclude name="sap.ui.unified.js." />
	</jscoverage>
	<documentation xmlns="http://www.sap.com/ui5/buildext/documentation"
		indexUrl="../../../../test-resources/sap/ui/unified/demokit/docuindex.json"
		resolve="lib" />
  </appData>

</library>
```

### library.js file

The `library.js` file is a central file for each control library that contains the library declaration and any enums, simple types and interfaces present in the library. There can also be additional code and the definition of lazy loading stubs for non-controls.

The most important feature in this file from the perspective of a control developer is the list of controls maintained in the library declaration: all controls must be added there in order to make their constructors available immediately when the library is loaded (so applications only need to require the library, not each control).

One example `library.js` file of a small control library, the `sap.ui.suite` library. It contains two controls (`sap.ui.suite.TaskCircle` and `sap.ui.suite.VerticalProgressIndicator`) and one enum (`sap.ui.suite.TaskCircleColor`). Also note the usage of JSDoc to create the API documentation:
```js
/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(['jquery.sap.global', 
	'sap/ui/core/library'], // library dependency
	function(jQuery) {

	"use strict";

	/**
	 * Suite controls library.
	 *
	 * @namespace
	 * @name sap.ui.suite
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.suite",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.suite.TaskCircleColor"
		],
		interfaces: [],
		controls: [
			"sap.ui.suite.TaskCircle",
			"sap.ui.suite.VerticalProgressIndicator"
		],
		elements: []
	});
	
	
	/**
	 * Defined color values for the Task Circle Control
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.suite.TaskCircleColor = {
	
		/**
		 * Red
		 * @public
		 */
		Red : "Red",
	
		/**
		 * Yellow
		 * @public
		 */
		Yellow : "Yellow",
	
		/**
		 * Green
		 * @public
		 */
		Green : "Green",
	
		/**
		 * Default value
		 * @public
		 */
		Gray : "Gray"
	
	};

	return sap.ui.suite;

}, /* bExport= */ false);
```

### Translation file (messagebundle.properties) and translation

The `messagebundle.properties` file contains all translatable texts used by controls as key-value pairs, with annotations making translator's life easier. Example:

``` wiki
#XACT: ARIA keyboard announcement for standard steps in the Roadmap control ({0} is the label text given by the application)
RDMP_ARIA_STANDARD_STEP={0} To select or deselect, press SPACEBAR
```

In the original UI5 libraries SAP's translation department automatically translates any new texts to almost 40 languages for each release. In custom control libraries the library developer needs to create the `messagebundle_<locale>.properties` file for each supported locale and provide the translation. Locales can be toplevel ones like "en" or two-level ones like "en\_US". UI5 automatically finds the best-suitable language at runtime.

Note the following deviations from the ISO codes, caused by legacy reasons (e.g. by Java):
- iw:		Hebrew (from JDK)
- zh_CN:	Simplified Chinese
- zh_TW:	Traditional Chinese
- zh:		does not exist (like in JDK)
- no:		Norwegian Bokmål
- nn:		not supported (Norwegian Nynorsk)
- nb:		not supported (Norwegian Bokmål)



### Themes (library.source.less, shared.css, img, img-RTL)

The `library.source.less` file is responsible for letting [LESS](http://lesscss.org) know all the CSS files to process. It imports the central LESS files of the sap.ui.core library and also all control CSS/LESS files inside the current library.

The one in the base theme imports `base.less` and `global.less` from the core library (and all existing base CSS files of the controls in this library):
```css
@import "../../../../sap/ui/core/themes/base/base.less";
@import "../../../../sap/ui/core/themes/base/global.less";

@import "ActionListItem.less";
@import "ActionSheet.less";
@import "App.less";
@import "Bar.less";
...
```

The one in the specific theme (here: sap\_bluecrystal) imports the above `library.source.less` from the base theme in this library and `base.less` and `global.less` from the specific theme in the core library (and all existing sap\_bluecrystal CSS files of the controls as well as `shared.css` in this library):
```css
@import "../base/library.source.less";
@import "../../../../sap/ui/core/themes/sap_bluecrystal/base.less";
@import "../../../../sap/ui/core/themes/sap_bluecrystal/global.less";
@import "shared.less";

@import "ActionListItem.less";
...
```
Note that the relative paths, which are going up four levels and then descending into `sap/ui/core/themes/sap_bluecrystal`, do not correspond to the physical file locations of the sources, but to the file tree as it would exist at runtime (where the content of source folders like `sap.ui.core` and `themelib_sap_bluecrystal` is merged into one tree).

`shared.less` is by convention the name of a CSS file for library-level styles. It is handled and imported just like normal control CSS files, the separation is purely for better maintainability.

The `img` folder contains any image resources and the same-name images are automatically loaded from the `img-RTL` folder when UI5 runs in right-to-left mode, so images can be either just copied, or mirrored, or otherwise modified to fit the desired RTL visuals and then put into this folder.

Developing a Control inside a Library
-------------------------------------

At development time a control consists of three parts:

-   The API and implementation ("behavior")
-   The renderer (creating the HTML)
-   The CSS file(s) (providing the visual design)

### The Control API and Behavior

The main JavaScript file of a control contains the metadata object describing the API (properties, aggregations, events,...) as well as all method implementations reacting to browser events. This is explained in the main [control development documentation](https://openui5.hana.ondemand.com/#docs/guide/91f1703b6f4d1014b6dd926db0e91070.html). However, there are three significant differences when a control is developed within a control library:

1.  By convention, the overall control is implemented in an [AMD structure](http://requirejs.org/docs/whyamd.html) ("Asynchronous Module Definition"), so there is a `sap.ui.define` function call wrapping the implementation and passing in all dependencies. Inside the implementation only the passed objects are used, not fully-namespaced global objects. E.g. if a `sap.ui.commons.Button` is required, it is added to the `define` function and the inner code only refers to a local `Button` object. This is to allow asynchronous usage and to conform with many tools depending on this structure.
2.  Usually [the renderer](#the-control-renderer) is not just a static function in the behavior JS file, but a separate JS file. This is technically not mandatory, but a way to keep files smaller and more maintainable.
3.  The documentation written for the API definition and any public methods is significant because it can be automatically extracted and converted into JSDoc documentation pages (this build step is not yet re-implemented with the Grunt build, though).
4.  To be built and packaged with the library, controls need to be registered in [the library.js file](#libraryjs-file).

#### The AMD syntax

The AMD syntax wraps modules (in this case UI5 controls and other entities) in a function call (`sap.ui.define(...)`). This function takes an array with the names of all required dependencies as first parameter and a function containing the module implementation as second parameter. This second function gets all the dependencies as objects passed in. This allows for clear declaration of all dependencies as well as asynchronous invocation of the module implementation code once the dependencies are all loaded.
```js
sap.ui.define([dependency1Name, dependency2Name,...], function(dependency1, dependency2,...) {
   // module code, using dependency1, dependency2 etc. for the implementation
});
```

One example control implementation using this syntax (but not containing any documentation or further functionality):
```js
sap.ui.define(['jquery.sap.global', './ListItemBase', './library'],
	function(jQuery, ListItemBase, library) {
	"use strict";

	var MyListItem = ListItemBase.extend("sap.m.MyListItem", /** @lends sap.m.MyListItem.prototype */ { metadata : {
		library : "sap.m",
		properties : {}
	}});

	return MyListItem;

}, /* bExport= */ true);
```

You see the two standard dependencies:

-   ```jquery.sap.global``` providing jQuery itself, enriched with additional UI5 plugins
-   ```./library``` providing the library definition in the `library.js` file

as well as another very common dependency, the base class:

-   ```./ListItemBase``` the base class of this specific ListItem type

Other very frequently used dependencies are:

-   ```sap/ui/core/Renderer``` for renderers
-   ```sap/ui/core/Control``` as base class for controls not inheriting from other controls

Single entities contained inside library.js cannot be declared as dependencies.


#### An Example Control Behavior File

While the implementation code is the same as in "notepad controls", some aspects should be handled with additional care when developing re-use controls in control libraries. In the below example you can find some of them:

-   The copyright placeholder is used in controls developed by SAP to inject the Apache license notice and the current years.
-   The AMD syntax wrapper as described above
-   The `"use strict";` statements switching the JavaScript interpreter to ECMAScript 5's [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) (which enforces better JavaScript by disallowing certain features of JavaScript, like undeclared variables, that make the code less robust)
-   Extensive JSDoc documentation that will be converted into the official API documentation
    -   Not only for the control type itself, but also for the properties, aggregations, methods etc.
```js
/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectNumber.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new ObjectNumber.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectNumber displays number and number unit properties for an object. The number can be displayed using semantic colors to provide addition meaning about the object to the user.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectNumber
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectNumber = Control.extend("sap.m.ObjectNumber", /** @lends sap.m.ObjectNumber.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Number field of the object number
			 */
			number : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Number units qualifier
			 * @deprecated Since version 1.16.1. 
			 * 
			 * Replaced by unit property due to the number before unit is redundant.
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null, deprecated: true},
	
			/**
			 * Indicates if object number is visible. Invisible object number is not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * Indicates if the object number should appear emphasized
			 */
			emphasized : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * The object number's value state. Setting this state will cause the number to be rendered in state-specific colors (only blue-crystal theme).
			 */
			state : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},
	
			/**
			 * Number units qualifier. If numberUnit and unit are both set, the unit value is used.
			 * @since 1.16.1
			 */
			unit : {type : "string", group : "Misc", defaultValue : null}
		}
	}});

	/**
	 * String to prefix css class for number status to be used in
	 * controler and renderer
	 * @private 
	 */
	ObjectNumber.prototype._sCSSPrefixObjNumberStatus = 'sapMObjectNumberStatus';
	
	/**
	 * API method to set the object number's value state.
	 *
	 * @param {string} sState The Object Number's value state
	 * @public
	 */
	ObjectNumber.prototype.setState = function(sState) {
		//remove the current value state css class
		this.$().removeClass(this._sCSSPrefixObjNumberStatus + this.getState());
	
		//do suppress rerendering
		this.setProperty("state", sState, true);
	
		//now set the new css state class
		this.$().addClass(this._sCSSPrefixObjNumberStatus + this.getState());
	
		return this;
	};

	return ObjectNumber;

});
```

The ´@ui5-metamodel´ annotation relates to the "old" Maven build, which is internally still used. It means that the legacy `*.control` files should be re-generated for this control, for potential other users in upper layers. This annotation is planned to be removed.


### The Control Renderer

The below is one complete renderer file from an existing control library. It is used to highlight some of the differences in renderers, compared to renderers in "notepad controls":

-   The renderer is typically defined in a file on its own, as a static class (initialized as empty object)
-   The same copyright placeholder (for controls within UI5) and AMD syntax and strict mode settings as used in control behavior files
-   The renderer class has one main method, `render(...)`, getting a RenderManager instance and the control instance to be rendered as arguments
    -   Additional static functions can be created to structure the code or to create reusable functionality that creates chunks of HTML also needed elsewhere (e.g. when controls are capable of re-rendering certain sub-areas without invocation of the normal UI5 rendering mechanism)

The code within the `render()` method is the same as in "notepad controls".
```js
/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class NavContainer renderer. 
	 * @static
	 */
	var NavContainerRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NavContainerRenderer.render = function(rm, oControl) {
		// return immediately if control is invisible, do not render any HTML
		if (!oControl.getVisible()) {
			return;
		}
		
		rm.write("<div");
		rm.writeControlData(oControl);
		
		rm.addClass("sapMNav");
		rm.addStyle("width", oControl.getWidth());
		rm.addStyle("height", oControl.getHeight());
	
		if (this.renderAttributes) {
			this.renderAttributes(rm, oControl); // may be used by inheriting renderers, but DO NOT write class or style attributes! Instead, call addClass/addStyle.
		}
		
		rm.writeClasses();
		rm.writeStyles();
		
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write(">"); // div element
	
		if (this.renderBeforeContent) {
			this.renderBeforeContent(rm, oControl); // hook method; may be used by inheriting renderers
		}
		
		var oContent = oControl.getCurrentPage();
		if (oContent) {
			rm.renderControl(oContent);
		}
	
		rm.write("</div>");
	};
	

	return NavContainerRenderer;

}, /* bExport= */ true);
```

Renderers of controls inheriting from other controls often re-use the parent class' renderer - sometimes the parent rendering is sufficient, sometimes they add some attributes or HTML in certain places. One example for this is the following `sap.ui.commons.ToggleButtonRenderer`. It extends/re-uses the `sap.ui.commons.ButtonRenderer`, but in addition it implements the `renderButtonAttributes` method, which is called by the `ButtonRenderer` in case it is implemented by any subclass. So on top of the normal Button rendering, the ToggleButton adds the "pressed" state to the HTML as an attribute and also adds a CSS class when it is pressed

Note that the `.extend(...)` method used here is different from the normal UI5 inheritance method. This will be changed and made more consistent, so the below code will change slightly.

Documentation omitted to keep this example short:
```js
// Provides default renderer for control sap.ui.commons.ToggleButton
sap.ui.define(['jquery.sap.global', './ButtonRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ButtonRenderer, Renderer) {
	"use strict";

	var ToggleButtonRenderer = Renderer.extend(ButtonRenderer);

	ToggleButtonRenderer.renderButtonAttributes = function(rm, oToggleButton) {
		var bPressed = oToggleButton.getPressed();
	
		if (bPressed) {
			rm.addClass("sapMToggleBtnPressed");
		}
	
		rm.writeAttribute('pressed', bPressed);
	};

	return ToggleButtonRenderer;

}, /* bExport= */ true);
```

### Control CSS/LESS files

Controls developed in libraries can come with their own CSS. The CSS for each control *can* be developed separately (and will be merged), the CSS for the correct theme is automatically loaded by the UI5 core at runtime, and several build steps with additional benefits are available. One of them is [LESS](http://lesscss.org) preprocessing which allows (among other features) the usage of variables.

The UI5 theming concept is based on two-level themes: one "base" theme is the foundation for all "real" themes like "sap\_bluecrystal" And "sap\_hcb". The "real" theme is always the result of appending theme-specific CSS to the base theme CSS. This happens in the UI5 library build. E.g. the "library.css" file for Blue Crystal is created by concatenating all control CSS files in the "themes/base" folder and then all control CSS files in the "themes/sap\_bluecrystal" folder.

The reason for this is that the styling rules contained in CSS files have two different purposes:

1.  making controls *work* properly, according to their functional specification. These usually are independent of the theme and not affected by visual adaptations done by customers.
2.  making controls *look* properly, according to the visual design specification. These are usually different from theme to theme and also likely to be changed by customers.

Examples for 1.) are "z-index" settings, "position:absolute", "box-sizing:border-box" "white-space:nowrap", or "overflow:hidden". Examples for 2.) are paddings and dimensions (other than "100%"), shadows, gradients, and settings for the "border-radius".

The functional settings from 1.) go into the "base" theme, so they are automatically available for all themes. The visual settings from 2.) go into the specific themes like "sap\_bluecrystal".

One special case is whenever LESS variables are used: they are mainly used for colors and colors are very much related to the visual design, so colors normally belong into category 2.). However, when LESS variables are used, every theme can re-define them and even when they are used in the "base" theme CSS, the generated CSS file will automatically have the correct values for each theme! Hence, the following CSS should go into the "base" theme:
```css
.someLibSomeControl {
   color: @sapUiText;
   background-color: @sapUiMediumBG;
   border: 1px solid @sapUiBrand;
}
```

For each theme, this CSS will get the correct colors for text, background and border. Some CSS parameters are only defined by specific themes, they cannot be used in "base" CSS.

If such style inherited from the base theme needs to be changed in rare cases, the specific themes can override it by providing their own CSS with other values.

### Right-to-Left Support

In the UI5 theming concept, RTL support is defined as follows:

-   All controls are styled for LTR in their usual CSS files.
-   Images are stored directly in the img subfolder of the theme or in a subfolder thereof. RTL Images must be in the same location in the img-RTL folder and have the same name as their LTR counterparts.
-   The LESS-based CSS generator provides an RTL flipping algorithm that mirrors the CSS, e.g. it performs the operations like substituting left margins with right margins, converting `padding: 1px 2px 3px 4px;` to `padding: 1px 4px 3px 2px;`, and so on. The algorithm supports most CSS properties, including complex CSS3 properties like transformations. By this mechanism most tasks for RTL conversion are covered.
-   The Control developer has to decide whether any used images need to be mirrored or not and to place the RTL version into the img-RTL folder with the same location and name. The image reference in the CSS is automatically modified to point to this image in RTL mode.
-   Controls shall not write special CSS classes to notify the CSS that RTL is switched on. In CSS the "dir" attribute of the \<HTML\> tag can be checked to provide a specific style that has to be applied for RTL:

  ``` css
        html[dir=rtl] .sapUiBtn {
           color: red; /* make button text red in RTL mode */
        }   
  ```
		
However, this should only be required in rare cases, as the mentioned CSS mirroring algorithm covers most required RTL transformations. NOTE: this style is also mirrored in the actual RTL case, so you might need to write it mirrored.


### Test Pages

Any HTML pages placed into the *test*\<libraryname\> folder (or below) will be listed in the testsuite. They can be used during development or for manual tests.

### QUnit Tests

To provide automated unit tests for a control, create the file: `/test/<libraryname>/qunit/<controlname>.qunit.hml` and add it to the list of test pages in the `testsuite.qunit.html` file in the same directory. For the implementation of these tests, please refer to the [QUnit documentation](http://qunitjs.com/) or existing unit tests.

### Visual Tests

To provide automated visual tests for a control, create the file: `/test/<libraryname>/visual/<controlname>.spec.js` and add it to the list of test pages in the `visual.suite.js` file in the same directory. For the implementation of these tests, please refer to the "ui5delivery/visualtestjs" project on the SAP GitHub or existing visual tests.
