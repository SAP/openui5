/*!
 * ${copyright}
 */

// Provides the render manager sap.ui.core.RenderManager
sap.ui.define([
	'./LabelEnablement',
	'sap/ui/base/Object',
	'sap/ui/performance/trace/Interaction',
	'sap/base/util/uid',
	"sap/ui/util/ActivityDetection",
	"sap/ui/thirdparty/jquery",
	"sap/base/security/encodeXML",
	"sap/base/security/encodeCSS",
	"sap/base/assert",
	"sap/ui/performance/Measurement",
	"sap/base/Log",
	"./InvisibleRenderer",
	"./Patcher"
], function(
	LabelEnablement,
	BaseObject,
	Interaction,
	uid,
	ActivityDetection,
	jQuery,
	encodeXML,
	encodeCSS,
	assert,
	Measurement,
	Log,
	InvisibleRenderer,
	Patcher
) {

	"use strict";

	var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering", "accessibilityState", "icon"];

	var aStrInterfaceMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData",
		"writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles",
		"writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];

	var aDomInterfaceMethods = ["openStart", "voidStart", "attr", "class", "style", "openEnd", "voidEnd", "text", "unsafeHtml", "close"];

	var aNonRendererMethods = ["render", "flush", "destroy"];

	/**
	 * Creates an instance of the RenderManager.
	 *
	 * Applications or controls must not call the <code>RenderManager</code> constructor on their own
	 * but should use the {@link sap.ui.core.Core#createRenderManager sap.ui.getCore().createRenderManager()}
	 * method to create an instance for their exclusive use.
	 *
	 * @class A class that handles the rendering of controls.
	 *
	 * For the default rendering task of UI5, a shared RenderManager is created and owned by <code>sap.ui.core.Core</code>.
	 * Controls or other code that want to render controls outside the default rendering task
	 * can create a private instance of RenderManager by calling the
	 * {@link sap.ui.core.Core#createRenderManager sap.ui.getCore().createRenderManager()} method.
	 * When such a private instance is no longer needed, it should be {@link #destroy destroyed}.
	 *
	 * Control renderers only have access to a subset of the public and protected instance methods of
	 * this class. The instance methods {@link #flush}, {@link #render} and {@link #destroy} are not part
	 * of that subset and are reserved to the owner of the corresponding RenderManager instance.
	 * Renderers will use the provided methods to create their HTML output. The RenderManager will
	 * collect the HTML output and inject the final HTML DOM at the desired location.
	 *
	 *
	 * <h3>Renderers</h3>
	 * When the {@link #renderControl} method of the RenderManager is invoked, it will retrieve
	 * the default renderer for that control. By convention, the default renderer is implemented in its
	 * own namespace (static class) which matches the name of the control's class with the additional
	 * suffix 'Renderer'. So for a control <code>sap.m.Input</code> the default renderer will be searched
	 * for under the global name <code>sap.m.Input<i>Renderer</i></code>.
	 *
	 * <h3>In-place DOM patching</h3>
	 * As of 1.67, <code>RenderManager</code> provides a set of new APIs to describe the structure of the DOM that can be used by the control renderers.
	 *
	 * <pre>
	 *
	 *   myButtonRenderer.render = function(rm, oButton) {
	 *
	 *       rm.openStart("button", oButton);
	 *       rm.attr("tabindex", 1);
	 *       rm.class("myButton");
	 *       rm.style("width", oButton.getWidth());
	 *       rm.openEnd();
	 *           rm.text(oButton.getText());
	 *       rm.close("button");
	 *
	 *   };
	 *
	 * </pre>
	 *
	 * By default, when the control is invalidated (e.g. a property is changed, an aggregation is removed, or an association is added), it will be registered for re-rendering.
	 * During the (re)rendering, the <code>render</code> method of the control renderer is executed via a specified <code>RenderManager</code> interface and the control instance.
	 * Traditional string-based rendering creates a new HTML structure of the control in every rendering cycle and removes the existing control DOM structure from the DOM tree.
	 * The set of new semantic <code>RenderManager</code> APIs lets us understand the structure of the DOM, walk along the live DOM tree, and figure out changes as new APIs are called.
	 * If there is a change, then <code>RenderManager</code> patches only the required parts of the live DOM tree. This allows control developers to remove their DOM-related custom setters.
	 *
	 * <b>Note:</b> To enable the new in-place rendering technology, the <code>apiVersion</code> property of the control renderer must be set to <code>2</code>.
	 *
	 * <pre>
	 *
	 *   var myButtonRenderer = {
	 *       apiVersion: 2    // enable in-place DOM patching
	 *   };
	 *
	 *   myButtonRenderer.render = function(rm, oButton) {
	 *
	 *       rm.openStart("button", oButton);
	 *       ...
	 *       ...
	 *       rm.close("button");
	 *
	 *   };
	 *
	 * </pre>
	 *
	 * <h3>Renderer.apiVersion contract</h3>
	 * To allow a more efficient in-place DOM patching and to ensure the compatibility of the control, the following prerequisites must be fulfilled for the controls using the new rendering technology:
	 *
	 * <ul>
	 * <li>Legacy control renderers must be migrated to the new semantic renderer API:
	 *     {@link sap.ui.core.RenderManager#openStart openStart},
	 *     {@link sap.ui.core.RenderManager#voidStart voidStart},
	 *     {@link sap.ui.core.RenderManager#style style},
	 *     {@link sap.ui.core.RenderManager#class class},
	 *     {@link sap.ui.core.RenderManager#attr attr},
	 *     {@link sap.ui.core.RenderManager#openEnd openEnd},
	 *     {@link sap.ui.core.RenderManager#voidEnd voidEnd},
	 *     {@link sap.ui.core.RenderManager#text text},
	 *     {@link sap.ui.core.RenderManager#unsafeHtml unsafeHtml},
	 *     {@link sap.ui.core.RenderManager#icon icon},
	 *     {@link sap.ui.core.RenderManager#accessibilityState accessibilityState},
	 *     {@link sap.ui.core.RenderManager#renderControl renderControl},
	 *     {@link sap.ui.core.RenderManager#cleanupControlWithoutRendering cleanupControlWithoutRendering}
	 * </li>
	 * <li>During the migration, restrictions that are defined in the API documentation must be taken into account, e.g. tag and attribute names must be set in their canonical form.</li>
	 * <li>Fault tolerance of HTML5 markups is not applicable for the new semantic rendering API, e.g. except void tags, all tags must be closed; duplicate attributes within one HTML element must not exist.</li>
	 * <li>Existing control DOM structure will not be removed from the DOM tree; therefore all custom events, including the ones that are registered with jQuery, must be deregistered correctly at the <code>onBeforeRendering</code> and <code>exit</code> hooks.</li>
	 * <li>Classes and attribute names must not be escaped. Styles should be validated via types but this might not be sufficient in all cases, e.g. validated URL values can contain harmful content; in this case {@link module:sap/base/security/encodeCSS encodeCSS} can be used.</li>
	 * <li>To allow a more efficient DOM update, second parameter of the {@link sap.ui.core.RenderManager#openStart openStart} or {@link sap.ui.core.RenderManager#voidStart voidStart} methods must be used to identify elements, e.g. use <code>rm.openStart("div", oControl.getId() + "-suffix");</code> instead of <code>rm.openStart("div").attr("id", oControl.getId() + "-suffix");</code></li>
	 * <li>Controls that listen to the <code>focusin</code> event must double check their focus handling. Since DOM nodes are not removed and only reused, the <code>focusin</code> event might not be fired because of re-rendering.</li>
	 * </ul>
	 *
	 *
	 * @see sap.ui.core.Core
	 * @see sap.ui.getCore
	 *
	 * @borrows sap.ui.core.RenderManager#writeAccessibilityState as #accessibilityState
	 * @borrows sap.ui.core.RenderManager#writeIcon as #icon
	 *
	 * @extends Object
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.RenderManager
	 * @public
	 */
	function RenderManager() {

		var that = this,
			oFocusHandler,
			aBuffer,
			aRenderedControls,
			aStyleStack,
			aRenderStack,
			bLocked,
			sOpenTag = "",                 // stores the last open tag that is used for the validation
			bVoidOpen = false,             // specifies whether the last open tag is a void tag or not
			bDomInterface,                 // specifies the rendering interface that is used by the control renderers
			sLegacyRendererControlId = "", // stores the id of the control that has a legacy renderer while its parent has the new semantic renderer
			oStringInterface = {},         // holds old string based rendering API and the string implementation of the new semantic rendering API
			oDomInterface = {};            // semantic rendering API for the controls whose renderer provides apiVersion=2 marker

		/**
		 * Sets the focus handler to be used by the RenderManager.
		 *
		 * @param {sap.ui.core.FocusHandler} oNewFocusHandler the focus handler to be used.
		 * @private
		 */
		this._setFocusHandler = function(oNewFocusHandler) {
			assert(oNewFocusHandler && BaseObject.isA(oNewFocusHandler, 'sap.ui.core.FocusHandler'), "oFocusHandler must be an sap.ui.core.FocusHandler");
			oFocusHandler = oNewFocusHandler;
		};

		/**
		 * Reset all rendering related buffers.
		 */
		function reset() {
			aBuffer = that.aBuffer = [];
			aRenderedControls = that.aRenderedControls = [];
			aStyleStack = that.aStyleStack = [{}];
			bDomInterface = undefined;
			bVoidOpen = false;
			sOpenTag = "";
		}

		//#################################################################################################
		// Assertion methods for validating Semantic Rendering API calls
		// These methods will be converted to inline asserts when assertion removal is supported
		//#################################################################################################

		function assertValidName(sName, sField) {
			assert(sName && typeof sName == "string" && /^[a-z_][a-zA-Z0-9_\-]*$/.test(sName), "The " + sField + " name provided '" + sName + "' is not valid; it must contain alphanumeric characters, hyphens or underscores");
		}

		function assertOpenTagHasStarted(sMethod) {
			assert(sOpenTag, "There is no open tag; '" + sMethod + "' must not be called without an open tag");
		}

		function assertOpenTagHasEnded(bCustomAssertion) {
			var bAssertion = (bCustomAssertion === undefined) ? !sOpenTag : bCustomAssertion;
			assert(bAssertion, "There is an open tag; '" + sOpenTag + "' tag has not yet ended with '" + (bVoidOpen ? "voidEnd" : "openEnd") + "'");
		}

		function assertValidAttr(sAttr) {
			assertValidName(sAttr, "attr");
			assert(sAttr != "class" && sAttr != "style", "Attributes 'class' and 'style' must not be written, instead use dedicated 'class' or 'style' method");
		}

		function assertValidClass(sClass) {
			assert(typeof sClass == "string" && !/\s/.test(sClass) && arguments.length === 1, "Method 'class' must be called with exactly one class name");
		}

		function assertValidStyle(sStyle) {
			assert(sStyle && typeof sStyle == "string" && !/\s/.test(sStyle), "Method 'style' must be called with a non-empty string name");
		}

		//#################################################################################################
		// Methods for 'Buffered writer' functionality... (all public)
		// i.e. used methods in render-method of Renderers
		//#################################################################################################

		/**
		 * Write the given texts to the buffer
		 * @param {...string|number} sText (can be a number too)
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @SecSink {*|XSS}
		 */
		this.write = function(/** string|number */ sText /* ... */) {
			assert(( typeof sText === "string") || ( typeof sText === "number"), "sText must be a string or number");
			aBuffer.push.apply(aBuffer, arguments);
			return this;
		};

		/**
		 * Escape text for HTML and write it to the buffer.
		 *
		 * For details about the escaping refer to {@link jQuery.sap.encodeHTML}
		 *
		 * @param {any} sText the text to escape
		 * @param {boolean} bLineBreaks Whether to convert line breaks into <br> tags
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		this.writeEscaped = function(sText, bLineBreaks) {
			if ( sText != null ) {
				sText = encodeXML( String(sText) );
				if (bLineBreaks) {
					sText = sText.replace(/&#xa;/g, "<br>");
				}
				aBuffer.push(sText);
			}
			return this;
		};

		/**
		 * Writes the attribute and its value into the HTML.
		 *
		 * For details about the escaping refer to {@link jQuery.sap.encodeHTML}
		 *
		 * @param {string} sName Name of the attribute
		 * @param {string | number | boolean} vValue Value of the attribute
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @SecSink {0 1|XSS} Attributes are written to HTML without validation
		 */
		this.writeAttribute = function(sName, vValue) {
			assert(typeof sName === "string", "sName must be a string");
			assert(typeof vValue === "string" || typeof vValue === "number" || typeof vValue === "boolean", "value must be a string, number or boolean");
			aBuffer.push(" ", sName, "=\"", vValue, "\"");
			return this;
		};

		/**
		 * Writes the attribute and a value into the HTML, the value will be encoded.
		 *
		 * The value is properly encoded to avoid XSS attacks.
		 *
		 * @param {string} sName Name of the attribute
		 * @param {any} vValue Value of the attribute
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @SecSink {0|XSS}
		 */
		this.writeAttributeEscaped = function(sName, vValue) {
			assert(typeof sName === "string", "sName must be a string");
			aBuffer.push(" ", sName, "=\"", encodeXML(String(vValue)), "\"");
			return this;
		};

		/**
		 * Adds a style property to the style collection if the value is not empty or null
		 * The style collection is flushed if it is written to the buffer using {@link #writeStyle}
		 *
		 * @param {string} sName Name of the CSS property to write
		 * @param {string|float|int} vValue Value to write
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @SecSink {0 1|XSS} Styles are written to HTML without validation
		 */
		this.addStyle = function(sName, vValue) {
			assert(typeof sName === "string", "sName must be a string");
			if (vValue != null && vValue != "") {
				assert((typeof vValue === "string" || typeof vValue === "number"), "value must be a string or number");
				var oStyle = aStyleStack[aStyleStack.length - 1];
				if (!oStyle.aStyle) {
					oStyle.aStyle = [];
				}
				oStyle.aStyle.push(sName + ": " + vValue + ";");
			}
			return this;
		};

		/**
		 * Writes and flushes the style collection
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		this.writeStyles = function() {
			var oStyle = aStyleStack[aStyleStack.length - 1];
			if (oStyle.aStyle && oStyle.aStyle.length) {
				this.writeAttribute("style", oStyle.aStyle.join(" "));
			}
			oStyle.aStyle = null;
			return this;
		};

		/**
		 * Adds a class to the class collection if the name is not empty or null.
		 * The class collection is flushed if it is written to the buffer using {@link #writeClasses}
		 *
		 * @param {string} sName name of the class to be added; null values are ignored
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @SecSink {0|XSS} Classes are written to HTML without validation
		 */
		this.addClass = function(sName) {
			if (sName) {
				assert(typeof sName === "string", "sName must be a string");
				var oStyle = aStyleStack[aStyleStack.length - 1];
				if (!oStyle.aClasses) {
					oStyle.aClasses = [];
				}
				oStyle.aClasses.push(sName);
			}
			return this;
		};

		/**
		 * Writes and flushes the class collection (all CSS classes added by "addClass()" since the last flush).
		 * Also writes the custom style classes added by the application with "addStyleClass(...)". Custom classes are
		 * added by default from the currently rendered control. If an oElement is given, this Element's custom style
		 * classes are added instead. If oElement === false, no custom style classes are added.
		 *
		 * @param {sap.ui.core.Element | boolean} [oElement] an Element from which to add custom style classes (instead of adding from the control itself)
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		this.writeClasses = function(oElement) {
			assert(!oElement || typeof oElement === "boolean" || BaseObject.isA(oElement, 'sap.ui.core.Element'), "oElement must be empty, a boolean, or an sap.ui.core.Element");
			var oStyle = aStyleStack[aStyleStack.length - 1];

			// Custom classes are added by default from the currently rendered control. If an oElement is given, this Element's custom style
			// classes are added instead. If oElement === false, no custom style classes are added.
			var aCustomClasses;
			if (oElement) {
				aCustomClasses = oElement.aCustomStyleClasses;
			} else if (oElement === false) {
				aCustomClasses = [];
			} else {
				aCustomClasses = oStyle.aCustomStyleClasses;
			}

			if (oStyle.aClasses || aCustomClasses) {
				var aClasses = [].concat(oStyle.aClasses || [], aCustomClasses || []);
				if (aClasses.length) {
					this.writeAttribute("class", aClasses.join(" "));
				}
			}

			if (!oElement) {
				oStyle.aCustomStyleClasses = null;
			}
			oStyle.aClasses = null;
			return this;
		};

		//#################################################################################################
		// Semantic Rendering Interface for String Based Rendering
		//#################################################################################################

		/**
		 * Opens the start tag of an HTML element.
		 *
		 * This must be followed by <code>openEnd</code> and concluded with <code>close</code>.
		 * To allow a more efficient DOM update, all tag names have to be used in their canonical form.
		 * For HTML elements, {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element tag names} must all be set in lowercase.
		 * For foreign elements, such as SVG, {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element tag names} can be set in upper camel case (e.g. linearGradient).
		 *
		 * @param {string} sTagName Tag name of the HTML element
	 	 * @param {sap.ui.core.Element|sap.ui.core.ID} [vControlOrId] Control instance or ID to identify the element
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @public
		 * @since 1.67
		 */
		this.openStart = function(sTagName, vControlOrId) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();
			sOpenTag = sTagName;

			this.write("<" + sTagName);
			if (vControlOrId) {
				if (typeof vControlOrId == "string") {
					this.attr("id", vControlOrId);
				} else {
					this.writeElementData(vControlOrId);
				}
			}

			return this;
		};

		/**
		 * Ends an open tag started with <code>openStart</code>.
		 *
		 * This indicates that there are no more attributes to set to the open tag.
		 *
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.openEnd = function(bExludeStyleClasses /* private */) {
			assertOpenTagHasStarted("openEnd");
			assertOpenTagHasEnded(!bVoidOpen);
			sOpenTag = "";

			this.writeClasses(bExludeStyleClasses ? false : undefined);
			this.writeStyles();
			this.write(">");
			return this;
		};

		/**
		 * Closes an open tag started with <code>openStart</code> and ended with <code>openEnd</code>.
		 *
		 * This indicates that there are no more children to append to the open tag.
		 *
		 * @param {string} sTagName Tag name of the HTML element
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.close = function(sTagName) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();

			this.write("</" + sTagName + ">");
			return this;
		};

		/**
		 * Starts a self-closing tag, such as <code>img</code> or <code>input</code>.
		 *
		 * This must be followed by <code>voidEnd</code>. For self-closing tags, the <code>close</code> method must not be called.
		 * To allow a more efficient DOM update, void tag names have to be set in lowercase.
		 * This API is specific for void elements and must not be used for foreign elements.
		 * For more information, see {@link https://www.w3.org/TR/html5/syntax.html#void-elements}.
		 *
		 * @param {string} sTagName Tag name of the HTML element
		 * @param {sap.ui.core.Element|sap.ui.core.ID} [vControlOrId] Control instance or ID to identify the element
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.voidStart = function (sTagName, vControlOrId) {
			this.openStart(sTagName, vControlOrId);

			bVoidOpen = true;
			return this;
		};

		/**
		 * Ends an open self-closing tag started with <code>voidStart</code>.
		 *
		 * This indicates that there are no more attributes to set to the open tag.
		 * For self-closing tags <code>close</code> must not be called.
		 *
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.voidEnd = function (bExludeStyleClasses /* private */) {
			assertOpenTagHasStarted("voidEnd");
			assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
			bVoidOpen = false;
			sOpenTag = "";

			this.writeClasses(bExludeStyleClasses ? false : undefined);
			this.writeStyles();
			this.write(">");
			return this;
		};

		/**
		 * Sets the given HTML markup without any encoding or sanitizing.
		 *
		 * This must not be used for plain texts; use the <code>text</code> method instead.
		 *
		 * @param {string} sHtml Well-formed, valid HTML markup
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 * @SecSink {*|XSS}
		 */
		this.unsafeHtml = function(sHtml) {
			assertOpenTagHasEnded();

			this.write(sHtml);
			return this;
		};

		/**
		 * Sets the text content with the given text.
		 *
		 * @param {string} sText The text to be written
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.text = function(sText) {
			assertOpenTagHasEnded();

			this.writeEscaped(sText);
			return this;
		};

		/**
		 * Adds an attribute name-value pair to the last open HTML element.
		 *
		 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
		 * The attribute name must not be equal to <code>style</code> or <code>class</code>.
		 * Styles and classes must be set via dedicated <code>class</code> or <code>style</code> methods.
		 * To update the DOM correctly, all attribute names have to be used in their canonical form.
		 * For HTML elements, {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes attribute names} must all be set in lowercase.
		 * For foreign elements, such as SVG, {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute attribute names} can be set in upper camel case (e.g. viewBox).
		 *
		 * @param {string} sName Name of the attribute
		 * @param {*} vValue Value of the attribute
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.attr = function(sName, vValue) {
			assertValidAttr(sName);

			this.writeAttributeEscaped(sName, vValue);
			return this;
		};

		/**
		 * Adds a class name to the class collection of the last open HTML element.
		 *
		 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
		 * Class name must not contain any whitespace.
		 *
		 * @param {string} sClass Class name to be written
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.class = function(sClass) {
			if (sClass) {
				assertValidClass.apply(this, arguments);
				this.addClass(encodeXML(sClass));
			}

			return this;
		};

		/**
		 * Adds a style name-value pair to the style collection of the last open HTML element.
		 *
		 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
		 *
		 * @param {string} sName Name of the style property
		 * @param {string} sValue Value of the style property
		 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.style = function(sName, sValue) {
			assertValidStyle(sName);

			this.addStyle(sName, sValue);
			return this;
		};

		// @borrows sap.ui.core.RenderManager#writeAccessibilityState as accessibilityState
		this.accessibilityState = this.writeAccessibilityState;

		// @borrows sap.ui.core.RenderManager#writeIcon as icon
		this.icon = this.writeIcon;


		//#################################################################################################
		// Semantic Rendering Interface for DOM Based Rendering
		//#################################################################################################

		// @see sap.ui.core.RenderManager#openStart
		oDomInterface.openStart = function(sTagName, vControlOrId) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();
			sOpenTag = sTagName;

			if (!vControlOrId) {
				Patcher.openStart(sTagName);
			} else if (typeof vControlOrId == "string") {
				Patcher.openStart(sTagName, vControlOrId);
			} else {
				Patcher.openStart(sTagName, vControlOrId.getId());
				renderElementData(this, vControlOrId);
			}

			return this;
		};

		// @see sap.ui.core.RenderManager#voidStart
		oDomInterface.voidStart = function(sTagName, vControlOrId) {
			this.openStart(sTagName, vControlOrId);

			bVoidOpen = true;
			return this;
		};

		// @see sap.ui.core.RenderManager#attr
		oDomInterface.attr = function(sName, vValue) {
			assertValidAttr(sName);
			assertOpenTagHasStarted("attr");

			Patcher.attr(sName, vValue);
			return this;
		};

		// @see sap.ui.core.RenderManager#class
		oDomInterface.class = function(sClass) {
			if (sClass) {
				assertValidClass.apply(this, arguments);
				assertOpenTagHasStarted("class");

				Patcher.class(sClass);
			}

			return this;
		};

		// @see sap.ui.core.RenderManager#style
		oDomInterface.style = function(sName, vValue) {
			assertValidStyle(sName);
			assertOpenTagHasStarted("style");

			Patcher.style(sName, vValue);
			return this;
		};

		// @see sap.ui.core.RenderManager#openEnd
		oDomInterface.openEnd = function(bExludeStyleClasses /* private */) {
			if (!bExludeStyleClasses) {
				var oStyle = aStyleStack[aStyleStack.length - 1];
				var aStyleClasses = oStyle.aCustomStyleClasses;
				if (aStyleClasses) {
					aStyleClasses.forEach(Patcher.class, Patcher);
					oStyle.aCustomStyleClasses = null;
				}
			}

			assertOpenTagHasStarted("openEnd");
			assertOpenTagHasEnded(!bVoidOpen);
			sOpenTag = "";

			Patcher.openEnd();
			return this;
		};

		// @see sap.ui.core.RenderManager#voidEnd
		oDomInterface.voidEnd = function(bExludeStyleClasses /* private */) {
			if (!bExludeStyleClasses) {
				var oStyle = aStyleStack[aStyleStack.length - 1];
				var aStyleClasses = oStyle.aCustomStyleClasses;
				if (aStyleClasses) {
					aStyleClasses.forEach(Patcher.class, Patcher);
					oStyle.aCustomStyleClasses = null;
				}
			}

			assertOpenTagHasStarted("voidEnd");
			assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
			bVoidOpen = false;
			sOpenTag = "";

			Patcher.voidEnd();
			return this;
		};

		// @see sap.ui.core.RenderManager#text
		oDomInterface.text = function(sText) {
			assertOpenTagHasEnded();

			if (sText != null) {
				Patcher.text(sText);
			}

			return this;
		};

		// @see sap.ui.core.RenderManager#unsafeHtml
		oDomInterface.unsafeHtml = function(sHtml) {
			assertOpenTagHasEnded();

			Patcher.unsafeHtml(sHtml);
			return this;
		};

		// @see sap.ui.core.RenderManager#close
		oDomInterface.close = function(sTagName) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();

			Patcher.close(sTagName);
			return this;
		};


		//Triggers the BeforeRendering event on the given Control
		function triggerBeforeRendering(oControl){
			bLocked = true;
			try {
				var oEvent = jQuery.Event("BeforeRendering");
				// store the element on the event (aligned with jQuery syntax)
				oEvent.srcControl = oControl;
				oControl._handleEvent(oEvent);
			} finally {
				bLocked = false;
			}
		}

		/**
		 * Cleans up the rendering state of the given control without rendering it.
		 *
		 * A control is responsible for the rendering of all its child controls.
		 * But in some cases it makes sense that a control only renders a subset of its children
		 * based on some criterion. For example, a typical carousel control might, for performance
		 * reasons, only render the currently visible children (and maybe some child before and
		 * after the visible area to facilitate slide-in / slide-out animations), but not all children.
		 * This leads to situations where a child had been rendered before, but shouldn't be rendered
		 * anymore after an update of the carousel's position. The DOM related state of that child then
		 * must be cleaned up correctly, e.g. by de-registering resize handlers or native event handlers.
		 * <code>cleanupControlWithoutRendering</code> helps with that task by triggering the same
		 * activities that the normal rendering triggers before the rendering of a control
		 * (e.g. it fire the <code>BeforeRendering</code> event). It just doesn't call the renderer
		 * and the control will not receive an <code>AfterRendering</code> event.
		 *
		 * The following example shows how <code>renderControl</code> and <code>cleanupControlWithoutRendering</code>
		 * should be used:
		 *
		 * <pre>
		 *   CarouselRenderer.render = function(rm, oCarousel){
		 *
		 *     ...
		 *
		 *     oCarousel.getPages().forEach( oPage ) {
		 *        if ( oCarousel.isPageToBeRendered( oPage ) ) {
		 *           rm.renderControl( oPage ); // onBeforeRendering, render, later onAfterRendering
		 *        } else {
		 *           rm.cleanupControlWithoutRendering( oPage ); // onBeforeRendering
		 *        }
		 *     }
		 *
		 *     ...
		 *
		 *   };
		 * </pre>
		 *
		 * <h3>DOM Removal</h3>
		 * The method does not remove the DOM of the given control. The caller of this method has
		 * to take care to remove it at some later point in time. It should indeed be <i>later</i>,
		 * not <i>before</i> as the <code>onBeforeRendering</code> hook of the control might need
		 * access to the old DOM for a proper cleanup.
		 *
		 * For parents which are rendered with the normal mechanism as shown in the example above,
		 * the removal of the old child DOM is guaranteed. The whole DOM of the parent control
		 * (including the DOM of the no longer rendered child) will be replaced with new DOM (no
		 * longer containing the child) when the rendering cycle finishes.
		 *
		 * <b>Note:</b>: the functionality of this method is different from the default handling for
		 * invisible controls (controls with <code>visible == false</code>). The standard rendering
		 * for invisible controls still renders a placeholder DOM. This allows re-rendering of the
		 * invisible control once it becomes visible again without a need to render its parent, too.
		 * Children that are cleaned up with this method here, are supposed to have no more DOM at all.
		 * Rendering them later on therefore requires an involvement (typically: a rendering) of
		 * their parent.
		 *
		 * @param {sap.ui.core.Control} oControl Control that should be cleaned up
		 * @public
		 * @since 1.22.9
		 */
		this.cleanupControlWithoutRendering = function(oControl) {
			assert(!oControl || BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control or empty");
			if (!oControl || !oControl.getDomRef()) {
				return;
			}

			//Call beforeRendering to allow cleanup
			triggerBeforeRendering(oControl);

			oControl.bOutput = false;
		};

		/**
		 * Turns the given control into its HTML representation and appends it to the
		 * rendering buffer.
		 *
		 * If the given control is undefined or null, then nothing is rendered.
		 *
		 * @param {sap.ui.core.Control} oControl the control that should be rendered
		 * @returns {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		this.renderControl = function(oControl) {
			assert(!oControl || BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control or empty");
			// don't render a NOTHING
			if (!oControl) {
				return this;
			}

			// create stack to determine rendered parent
			if (!aRenderStack) {
				aRenderStack = [];
			}
			// stop the measurement of parent
			if (aRenderStack && aRenderStack.length > 0) {
				Measurement.pause(aRenderStack[0] + "---renderControl");
			} else if (oControl.getParent() && oControl.getParent().getMetadata().getName() == "sap.ui.core.UIArea") {
				Measurement.pause(oControl.getParent().getId() + "---rerender");
			}
			aRenderStack.unshift(oControl.getId());

			// start performance measurement
			Measurement.start(oControl.getId() + "---renderControl", "Rendering of " + oControl.getMetadata().getName(), ["rendering","control"]);

			// Trigger onBeforeRendering before checking visibility, as visible property might be changed in handler
			triggerBeforeRendering(oControl);

			Measurement.pause(oControl.getId() + "---renderControl");
			// don't measure getRenderer because if Load needed its measured in Ajax call

			// Either render the control normally, or invoke the InvisibleRenderer in case the control
			// uses the default visible property
			var oRenderer;
			var oMetadata = oControl.getMetadata();
			var bVisible = oControl.getVisible();
			if (bVisible) {
				// If the control is visible, return its renderer (Should be the default case, just like before)
				oRenderer = oMetadata.getRenderer();
			} else {
				// If the control is invisible, find out whether it uses its own visible implementation
				var oVisibleProperty = oMetadata.getProperty("visible");

				var bUsesDefaultVisibleProperty =
					   oVisibleProperty
					&& oVisibleProperty._oParent
					&& oVisibleProperty._oParent.getName() == "sap.ui.core.Control";

				oRenderer = bUsesDefaultVisibleProperty
					// If the control inherited its visible property from sap.ui.core.Control, use
					// the default InvisibleRenderer to render a placeholder instead of the real
					// control HTML
					? InvisibleRenderer
					// If the control has their own visible property or one not inherited from
					// sap.ui.core.Control, return the real renderer
					: oMetadata.getRenderer();
			}

			Measurement.resume(oControl.getId() + "---renderControl");

			// unbind any generically bound browser event handlers
			var aBindings = oControl.aBindParameters;
			if (aBindings && aBindings.length > 0) { // if we have stored bind calls...
				var jDomRef = jQuery(oControl.getDomRef());
				if (jDomRef && jDomRef[0]) { // ...and we have a DomRef
					for (var i = 0; i < aBindings.length; i++) {
						var oParams = aBindings[i];
						jDomRef.unbind(oParams.sEventType, oParams.fnProxy);
					}
				}
			}

			// Render the control using the RenderManager interface
			if (oRenderer && typeof oRenderer.render === "function") {

				// Determine the rendering interface
				if (aBuffer.length) {

					// string rendering has already started therefore we cannot use DOM rendering interface
					bDomInterface = false;

				} else if (bDomInterface === undefined) {

					// rendering interface must be determined for the root control once per rendering
					// depending on the DOM reference of the control within the DOM tree
					var oDomRef = oControl.getDomRef();
					if (!oDomRef && !bVisible) {
						oDomRef = document.getElementById(InvisibleRenderer.createInvisiblePlaceholderId(oControl));
					}

					// DOM based rendering is valid only for the controls that are already rendered and providing apiVersion=2 marker.
					// If the control is in the preserved area then we should not use DOM rendering interface to avoid patching of preserved nodes.
					if (oDomRef && RenderManager.getApiVersion(oRenderer) == 2 && !RenderManager.isPreservedContent(oDomRef)) {

						// patching will happen during the control renderer calls therefore we need to get the focus info before the patching
						oFocusHandler && oFocusHandler.storePatchingControlFocusInfo(oDomRef);

						// set the starting point of the Patcher
						Patcher.setRootNode(oDomRef);

						// remember that we are using DOM based rendering interface
						bDomInterface = true;

					} else {

						// DOM rendering is not possible we fall back to string rendering interface
						bDomInterface = false;
					}

				} else if (!sLegacyRendererControlId && bDomInterface) {

					// for every subsequent renderControl call we need to check whether we can continue with the DOM based rendering
					if (RenderManager.getApiVersion(oRenderer) != 2) {

						// remember the control id that we have to provide string rendering interface
						sLegacyRendererControlId = oControl.getId();
						bDomInterface = false;
					}
				}

				// before the rendering get custom style classes of the control
				var oControlStyles = {};
				if (oControl.aCustomStyleClasses && oControl.aCustomStyleClasses.length > 0) {
					oControlStyles.aCustomStyleClasses = oControl.aCustomStyleClasses;
				}

				// push them to the style stack that will be read by the first writeClasses/openEnd/voidEnd call to append additional classes
				aStyleStack.push(oControlStyles);

				// execute the renderer of the control via valid rendering interface
				if (bDomInterface) {

					// remember the cursor of the Patcher before the control renderer is executed
					var oCurrentNode = Patcher.getCurrentNode();

					// execute the control renderer with DOM rendering interface
					oRenderer.render(oDomInterface, oControl);

					// during the rendering the cursor of the Patcher should move to the next element when openStart or voidStart is called
					// compare after rendering cursor with before rendering cursor to determine whether the control produced any output
					if (Patcher.getCurrentNode() == oCurrentNode) {

						// we need to remove the control DOM if there is no output produced
						Patcher.unsafeHtml("", oControl.getId());
						oControl.bOutput = false;
					} else {
						oControl.bOutput = true;
					}

				} else {

					// remember the buffer size before the control renderer is executed
					var iBufferLength = aBuffer.length;

					// execute the control renderer with string rendering interface
					oRenderer.render(oStringInterface, oControl);

					// compare after rendering buffer size with before rendering buffer size to determine whether the control produced any output
					oControl.bOutput = (aBuffer.length !== iBufferLength);
				}

				// pop from the style stack after rendering for the next control
				aStyleStack.pop();

				// at the end of the rendering apply the rendering buffer of the control that is forced to render string interface
				if (sLegacyRendererControlId && sLegacyRendererControlId === oControl.getId()) {
					Patcher.unsafeHtml(aBuffer.join(""), sLegacyRendererControlId);
					sLegacyRendererControlId = "";
					bDomInterface = true;
					aBuffer = [];
				}
			} else {
				Log.error("The renderer for class " + oMetadata.getName() + " is not defined or does not define a render function! Rendering of " + oControl.getId() + " will be skipped!");
			}

			// Remember the rendered control
			aRenderedControls.push(oControl);

			// let the UIArea know that this control has been rendered
			// FIXME: RenderManager (RM) should not need to know about UIArea. Maybe UIArea should delegate rendering to RM
			if (oControl.getUIArea && oControl.getUIArea()) {
				oControl.getUIArea()._onControlRendered(oControl);
			}

			// Special case: If an invisible placeholder was rendered, use a non-boolean value
			if (oRenderer === InvisibleRenderer) {
				oControl.bOutput = "invisible"; // Still evaluates to true, but can be checked for the special case
			}

			// end performance measurement
			Measurement.end(oControl.getId() + "---renderControl");
			aRenderStack.shift();

			// resume the measurement of parent
			if (aRenderStack && aRenderStack.length > 0) {
				Measurement.resume(aRenderStack[0] + "---renderControl");
			} else if (oControl.getParent() && oControl.getParent().getMetadata().getName() == "sap.ui.core.UIArea") {
				Measurement.resume(oControl.getParent().getId() + "---rerender");
			}

			return this;
		};

		/**
		 * Renders the given {@link sap.ui.core.Control} and finally returns
		 * the content of the rendering buffer.
		 * Ensures the buffer is restored to the state before calling this method.
		 *
		 * @param {sap.ui.core.Control}
		 *            oControl the Control whose HTML should be returned.
		 * @return {string} the resulting HTML of the provided control
		 * @deprecated Since version 0.15.0. Use <code>flush()</code> instead render content outside the rendering phase.
		 * @public
		 */
		this.getHTML = function(oControl) {
			assert(oControl && BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");

			var tmp = aBuffer;
			var aResult = aBuffer = this.aBuffer = [];
			this.renderControl(oControl);
			aBuffer = this.aBuffer = tmp;
			return aResult.join("");
		};

		//Does everything needed after the rendering (restore focus, calling "onAfterRendering", initialize event binding)
		function finalizeRendering(oStoredFocusInfo){

			var i, size = aRenderedControls.length;

			for (i = 0; i < size; i++) {
				aRenderedControls[i]._sapui_bInAfterRenderingPhase = true;
			}
			bLocked = true;

			try {

				// Notify the behavior object that the controls will be attached to DOM
				for (i = 0; i < size; i++) {
					var oControl = aRenderedControls[i];
					if (oControl.bOutput && oControl.bOutput !== "invisible") {
						var oEvent = jQuery.Event("AfterRendering");
						// store the element on the event (aligned with jQuery syntax)
						oEvent.srcControl = oControl;
						// start performance measurement
						Measurement.start(oControl.getId() + "---AfterRendering","AfterRendering of " + oControl.getMetadata().getName(), ["rendering","after"]);
						oControl._handleEvent(oEvent);
						// end performance measurement
						Measurement.end(oControl.getId() + "---AfterRendering");
					}
				}

			} finally {
				for (i = 0; i < size; i++) {
					delete aRenderedControls[i]._sapui_bInAfterRenderingPhase;
				}
				bLocked = false;
			}

			//finally restore focus
			try {
				oFocusHandler.restoreFocus(oStoredFocusInfo);
			} catch (e) {
				Log.warning("Problems while restoring the focus after rendering: " + e, null);
			}

			// Re-bind any generically bound browser event handlers (must happen after restoring focus to avoid focus event)
			for (i = 0; i < size; i++) {
				var oControl = aRenderedControls[i],
					aBindings = oControl.aBindParameters;

				if (aBindings && aBindings.length > 0) { // if we have stored bind calls...
					var jDomRef = jQuery(oControl.getDomRef());
					if (jDomRef && jDomRef[0]) { // ...and we have a DomRef - TODO: this check should not be required right after rendering...
						for (var j = 0; j < aBindings.length; j++) {
							var oParams = aBindings[j];
							jDomRef.bind(oParams.sEventType, oParams.fnProxy);
						}
					}
				}
			}
		}

		function flushInternal(fnPutIntoDom, fnDone) {

			var oStoredFocusInfo;
			if (!bDomInterface) {
				oStoredFocusInfo = oFocusHandler && oFocusHandler.getControlFocusInfo();
				fnPutIntoDom(aBuffer.join(""));
			} else {
				oStoredFocusInfo = oFocusHandler && oFocusHandler.getPatchingControlFocusInfo();
				Patcher.reset();
			}

			finalizeRendering(oStoredFocusInfo);

			reset();

			ActivityDetection.refresh();

			if (fnDone) {
				fnDone();
			}
		}

		/**
		 * Renders the content of the rendering buffer into the provided DOM node.
		 *
		 * This function must not be called within control renderers.
		 *
		 * Usage:
		 * <pre>
		 *
		 *   // Create a new instance of the RenderManager
		 *   var rm = sap.ui.getCore().createRenderManager();
		 *
		 *   // Use the writer API to fill the buffers
		 *   rm.write(...);
		 *   rm.renderControl(oControl);
		 *   rm.write(...);
		 *   ...
		 *
		 *   // Finally flush the buffer into the provided DOM node (The current content is removed)
		 *   rm.flush(oDomNode);
		 *
		 *   // If the instance is not needed anymore, destroy it
		 *   rm.destroy();
		 *
		 * </pre>
		 *
		 * @param {Element} oTargetDomNode Node in the DOM where the buffer should be flushed into
		 * @param {boolean} bDoNotPreserve Determines whether the content is preserved (<code>false</code>) or not (<code>true</code>)
		 * @param {boolean|int} vInsert Determines whether the buffer of the target DOM node is expanded (<code>true</code>) or
		 *                  replaced (<code>false</code>), or the new entry is inserted at a specific position
		 *                  (value of type <code>int</code>)
		 * @public
		 */
		this.flush = function(oTargetDomNode, bDoNotPreserve, vInsert) {
			assert((typeof oTargetDomNode === "object") && (oTargetDomNode.ownerDocument == document), "oTargetDomNode must be a DOM element");

			var fnDone = Interaction.notifyAsyncStep();

			// preserve HTML content before flushing HTML into target DOM node
			if (!bDoNotPreserve && (typeof vInsert !== "number") && !vInsert) { // expression mimics the conditions used below
				RenderManager.preserveContent(oTargetDomNode);
			}

			flushInternal(function(sHTML) {

				for (var i = 0; i < aRenderedControls.length; i++) {
					//TODO It would be enough to loop over the controls for which renderControl was initially called but for this
					//we have to manage an additional array. Rethink about later.
					var oldDomNode = aRenderedControls[i].getDomRef();
					if (oldDomNode && !RenderManager.isPreservedContent(oldDomNode)) {
						if (RenderManager.isInlineTemplate(oldDomNode)) {
							jQuery(oldDomNode).empty();
						} else {
							jQuery(oldDomNode).remove();
						}
					}
				}
				if (typeof vInsert === "number") {
					if (vInsert <= 0) { // new HTML should be inserted at the beginning
						jQuery(oTargetDomNode).prepend(sHTML);
					} else { // new element should be inserted at a certain position > 0
						var $predecessor = jQuery(oTargetDomNode).children().eq(vInsert - 1); // find the element which should be directly before the new one
						if ($predecessor.length === 1) {
							// element found - put the HTML in after this element
							$predecessor.after(sHTML);
						} else {
							// element not found (this should not happen when properly used), append the new HTML
							jQuery(oTargetDomNode).append(sHTML);
						}
					}
				} else if (!vInsert) {
					jQuery(oTargetDomNode).html(sHTML); // Put the HTML into the given DOM Node
				} else {
					jQuery(oTargetDomNode).append(sHTML); // Append the HTML into the given DOM Node
				}

			}, fnDone);

		};

		/**
		 * Renders the given control to the provided DOMNode.
		 *
		 * If the control is already rendered in the provided DOMNode the DOM of the control is replaced. If the control
		 * is already rendered somewhere else the current DOM of the control is removed and the new DOM is appended
		 * to the provided DOMNode.
		 *
		 * This function must not be called within control renderers.
		 *
		 * @param {sap.ui.core.Control} oControl the Control that should be rendered.
		 * @param {Element} oTargetDomNode The node in the DOM where the result of the rendering should be inserted.
		 * @public
		 */
		this.render = function(oControl, oTargetDomNode) {
			assert(oControl && BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be a control");
			assert(typeof oTargetDomNode === "object" && oTargetDomNode.ownerDocument == document, "oTargetDomNode must be a DOM element");
			if ( bLocked ) {
				Log.error("Render must not be called within Before or After Rendering Phase. Call ignored.", null, this);
				return;
			}

			var fnDone = Interaction.notifyAsyncStep();

			// Reset internal state before rendering
			reset();

			// Retrieve the markup (the rendering phase)
			this.renderControl(oControl);

			// FIXME: MULTIPLE ROOTS
			// The implementation of this method doesn't support multiple roots for a control.
			// Affects all places where 'oldDomNode' is used
			flushInternal(function(sHTML) {

				if (oControl && oTargetDomNode) {

					var oldDomNode = oControl.getDomRef();
					if ( !oldDomNode || RenderManager.isPreservedContent(oldDomNode) ) {
						// In case no old DOM node was found or only preserved DOM, search for a placeholder (invisible or preserved DOM placeholder)
						oldDomNode = document.getElementById(InvisibleRenderer.createInvisiblePlaceholderId(oControl)) || document.getElementById(RenderPrefixes.Dummy + oControl.getId());
					}

					var bNewTarget = oldDomNode && oldDomNode.parentNode != oTargetDomNode;

					var fAppend = function(){
						var jTarget = jQuery(oTargetDomNode);
						if (oTargetDomNode.innerHTML == "") {
							jTarget.html(sHTML);
						} else {
							jTarget.append(sHTML);
						}
					};

					if (bNewTarget) { //Control was rendered already and is now moved to different location

						if (!RenderManager.isPreservedContent(oldDomNode)) {
							if (RenderManager.isInlineTemplate(oldDomNode)) {
								jQuery(oldDomNode).empty();
							} else {
								jQuery(oldDomNode).remove();
							}
						}

						if (sHTML) {
							fAppend();
						}

					} else { //Control either rendered initially or rerendered at the same location

						if (sHTML) {
							if (oldDomNode) {
								if (RenderManager.isInlineTemplate(oldDomNode)) {
									jQuery(oldDomNode).html(sHTML);
								} else {
									jQuery(oldDomNode).replaceWith(sHTML);
								}
							} else {
								fAppend();
							}
						} else {
							if (RenderManager.isInlineTemplate(oldDomNode)) {
								jQuery(oldDomNode).empty();
							} else {
								// give parent control a chance to handle emptied children properly (e.g. XMLView)
								if ( !oControl.getParent()
										 || !oControl.getParent()._onChildRerenderedEmpty
										 || !oControl.getParent()._onChildRerenderedEmpty(oControl, oldDomNode) ) {
									jQuery(oldDomNode).remove();
								}
							}

						}

					}

				}
			}, fnDone);
		};

		/**
		 * Cleans up the resources associated with this instance.
		 *
		 * After the instance has been destroyed, it must not be used anymore.
		 * Applications should call this function if they don't need the instance any longer.
		 *
		 * @public
		 */
		this.destroy = function() {
			reset();
		};

		//#################################################################################################
		// Build up interfaces that can be used by Renderers
		//#################################################################################################

		var oInterface = {};
		aCommonMethods.forEach(function (sMethod) {
			oStringInterface[sMethod] = oDomInterface[sMethod] = oInterface[sMethod] = this[sMethod];
		}, this);
		aDomInterfaceMethods.forEach(function (sMethod) {
			oStringInterface[sMethod] = oInterface[sMethod] = this[sMethod];
		}, this);
		aStrInterfaceMethods.forEach(function (sMethod) {
			oStringInterface[sMethod] = oInterface[sMethod] = this[sMethod];
		}, this);
		aNonRendererMethods.forEach(function (sMethod) {
			oInterface[sMethod] = this[sMethod];
		}, this);

		/**
		 * Returns the public interface of the RenderManager which can be used by Renderers.
		 *
		 * @return {sap.ui.base.Interface} the interface
		 * @private
		 */
		this.getRendererInterface = function() {
			return oStringInterface;
		};

		this.getInterface = function() {
			return oInterface;
		};

		reset();
	}

	/**
	 * Returns the configuration object
	 * Shortcut for <code>sap.ui.getCore().getConfiguration()</code>
	 * @return {sap.ui.core.Configuration} the configuration object
	 * @public
	 */
	RenderManager.prototype.getConfiguration = function() {
		return sap.ui.getCore().getConfiguration();
	};

	/**
	 * @param {string} sKey the key
	 * @deprecated As of version 1.1, never has been implemented - DO NOT USE
	 * @public
	 */
	RenderManager.prototype.translate = function(sKey) {
		// TODO
	};

	/**
	 * @deprecated As of version 1.1, never has been implemented - DO NOT USE
	 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.writeAcceleratorKey = function() {
		/*
		if (bAlt && !bCtrl && !bArrowKey) {
			// Keyboard helper provides means for visualizing access keys.
			// keydown modifies some CSS rule for showing underlines
			// <span><u class="sapUiAccessKey">H</u>elp me</span>
			UCF_KeyboardHelper.showAccessKeys();
		}
		*/
		return this;
	};

	/**
	 * Writes the controls data into the HTML.
	 * Control Data consists at least of the id of a control
	 * @param {sap.ui.core.Control} oControl the control whose identifying information should be written to the buffer
	 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.writeControlData = function(oControl) {
		assert(oControl && BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");
		this.writeElementData(oControl);
		return this;
	};

	/**
	 * Writes the elements data into the HTML.
	 * Element Data consists at least of the id of an element
	 * @param {sap.ui.core.Element} oElement the element whose identifying information should be written to the buffer
	 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.writeElementData = function(oElement) {
		assert(oElement && BaseObject.isA(oElement, 'sap.ui.core.Element'), "oElement must be an sap.ui.core.Element");

		this.attr("id", oElement.getId());
		renderElementData(this, oElement);

		return this;
	};

	/**
	 * Writes the accessibility state (see WAI-ARIA specification) of the provided element into the HTML
	 * based on the element's properties and associations.
	 *
	 * The ARIA properties are only written when the accessibility feature is activated in the UI5 configuration.
	 *
	 * The following properties/values to ARIA attribute mappings are done (if the element does have such properties):
	 * <ul>
	 * <li><code>editable===false</code> => <code>aria-readonly="true"</code></li>
	 * <li><code>enabled===false</code> => <code>aria-disabled="true"</code></li>
	 * <li><code>visible===false</code> => <code>aria-hidden="true"</code></li>
	 * <li><code>required===true</code> => <code>aria-required="true"</code></li>
	 * <li><code>selected===true</code> => <code>aria-selected="true"</code></li>
	 * <li><code>checked===true</code> => <code>aria-checked="true"</code></li>
	 * </ul>
	 *
	 * In case of the required attribute also the Label controls which referencing the given element in their 'for' relation
	 * are taken into account to compute the <code>aria-required</code> attribute.
	 *
	 * Additionally, the association <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code> are used to write
	 * the ID lists of the ARIA attributes <code>aria-describedby</code> and <code>aria-labelledby</code>.
	 *
	 * Label controls that reference the given element in their 'for' relation are automatically added to the
	 * <code>aria-labelledby</code> attributes.
	 *
	 * Note: This function is only a heuristic of a control property to ARIA attribute mapping. Control developers
	 * have to check whether it fulfills their requirements. In case of problems (for example the RadioButton has a
	 * <code>selected</code> property but must provide an <code>aria-checked</code> attribute) the auto-generated
	 * result of this function can be influenced via the parameter <code>mProps</code> as described below.
	 *
	 * The parameter <code>mProps</code> can be used to either provide additional attributes which should be added and/or
	 * to avoid the automatic generation of single ARIA attributes. The 'aria-' prefix will be prepended automatically to the keys
	 * (Exception: Attribute 'role' does not get the prefix 'aria-').
	 *
	 * Examples:
	 * <code>{hidden : true}</code> results in <code>aria-hidden="true"</code> independent of the presence or absence of
	 * the visibility property.
	 * <code>{hidden : null}</code> ensures that no <code>aria-hidden</code> attribute is written independent of the presence
	 * or absence of the visibility property.
	 * The function behaves in the same way for the associations <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code>.
	 * To append additional values to the auto-generated <code>aria-describedby</code> and <code>aria-labelledby</code> attributes
	 * the following format can be used:
	 * <code>{describedby : {value: "id1 id2", append: true}}</code> => <code>aria-describedby="ida idb id1 id2"</code> (assuming that "ida idb"
	 * is the auto-generated part based on the association <code>ariaDescribedBy</code>).
	 *
	 * @param {sap.ui.core.Element}
	 *            [oElement] the element whose accessibility state should be rendered
	 * @param {Object}
	 *            [mProps] a map of properties that should be added additionally or changed.
	 * @return {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.writeAccessibilityState = function(oElement, mProps) {
		if (!sap.ui.getCore().getConfiguration().getAccessibility()) {
			return this;
		}

		if (arguments.length == 1 && !(BaseObject.isA(oElement, 'sap.ui.core.Element'))) {
			mProps = oElement;
			oElement = null;
		}

		var mAriaProps = {};

		if (oElement != null) {
			var oMetadata = oElement.getMetadata();

			var addACCForProp = function(sElemProp, sACCProp, oVal){
				var oProp = oMetadata.getProperty(sElemProp);
				if (oProp && oElement[oProp._sGetter]() === oVal) {
					mAriaProps[sACCProp] = "true";
				}
			};

			var addACCForAssoc = function(sElemAssoc, sACCProp){
				var oAssoc = oMetadata.getAssociation(sElemAssoc);
				if (oAssoc && oAssoc.multiple) {
					var aIds = oElement[oAssoc._sGetter]();
					if (sElemAssoc == "ariaLabelledBy") {
						var aLabelIds = LabelEnablement.getReferencingLabels(oElement);
						var iLen = aLabelIds.length;
						if (iLen) {
							var aFilteredLabelIds = [];
							for (var i = 0; i < iLen; i++) {
								if ( aIds.indexOf(aLabelIds[i]) < 0) {
									aFilteredLabelIds.push(aLabelIds[i]);
								}
							}
							aIds = aFilteredLabelIds.concat(aIds);
						}
					}

					if (aIds.length > 0) {
						mAriaProps[sACCProp] = aIds.join(" ");
					}
				}
			};

			addACCForProp("editable", "readonly", false);
			addACCForProp("enabled", "disabled", false);
			addACCForProp("visible", "hidden", false);
			if (LabelEnablement.isRequired(oElement)) {
				mAriaProps["required"] = "true";
			}
			addACCForProp("selected", "selected", true);
			addACCForProp("checked", "checked", true);
			addACCForAssoc("ariaDescribedBy", "describedby");
			addACCForAssoc("ariaLabelledBy", "labelledby");
		}

		if (mProps) {
			var checkValue = function(v){
				var type = typeof (v);
				return v === null || v === "" || type === "number" || type === "string" || type === "boolean";
			};

			var prop = {};
			var x, val, autoVal;

			for (x in mProps) {
				val = mProps[x];
				if (checkValue(val)) {
					prop[x] = val;
				} else if (typeof (val) === "object" && checkValue(val.value)) {
					autoVal = "";
					if (val.append && (x === "describedby" || x === "labelledby")) {
						autoVal = mAriaProps[x] ? mAriaProps[x] + " " : "";
					}
					prop[x] = autoVal + val.value;
				}
			}

			//The auto-generated values above can be overridden or reset (via null)
			jQuery.extend(mAriaProps, prop);
		}

		// allow parent (e.g. FormElement) to overwrite or enhance aria attributes
		if (BaseObject.isA(oElement, 'sap.ui.core.Element') && oElement.getParent() && oElement.getParent().enhanceAccessibilityState) {
			oElement.getParent().enhanceAccessibilityState(oElement, mAriaProps);
		}

		for (var p in mAriaProps) {
			if (mAriaProps[p] != null && mAriaProps[p] !== "") { //allow 0 and false but no null, undefined or empty string
				this.attr(p === "role" ? p : "aria-" + p, mAriaProps[p]);
			}
		}

		return this;
	};


	/**
	 * Writes either an &lt;img&gt; tag for normal URI or a &lt;span&gt; tag with needed properties for an icon URI.
	 *
	 * Additional classes and attributes can be added to the tag with the second and third parameter.
	 * All of the given attributes are escaped for security consideration.
	 *
	 * When an &lt;img&gt; tag is rendered, the following two attributes are added by default
	 * and can be overwritten with corresponding values in the <code>mAttributes</code> parameter:
	 * <ul>
	 * <li><code>role: "presentation"</code></Li>
	 * <li><code>alt: ""</code></li>
	 * </ul>
	 *
	 * @param {sap.ui.core.URI} sURI URI of an image or of an icon registered in {@link sap.ui.core.IconPool}
	 * @param {array|string} [aClasses] Additional classes that are added to the rendered tag
	 * @param {object} [mAttributes] Additional attributes that will be added to the rendered tag
	 * @returns {sap.ui.core.RenderManager} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.writeIcon = function(sURI, aClasses, mAttributes){
		var IconPool = sap.ui.requireSync("sap/ui/core/IconPool"),
			bIconURI = IconPool.isIconURI(sURI),
			bAriaLabelledBy = false,
			sProp, oIconInfo, mDefaultAttributes, sLabel, sInvTextId;

		if (typeof aClasses === "string") {
			aClasses = [aClasses];
		}

		if (bIconURI) {
			oIconInfo = IconPool.getIconInfo(sURI);

			if (!oIconInfo) {
				Log.error("An unregistered icon: " + sURI + " is used in sap.ui.core.RenderManager's writeIcon method.");
				return this;
			}

			if (!aClasses) {
				aClasses = [];
			}
			aClasses.push("sapUiIcon");
			if (!oIconInfo.suppressMirroring) {
				aClasses.push("sapUiIconMirrorInRTL");
			}
		}

		if (bIconURI) {
			this.openStart("span");
		} else {
			this.voidStart("img");
		}

		if (Array.isArray(aClasses)) {
			aClasses.forEach(function (sClass) {
				this.class(sClass);
			}, this);
		}

		if (bIconURI) {
			mDefaultAttributes = {
				"data-sap-ui-icon-content": oIconInfo.content,
				"role": "presentation",
				"title": oIconInfo.text || null
			};

			this.style("font-family", "'" + encodeCSS(oIconInfo.fontFamily) + "'");
		} else {
			mDefaultAttributes = {
				role: "presentation",
				alt: "",
				src: sURI
			};
		}

		mAttributes = jQuery.extend(mDefaultAttributes, mAttributes);

		if (!mAttributes.id) {
			mAttributes.id = uid();
		}

		if (bIconURI) {
			sLabel = mAttributes.alt || mAttributes.title || oIconInfo.text || oIconInfo.name;
			sInvTextId = mAttributes.id + "-label";

			// When aria-labelledby is given, the icon's text is output in a hidden span
			// whose id is appended to the aria-labelledby attribute
			// Otherwise the icon's text is output to aria-label attribute
			if (mAttributes["aria-labelledby"]) {
				bAriaLabelledBy = true;
				mAttributes["aria-labelledby"] += (" " + sInvTextId);
			} else if (!mAttributes.hasOwnProperty("aria-label")) { // when "aria-label" isn't set in the attributes object
				mAttributes["aria-label"] = sLabel;
			}
		}

		if (typeof mAttributes === "object") {
			for (sProp in mAttributes) {
				if (mAttributes.hasOwnProperty(sProp) && mAttributes[sProp] !== null) {
					this.attr(sProp, mAttributes[sProp]);
				}
			}
		}

		if (bIconURI) {
			this.openEnd();

			if (bAriaLabelledBy) {
				// output the invisible text for aria-labelledby
				this.openStart("span");
				this.style("display", "none");
				this.attr("id", sInvTextId);
				this.openEnd("span");
				this.text(sLabel);
				this.close("span");
			}

			this.close("span");
		} else {
			this.voidEnd();
		}

		return this;
	};

	/**
	 * Returns the renderer class for a given control instance
	 *
	 * @param {sap.ui.core.Control} oControl the control that should be rendered
	 * @return {object} the renderer class for a given control instance
	 * @public
	 */
	RenderManager.prototype.getRenderer = function(oControl) {
		assert(oControl && BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");
		return RenderManager.getRenderer(oControl);
	};


	//#################################################################################################
	// Static Members
	//#################################################################################################

	/**
	 * Prefixes to be used for rendering "unusual" DOM-Elements, like dummy elements, placeholders
	 * for invisible controls, etc.
	 *
	 * @enum {string}
	 * @private
	 * @alias sap.ui.core.RenderManager.RenderPrefixes
	 */
	var RenderPrefixes = RenderManager.RenderPrefixes = {

		/**
		 * The control has not been rendered because it is invisible, the element rendered with this
		 * prefix can be found by the RenderManager to avoid rerendering the parents
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		Invisible: InvisibleRenderer.PlaceholderPrefix,

		/**
		 * A dummy element is rendered with the intention of replacing it with the real content
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		Dummy: "sap-ui-dummy-",

		/**
		 * A temporary element for a control that participates in DOM preservation.
		 * The temporary element is rendered during string rendering, flushed into DOM
		 * and then replaced with the preserved DOM during onAfterRendering.
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		Temporary: "sap-ui-tmp-"
	};


	/**
	 * Returns the renderer class for a given control instance
	 *
	 * @param {sap.ui.core.Control}
	 *            oControl the control that should be rendered
	 * @type function
	 * @return {object} the renderer class for a given control instance
	 * @static
	 * @public
	 */
	RenderManager.getRenderer = function(oControl) {
		assert(oControl && BaseObject.isA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");

		return oControl.getMetadata().getRenderer();
	};

	/**
	 * Helper to enforce a repaint for a given DOM node.
	 *
	 * Introduced to fix repaint issues in Webkit browsers, esp. Chrome.
	 * @param {Element} vDomNode a DOM node or ID of a DOM node
	 *
	 * @private
	 */
	RenderManager.forceRepaint = function(vDomNode) {
		var oDomNodeById = vDomNode ? window.document.getElementById(vDomNode) : null;
		var oDomNode = typeof vDomNode == "string" ? oDomNodeById : vDomNode;

		if ( oDomNode ) {
			Log.debug("forcing a repaint for " + (oDomNode.id || String(oDomNode)));
			var sOriginalDisplay = oDomNode.style.display;
			var oActiveElement = document.activeElement;
			oDomNode.style.display = "none";
			oDomNode.offsetHeight;
			oDomNode.style.display = sOriginalDisplay;
			if (document.activeElement !== oActiveElement && oActiveElement) {
				oActiveElement.focus();
			}
		}
	};

	/**
	 * Creates the ID to be used for the invisible Placeholder DOM element.
	 * This method can be used to get direct access to the placeholder DOM element.
	 * Also statically available as RenderManager.createInvisiblePlaceholderId()
	 *
	 * @param {sap.ui.core.Element} oElement - The Element instance for which to create the placeholder ID
	 * @returns {string} The ID used for the invisible Placeholder of this element
	 * @static
	 * @protected
	 */
	RenderManager.createInvisiblePlaceholderId = function(oElement) {
		return InvisibleRenderer.createInvisiblePlaceholderId(oElement);
	};


	//#################################################################################################
	// Methods for preserving HTML content
	//#################################################################################################

	var ID_PRESERVE_AREA = "sap-ui-preserve",
		ID_STATIC_AREA = "sap-ui-static", // to be kept in sync with Core!
		ATTR_PRESERVE_MARKER = "data-sap-ui-preserve",
		ATTR_UI_AREA_MARKER = "data-sap-ui-area";

	function getPreserveArea() {
		var $preserve = jQuery(document.getElementById(ID_PRESERVE_AREA));
		if ($preserve.length === 0) {
			$preserve = jQuery("<DIV/>",{"aria-hidden":"true",id:ID_PRESERVE_AREA}).
				addClass("sapUiHidden").addClass("sapUiForcedHidden").css("width", "0").css("height", "0").css("overflow", "hidden").
				appendTo(document.body);
		}
		return $preserve;
	}

	/**
	 * @param {Element} node dom node
	 * Create a placeholder node for the given node (which must have an ID) and insert it before the node
	 */
	function makePlaceholder(node) {
		jQuery("<DIV/>", { id: RenderPrefixes.Dummy + node.id}).addClass("sapUiHidden").insertBefore(node);
	}

	// Stores {@link sap.ui.core.RenderManager.preserveContent} listener as objects with following structure:
	// {fn: <listener>, context: <context>}
	var aPreserveContentListeners = [];

	/**
	 * Attaches a listener which is called on {@link sap.ui.core.RenderManager.preserveContent} call
	 *
	 * @param {function} fnListener listener function
	 * @param {object} [oContext=RenderManager] context for the listener function
	 * @private
	 * @ui5-restricted sap.ui.richtexteditor.RichTextEditor
	 */
	RenderManager.attachPreserveContent = function(fnListener, oContext) {
		// discard duplicates first
		RenderManager.detachPreserveContent(fnListener);
		aPreserveContentListeners.push({
			fn: fnListener,
			context: oContext
		});
	};

	/**
	 * Detaches a {@link sap.ui.core.RenderManager.preserveContent} listener
	 *
	 * @param {function} fnListener listener function
	 * @private
	 * @ui5-restricted sap.ui.richtexteditor.RichTextEditor
	 */
	RenderManager.detachPreserveContent = function(fnListener) {
		aPreserveContentListeners = aPreserveContentListeners.filter(function(oListener) {
			return oListener.fn !== fnListener;
		});
	};

	/**
	 * Collects descendants of the given root node that need to be preserved before the root node
	 * is wiped out. The "to-be-preserved" nodes are moved to a special, hidden 'preserve' area.
	 *
	 * A node is declared "to-be-preserved" when it has the <code>data-sap-ui-preserve</code>
	 * attribute set. When the optional parameter <code>bPreserveNodesWithId</code> is set to true,
	 * then nodes with an id are preserved as well and their <code>data-sap-ui-preserve</code> attribute
	 * is set automatically. This option is used by UIAreas when they render for the first time and
	 * simplifies the handling of predefined HTML content in a web page.
	 *
	 * The "to-be-preserved" nodes are searched with a depth first search and moved to the 'preserve'
	 * area in the order that they are found. So for direct siblings the order should be stable.
	 *
	 * @param {Element} oRootNode to search for "to-be-preserved" nodes
	 * @param {boolean} [bPreserveRoot=false] whether to preserve the root itself
	 * @param {boolean} [bPreserveNodesWithId=false] whether to preserve nodes with an id as well
	 * @public
	 * @static
	 */
	RenderManager.preserveContent = function(oRootNode, bPreserveRoot, bPreserveNodesWithId) {
		assert(typeof oRootNode === "object" && oRootNode.ownerDocument == document, "oRootNode must be a DOM element");

		aPreserveContentListeners.forEach(function(oListener) {
			oListener.fn.call(oListener.context || RenderManager, {domNode : oRootNode});
		});

		var $preserve = getPreserveArea();

		function needsPlaceholder(elem) {
			while ( elem && elem != oRootNode && elem.parentNode ) {
				elem = elem.parentNode;
				if ( elem.hasAttribute(ATTR_PRESERVE_MARKER) ) {
					return true;
				}
				if ( elem.hasAttribute("data-sap-ui") ) {
					break;
				}
			}
			// return false;
		}

		function check(candidate) {

			// don't process the preserve area or the static area
			if ( candidate.id === ID_PRESERVE_AREA || candidate.id === ID_STATIC_AREA ) {
				return;
			}

			if ( candidate.hasAttribute(ATTR_PRESERVE_MARKER) )  { // node is marked with the preserve marker
				// always create a placeholder
				// - when the current node is the root node then we're doing a single control rerendering and need to know where to rerender
				// - when the parent DOM belongs to the preserved DOM of another control, that control needs a placeholder as well
				// - otherwise, the placeholder might be unnecessary but will be removed with the DOM removal following the current preserve
				if ( candidate === oRootNode || needsPlaceholder(candidate) ) {
					makePlaceholder(candidate);
				}
				$preserve.append(candidate);
			} else if ( bPreserveNodesWithId && candidate.id ) {
				RenderManager.markPreservableContent(jQuery(candidate), candidate.id);
				$preserve.append(candidate);
				return;
			}

			// don't dive into nested UIAreas. They are preserved together with any preserved parent (e.g. HTML control)
			if ( !candidate.hasAttribute(ATTR_UI_AREA_MARKER) ) {
				var next = candidate.firstChild;
				while ( next ) {
					// determine nextSibiling before checking the candidate because
					// a move to the preserveArea will modify the sibling relationship!
					candidate = next;
					next = next.nextSibling;
					if ( candidate.nodeType === 1 /* Node.ELEMENT */ ) {
						check(candidate);
					}
				}
			}

		}

		Measurement.start(oRootNode.id + "---preserveContent","preserveContent for " + oRootNode.id, ["rendering","preserve"]);
		if ( bPreserveRoot ) {
			check(oRootNode);
		} else {
			jQuery(oRootNode).children().each(function(i,oNode) {
				check(oNode);
			});
		}
		Measurement.end(oRootNode.id + "---preserveContent");
	};

	/**
	 * Searches "to-be-preserved" nodes for the given control id.
	 *
	 * @param {string} sId control id to search content for.
	 * @return {jQuery} a jQuery collection representing the found content
	 * @public
	 * @static
	 */
	RenderManager.findPreservedContent = function(sId) {
		assert(typeof sId === "string", "sId must be a string");
		var $preserve = getPreserveArea(),
			$content = $preserve.children("[" + ATTR_PRESERVE_MARKER + "='" + sId.replace(/(:|\.)/g,'\\$1') + "']");
		return $content;
	};

	/**
	 * Marks the given content as "to-be-preserved" for a control with the given id.
	 * When later on the content has been preserved, it can be found by giving the same id.
	 *
	 * @param {jQuery} $content a jQuery collection of DOM objects to be marked
	 * @param {string} sId id of the control to associate the content with
	 * @static
	 */
	RenderManager.markPreservableContent = function($content, sId) {
		$content.attr(ATTR_PRESERVE_MARKER, sId);
	};

	/**
	 * Checks whether the given DOM element is part of the 'preserve' area.
	 *
	 * @param {Element} oElement DOM element to check
	 * @return {boolean} Whether element is part of 'preserve' area
	 * @private
	 * @static
	 */
	RenderManager.isPreservedContent = function(oElement) {
		return ( oElement && oElement.getAttribute(ATTR_PRESERVE_MARKER) && oElement.parentNode && oElement.parentNode.id == ID_PRESERVE_AREA );
	};

	/**
	 * Returns the hidden area reference belonging to the current window instance.
	 *
	 * @return {Element} The hidden area reference belonging to the current window instance.
	 * @public
	 * @static
	 */
	RenderManager.getPreserveAreaRef = function() {
		return getPreserveArea()[0];
	};

	var ATTR_INLINE_TEMPLATE_MARKER = "data-sap-ui-template";

	/**
	 * Marks the given content as "inline template".
	 *
	 * @param {jQuery} $content a jQuery collection of DOM objects to be marked
	 * @private
	 * @static
	 */
	RenderManager.markInlineTemplate = function($content) {
		$content.attr(ATTR_INLINE_TEMPLATE_MARKER, "");
	};

	/**
	 * Checks whether the given DOM node is an 'inline template' area.
	 *
	 * @param {Element} oDomNode dom node which is checked
	 * @return {boolean} whether node is an 'inline template' area
	 * @private
	 * @static
	 */
	RenderManager.isInlineTemplate = function(oDomNode) {
		return ( oDomNode && oDomNode.hasAttribute(ATTR_INLINE_TEMPLATE_MARKER) );
	};

	/**
	 * Determines the API version of a control renderer from the <code>apiVersion</code> marker.
	 * If this marker does not exist on the renderer then the default value 1 is returned.
	 * The inherited <code>apiVersion</code> value is not taken into account, <code>apiVersion</code> must be defined explicitly as an own property of the renderer.
	 *
	 * @param {sap.ui.core.Renderer} oRenderer The renderer of the control
	 * @return {int} API version of the Renderer
	 * @private
	 * @static
	 */
	RenderManager.getApiVersion = function(oRenderer) {
		if (oRenderer.hasOwnProperty("apiVersion")) {
			return oRenderer.apiVersion;
		}

		return 1;
	};

	//#################################################################################################
	// Helper Methods
	//#################################################################################################

	/**
	 * Renders the element data that can be used for both DOM and String rendering interfaces
	 *
	 * @param {sap.ui.core.RenderManager} oRm The <code>RenderManager</code> instance
	 * @param {sap.ui.core.Element} oElement The <code>Element</code> instance
	 * @private
	 */
	function renderElementData(oRm, oElement) {
		// render data attribute
		var sId = oElement.getId();
		oRm.attr("data-sap-ui", sId);

		// render custom data
		oElement.getCustomData().forEach(function(oData) {
			var oCheckResult = oData._checkWriteToDom(oElement);
			if (oCheckResult) {
				oRm.attr(oCheckResult.key.toLowerCase(), oCheckResult.value);
			}
		});

		// whether this element is configured to be draggable
		var bDraggable = oElement.getDragDropConfig().some(function(vDragDropInfo){
			return vDragDropInfo.isDraggable(oElement);
		});

		if (!bDraggable) {
			// also check parent config
			var oParent = oElement.getParent();
			if (oParent && oParent.getDragDropConfig) {
				bDraggable = oParent.getDragDropConfig().some(function(vDragDropInfo){
					return vDragDropInfo.isDraggable(oElement);
				});
			}
		}

		if (bDraggable) {
			oRm.attr("draggable", "true");
			oRm.attr("data-sap-ui-draggable", "true");
		}

		return this;
	}

	return RenderManager;

}, true);
