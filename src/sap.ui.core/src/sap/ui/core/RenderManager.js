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
	"sap/base/util/extend",
	"./ControlBehavior",
	"./InvisibleRenderer",
	"./Patcher",
	"./FocusHandler"
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
	extend,
	ControlBehavior,
	InvisibleRenderer,
	Patcher,
	FocusHandler
) {

	"use strict";
	/*global SVGElement*/

	var Element;

	var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering", "accessibilityState", "icon"];

	var aStrInterfaceMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData",
		"writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles",
		"writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];

	var aDomInterfaceMethods = ["openStart", "voidStart", "attr", "class", "style", "openEnd", "voidEnd", "text", "unsafeHtml", "close"];

	var aNonRendererMethods = ["render", "flush", "destroy"];

	var oTemplate = document.createElement("template");

	var ATTR_STYLE_KEY_MARKER = "data-sap-ui-stylekey";

	/**
	 * An attribute marker that is set on a DOM element of a control or element to indicate
	 * that the rendering cannot be skipped and always should be executed.
	 *
	 * The attribute is set for the root DOM element of a control when the control's renderer
	 * does not support apiVersion 4. For controls that support apiVersion 4, this attribute is
	 * also set when
	 *  - the control has at least one delegate that implements an `onAfterRendering`
	 *    and/or `onBeforeRendering` event handler without also setting the `canSkipRendering` flag.
	 *    See {@link sap.ui.core.Element#addEventDelegate Element#addEventDelegate} for more information.
	 *  - the parent of the control implements the `enhanceAccessibilityState` method
	 *    and does not set the `canSkipRendering` property in the enhanced accessibility state.
	 *    See {@link sap.ui.core.Element#enhanceAccessibilityState Element#enhanceAccessibilityState} for more information.
	 *
	 * Controls define the apiVersion 4 contract only for their own rendering, therefore
	 * apiVersion 4 optimization only works when all child controls support apiVersion 4.
	 * This makes this attribute important for RM to determine apiVersion 4 optimization.
	 * @constant
	 * @private
	 */
	var ATTR_DO_NOT_SKIP_RENDERING_MARKER = "data-sap-ui-render";

	/**
	 * Creates an instance of the RenderManager.
	 *
	 * Applications or controls must not call the <code>RenderManager</code> constructor on their own
	 * but should rely on the re-rendering initiated by the framework lifecycle based on invalidation.
	 * See {@link module:sap/ui/core/Element#invalidate} and {@link module:sap/ui/core/Control#invalidate}.
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
	 * <h3>Semantic Rendering</h3>
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
	 * By default, when the control is invalidated (e.g. a property is changed, an aggregation is removed, or an
	 * association is added), it will be registered for rerendering. During the (re)rendering, the <code>render</code>
	 * method of the control renderer is executed via a specified <code>RenderManager</code> interface and the control
	 * instance.
	 *
	 * Traditional string-based rendering creates a new HTML structure of the control in every rendering cycle and removes
	 * the existing control DOM structure from the DOM tree.
	 *
	 * The set of new semantic <code>RenderManager</code> APIs lets us understand the structure of the DOM, walk along the
	 * live DOM tree, and figure out changes as new APIs are called. If there is a change, then <code>RenderManager</code>
	 * patches only the required parts of the live DOM tree. This allows control developers to remove their DOM-related
	 * custom setters.
	 *
	 * <b>Note:</b> To enable the new in-place rendering technology, the <code>apiVersion</code> property of the control
	 * renderer must be set to <code>2</code>. This property is not inherited by subclass renderers. It has to be set
	 * anew by each subclass to assure that the extended contract between framework and renderer is fulfilled (see next
	 * paragraph).
	 *
	 * <pre>
	 *
	 *   var myButtonRenderer = {
	 *       apiVersion: 2    // enable semantic rendering
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
	 * <h3>Contract for Renderer.apiVersion 2</h3>
	 * To allow a more efficient in-place DOM patching and to ensure the compatibility of the control, the following
	 * prerequisites must be fulfilled for the controls using the new rendering technology:
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
	 * <li>During the migration, restrictions that are defined in the API documentation of those methods must be taken
	 *     into account, e.g. tag and attribute names must be set in their canonical form.</li>
	 * <li>Fault tolerance of HTML5 markup is not applicable for the new semantic rendering API, e.g. except void tags,
	 *     all tags must be closed; duplicate attributes within one HTML element must not exist.</li>
	 * <li>Existing control DOM structure will not be removed from the DOM tree; therefore all custom events, including
	 *     the ones that are registered with jQuery, must be de-registered correctly at the <code>onBeforeRendering</code>
	 *     and <code>exit</code> hooks.</li>
	 * <li>Classes and attribute names must not be escaped.</li>
	 * <li>Styles should be validated via types (e.g. <code>sap.ui.core.CSSSize</code>). But this might not be sufficient
	 *     in all cases, e.g. validated URL values can contain harmful content; in this case
	 *     {@link module:sap/base/security/encodeCSS encodeCSS} can be used.</li>
	 * <li>To allow a more efficient DOM update, second parameter of the {@link sap.ui.core.RenderManager#openStart openStart}
	 *     or {@link sap.ui.core.RenderManager#voidStart voidStart} methods must be used to identify elements, e.g. use
	 *     <code>rm.openStart("div", oControl.getId() + "-suffix");</code> instead of
	 *     <code>rm.openStart("div").attr("id", oControl.getId() + "-suffix");</code></li>
	 * <li>Controls that listen to the <code>focusin</code> event must double check their focus handling. Since DOM nodes
	 *     are not removed and only reused, the <code>focusin</code> event might not be fired during rerendering.</li>
	 * </ul>
	 *
	 * <h3>Contract for Renderer.apiVersion 4</h3>
	 * The <code>apiVersion 4</code> marker of the control renderer lets the <code>RenderManager</code> know if a control's output is not affected by changes in the parent control.
	 * By default, if a property, an aggregation, or an association of a control is changed, then the control gets invalidated, and the rerendering process for that control and all of its
	 * children starts. That means child controls rerender together with their parent even though there is no DOM update necessary. If a control's output is only affected by its own
	 * properties, aggregations, or associations, then the <code>apiVersion 4</code> marker can help to reuse the control's DOM output and prevent child controls from rerendering unnecessarily
	 * while they are getting rendered by their parent. This can help to improve performance by reducing the number of re-renderings.<br>
	 * For example: A control called "ParentControl" has a child control called "ChildControl". ChildControl has its own properties, aggregations, and associations, and its output is only affected by them.
	 * The <code>apiVersion 4</code> marker is set in the renderer of ChildControl. Whenever a property of the ParentControl is changed during the re-rendering process, the <code>RenderManager</code>
	 * will check the <code>apiVersion</code> marker of the ChildControl's renderer, and if it's 4, the <code>RenderManager</code> will skip rendering of the ChildControl.<br>
	 *
	 * To allow a more efficient rerendering with an <code>apiVersion 4</code> marker, the following prerequisites must be fulfilled for the control to ensure compatibility:
	 *
	 * <ul>
	 * <li>All the prerequisites of the <code>apiVersion 2</code> marker must be fulfilled by the control.</li>
	 * <li>The behavior and rendering logic of the control must not rely on the assumption that it will always be re-rendered at the same time as its parent.</li>
	 * <li>The <code>onBeforeRendering</code> and <code>onAfterRendering</code> hooks of the control must not be used to manipulate or access any elements outside of the control's own DOM structure.</li>
	 * <li>The control renderer must maintain a proper rendering encapsulation and render only the properties, aggregations, and associations that are specific to the control. The renderer should not reference or depend on any state of the parent control or any other external element.</li>
	 * <li>If certain aggregations are dependent on the state of the parent control, they must always be rendered together with their parent. To accomplish this, the parent control must use the {@link sap.ui.core.Control#invalidate invalidate} method to signal to the child controls
	 * that they need to re-render whenever the dependent state of the parent control changes. This guarantees that the child controls are always in sync with the parent control, regardless of the <code>apiVersion</code> definition of their renderer.</li>
	 * </ul><br>
	 *
	 * <b>Note:</b> The rendering can only be skipped if the renderer of each descendant control has the <code>apiVersion 4</code> marker, and no <code>onBeforeRendering</code> or <code>onAfterRendering</code> event delegates are registered. However, while
	 * {@link sap.ui.core.Element#addEventDelegate adding the event delegate}, setting the <code>canSkipRendering</code> property to <code>true</code> on the event delegate object can be done to indicate that those delegate handlers are compliant with the
	 * <code>apiVersion:4</code> prerequisites and still allows for rendering optimization.<br>
	 * The <code>canSkipRendering</code> property can also be used for the controls that enhance the accessibility state of child controls with implementing the {@link sap.ui.core.Element#enhanceAccessibilityState enhanceAccessibilityState} method. In this case,
	 * setting the <code>canSkipRendering</code> property to <code>true</code> lets the <code>RenderManager</code> know that the parent control's accessibility enhancement is static and does not interfere with the child control's rendering optimization.
	 *
	 * @see sap.ui.core.Core
	 * @see sap.ui.getCore
	 *
	 * @extends Object
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.RenderManager
	 * @hideconstructor
	 * @public
	 */
	function RenderManager() {

		var that = this,
			aBuffer,
			aRenderedControls,
			aStyleStack,
			bLocked,
			sOpenTag = "",                 // stores the last open tag that is used for the validation
			bVoidOpen = false,             // specifies whether the last open tag is a void tag or not
			bDomInterface,                 // specifies the rendering interface that is used by the control renderers
			sLegacyRendererControlId = "", // stores the id of the control that has a legacy renderer while its parent has the new semantic renderer
			oStringInterface = {},         // holds old string based rendering API and the string implementation of the new semantic rendering API
			oDomInterface = {},            // semantic rendering API for the controls whose renderer provides apiVersion=2 marker
			aRenderingStyles = [],         // during string-based rendering, stores the styles that couldn't be set via style attribute due to CSP restrictions
			oPatcher = new Patcher(),      // the Patcher instance to handle in-place DOM patching
			sLastStyleMethod,
			sLastClassMethod;

		/**
		 * Reset all rendering related buffers.
		 */
		function reset() {
			assert(!(sLastStyleMethod = sLastClassMethod = ""));
			aBuffer = that.aBuffer = [];
			aRenderedControls = that.aRenderedControls = [];
			aStyleStack = that.aStyleStack = [{}];
			bDomInterface = undefined;
			bVoidOpen = false;
			sOpenTag = "";
		}

		function writeAttribute(sName, vValue) {
			aBuffer.push(" ", sName, "=\"", vValue, "\"");
		}

		function writeClasses(oElement) {
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
					writeAttribute("class", aClasses.join(" "));
				}
			}

			if (!oElement) {
				oStyle.aCustomStyleClasses = null;
			}
			oStyle.aClasses = null;
		}

		/**
		 * Used by the string rendering APIs to write out the collected styles during writeStyles/openEnd/voidEnd
		 * @param {sap.ui.core.RenderManager} oRm The <code>RenderManager</code> instance
		 * @private
		 */
		function writeStyles() {
			var oStyle = aStyleStack[aStyleStack.length - 1];
			if (oStyle.aStyle && oStyle.aStyle.length) {
				// Due to possible CSP restrictions we do not write styles into the HTML buffer. Instead, we store the styles in the aRenderingStyles array
				// and add a ATTR_STYLE_KEY_MARKER attribute marker for which the value references the original style index in the aRenderingStyles array.
				writeAttribute(ATTR_STYLE_KEY_MARKER, aRenderingStyles.push(oStyle.aStyle.join(" ")) - 1);
			}
			oStyle.aStyle = null;
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
			assert((sAttr != "class" || sLastClassMethod != "class" && (sLastClassMethod = "attr"))
				&& (sAttr != "style" || sLastStyleMethod != "style" && (sLastStyleMethod = "attr")),
				"Attributes 'class' and 'style' must not be written when the methods with the same name"
				+ " have been called for the same element already");
		}

		function assertValidClass(sClass) {
			assert(sLastClassMethod != "attr" && (sLastClassMethod = "class"),
				"Method class() must not be called after the 'class' attribute has been written for the same element");
			assert(typeof sClass == "string" && !/\s/.test(sClass) && arguments.length === 1, "Method 'class' must be called with exactly one class name");
		}

		function assertValidStyle(sStyle) {
			assert(sLastStyleMethod != "attr" && (sLastStyleMethod = "style"),
				"Method style() must not be called after the 'style' attribute has been written for the same element");
			assert(sStyle && typeof sStyle == "string" && !/\s/.test(sStyle), "Method 'style' must be called with a non-empty string name");
		}

		//#################################################################################################
		// Methods for 'Buffered writer' functionality... (all public)
		// i.e. used methods in render-method of Renderers
		//#################################################################################################

		/**
		 * Write the given texts to the buffer.
		 * @param {...string|number} sText (can be a number too)
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead, use the {@link sap.ui.core.RenderManager Semantic Rendering API}.
		 *   There is no 1:1 replacement for <code>write</code>. Typically, <code>write</code> is used to create
		 *   a longer sequence of HTML markup (e.g. an element with attributes and children) in a single call.
		 *   Such a markup sequence has to be split into the individual calls of the Semantic Rendering API.
		 *
		 *   <br><br>Example:<br>
		 *     oRm.write("&lt;span id=\"" + oCtrl.getId() + "-outer\" class=\"myCtrlOuter\"&gt;"
		 *        + "&amp;nbsp;" + oResourceBundle.getText("TEXT_KEY") + "&amp;nbsp;&lt;/span&gt;");
		 *   <br><br>
		 *   has to be transformed to
		 *   <br><br>
		 *   oRm.openStart("span", oCtrl.getId() + "-outer").class("myCtrlOuter").openEnd().text("\u00a0" + oResourceBundle.getText("TEXT_KEY") + "\u00a0").close("span");
		 *   <br><br>
		 *   Note that "&amp;nbsp;" was replaced with "\u00a0" (no-break-space). In general, HTML entities
		 *   have to be replaced by the corresponding Unicode character escapes. A mapping table can be found
		 *   at {@link https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references}.
		 *
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
		 * For details about the escaping refer to {@link sap/base/security/encodeXML}.
		 *
		 * @param {any} sText the text to escape
		 * @param {boolean} [bLineBreaks=false] Whether to convert line breaks into <br> tags
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#text} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
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
		 * For details about the escaping refer to {@link sap/base/security/encodeXML}.
		 *
		 * @param {string} sName Name of the attribute
		 * @param {string | number | boolean} vValue Value of the attribute
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#attr} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#attr} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#style} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Not longer needed, when using the {@link sap.ui.core.RenderManager Semantic Rendering API}
		 *  the actual writing of styles happens when {@link sap.ui.core.RenderManager#openEnd} or {@link sap.ui.core.RenderManager#voidEnd} are used.
		 */
		this.writeStyles = function() {
			writeStyles();
			return this;
		};

		/**
		 * Adds a class to the class collection if the name is not empty or null.
		 * The class collection is flushed if it is written to the buffer using {@link #writeClasses}
		 *
		 * @param {string} sName name of the class to be added; null values are ignored
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#class} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @deprecated Since 1.92. Not longer needed, when using the {@link sap.ui.core.RenderManager Semantic Rendering API}
		 *  the actual writing of classes happens when {@link sap.ui.core.RenderManager#openEnd} or {@link sap.ui.core.RenderManager#voidEnd} are used.
		 */
		this.writeClasses = function(oElement) {
			assert(!oElement || typeof oElement === "boolean" || BaseObject.isObjectA(oElement, 'sap.ui.core.Element'), "oElement must be empty, a boolean, or an sap.ui.core.Element");
			writeClasses(oElement);
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @public
		 * @since 1.67
		 */
		this.openStart = function(sTagName, vControlOrId) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();
			assert(!(sLastStyleMethod = sLastClassMethod = ""));
			sOpenTag = sTagName;

			aBuffer.push("<" + sTagName);
			if (vControlOrId) {
				if (typeof vControlOrId == "string") {
					this.attr("id", vControlOrId);
				} else {
					assert(vControlOrId && BaseObject.isObjectA(vControlOrId, 'sap.ui.core.Element'), "vControlOrId must be an sap.ui.core.Element");

					this.attr("id", vControlOrId.getId());
					renderElementData(this, vControlOrId);
				}
			}

			return this;
		};

		/**
		 * Ends an open tag started with <code>openStart</code>.
		 *
		 * This indicates that there are no more attributes to set to the open tag.
		 *
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.openEnd = function(bExludeStyleClasses /* private */) {
			assertOpenTagHasStarted("openEnd");
			assertOpenTagHasEnded(!bVoidOpen);
			assert(bExludeStyleClasses === undefined || bExludeStyleClasses === true, "The private parameter bExludeStyleClasses must be true or omitted!");
			sOpenTag = "";

			writeClasses(bExludeStyleClasses === true ? false : undefined);
			writeStyles();
			aBuffer.push(">");
			return this;
		};

		/**
		 * Closes an open tag started with <code>openStart</code> and ended with <code>openEnd</code>.
		 *
		 * This indicates that there are no more children to append to the open tag.
		 *
		 * @param {string} sTagName Tag name of the HTML element
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.close = function(sTagName) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();

			aBuffer.push("</" + sTagName + ">");
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.voidEnd = function (bExludeStyleClasses /* private */) {
			assertOpenTagHasStarted("voidEnd");
			assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
			bVoidOpen = false;
			sOpenTag = "";

			writeClasses(bExludeStyleClasses ? false : undefined);
			writeStyles();
			aBuffer.push(">");
			return this;
		};

		/**
		 * Sets the given HTML markup without any encoding or sanitizing.
		 *
		 * This must not be used for plain texts; use the <code>text</code> method instead.
		 *
		 * @param {string} sHtml Well-formed, valid HTML markup
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 * @SecSink {*|XSS}
		 */
		this.unsafeHtml = function(sHtml) {
			assertOpenTagHasEnded();

			aBuffer.push(sHtml);
			return this;
		};

		/**
		 * Sets the text content with the given text.
		 *
		 * Line breaks are not supported by this method, use CSS
		 * {@link https://www.w3.org/TR/CSS2/text.html#white-space-prop white-space: pre-line}
		 * option to implement line breaks.
		 *
		 * HTML entities are not supported by this method,
		 * use unicode escaping or the unicode character to implement HTML entities.
		 * For further information see
		 * {@link https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references}.
		 *
		 * @param {string} sText The text to be written
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.text = function(sText) {
			assertOpenTagHasEnded();
			if ( sText != null ) {
				sText = encodeXML( String(sText) );
				aBuffer.push(sText);
			}
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
		 * HTML entities are not supported by this method,
		 * use unicode escaping or the unicode character to implement HTML entities.
		 * For further information see
		 * {@link https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references}.
		 *
		 * @param {string} sName Name of the attribute
		 * @param {*} vValue Value of the attribute
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.attr = function(sName, vValue) {
			assertValidAttr(sName);

			if (sName == "style") {
				aStyleStack[aStyleStack.length - 1].aStyle = [vValue];
			} else {
				aBuffer.push(" ", sName, "=\"", encodeXML(String(vValue)), "\"");
			}
			return this;
		};

		/**
		 * Adds a class name to the class collection of the last open HTML element.
		 *
		 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
		 * Class name must not contain any whitespace.
		 *
		 * @param {string} sClass Class name to be written
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.class = function(sClass) {
			if (sClass) {
				assertValidClass.apply(this, arguments);
				var oStyle = aStyleStack[aStyleStack.length - 1];
				if (!oStyle.aClasses) {
					oStyle.aClasses = [];
				}
				oStyle.aClasses.push(encodeXML(sClass));
			}
			return this;
		};

		/**
		 * Adds a style name-value pair to the style collection of the last open HTML element.
		 *
		 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
		 * To allow a more efficient DOM update, the CSS property names and values have to be used in their canonical form.
		 * In general, CSS properties are lower-cased in their canonical form, except for parts that are not under the control of CSS.
		 * For more information, see {@link https://www.w3.org/TR/CSS/#indices}.
		 *
		 * @param {string} sName Name of the style property
		 * @param {string|float|int} vValue Value of the style property
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 * @since 1.67
		 */
		this.style = function(sName, vValue) {
			assertValidStyle(sName);

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

		//#################################################################################################
		// Semantic Rendering Interface for DOM Based Rendering
		//#################################################################################################

		// @see sap.ui.core.RenderManager#openStart
		oDomInterface.openStart = function(sTagName, vControlOrId) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();
			assert(!(sLastStyleMethod = sLastClassMethod = ""));
			sOpenTag = sTagName;

			if (!vControlOrId) {
				oPatcher.openStart(sTagName);
			} else if (typeof vControlOrId == "string") {
				oPatcher.openStart(sTagName, vControlOrId);
			} else {
				oPatcher.openStart(sTagName, vControlOrId.getId());
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

			oPatcher.attr(sName, vValue);
			return this;
		};

		// @see sap.ui.core.RenderManager#class
		oDomInterface.class = function(sClass) {
			if (sClass) {
				assertValidClass.apply(this, arguments);
				assertOpenTagHasStarted("class");

				oPatcher.class(sClass);
			}

			return this;
		};

		// @see sap.ui.core.RenderManager#style
		oDomInterface.style = function(sName, vValue) {
			assertValidStyle(sName);
			assertOpenTagHasStarted("style");

			oPatcher.style(sName, vValue);
			return this;
		};

		// @see sap.ui.core.RenderManager#openEnd
		oDomInterface.openEnd = function(bExludeStyleClasses /* private */) {
			if (bExludeStyleClasses !== true) {
				var oStyle = aStyleStack[aStyleStack.length - 1];
				var aStyleClasses = oStyle.aCustomStyleClasses;
				if (aStyleClasses) {
					aStyleClasses.forEach(oPatcher.class, oPatcher);
					oStyle.aCustomStyleClasses = null;
				}
			}

			assertOpenTagHasStarted("openEnd");
			assertOpenTagHasEnded(!bVoidOpen);
			assert(bExludeStyleClasses === undefined || bExludeStyleClasses === true, "The private parameter bExludeStyleClasses must be true or omitted!");
			sOpenTag = "";

			oPatcher.openEnd();
			return this;
		};

		// @see sap.ui.core.RenderManager#voidEnd
		oDomInterface.voidEnd = function(bExludeStyleClasses /* private */) {
			if (!bExludeStyleClasses) {
				var oStyle = aStyleStack[aStyleStack.length - 1];
				var aStyleClasses = oStyle.aCustomStyleClasses;
				if (aStyleClasses) {
					aStyleClasses.forEach(oPatcher.class, oPatcher);
					oStyle.aCustomStyleClasses = null;
				}
			}

			assertOpenTagHasStarted("voidEnd");
			assertOpenTagHasEnded(bVoidOpen || !sOpenTag);
			bVoidOpen = false;
			sOpenTag = "";

			oPatcher.voidEnd();
			return this;
		};

		// @see sap.ui.core.RenderManager#text
		oDomInterface.text = function(sText) {
			assertOpenTagHasEnded();

			if (sText != null) {
				oPatcher.text(sText);
			}

			return this;
		};

		// @see sap.ui.core.RenderManager#unsafeHtml
		oDomInterface.unsafeHtml = function(sHtml) {
			assertOpenTagHasEnded();

			oPatcher.unsafeHtml(sHtml);
			return this;
		};

		// @see sap.ui.core.RenderManager#close
		oDomInterface.close = function(sTagName) {
			assertValidName(sTagName, "tag");
			assertOpenTagHasEnded();

			oPatcher.close(sTagName);
			return this;
		};


		//Triggers the BeforeRendering event on the given Control
		function triggerBeforeRendering(oControl){
			bLocked = true;
			try {
				var oEvent = new jQuery.Event("BeforeRendering");
				// store the element on the event (aligned with jQuery syntax)
				oEvent.srcControl = oControl;
				oControl._bOnBeforeRenderingPhase = true;
				oControl._handleEvent(oEvent);
			} finally {
				oControl._bOnBeforeRenderingPhase = false;
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
		 * (e.g. it fires the <code>BeforeRendering</code> event). It just doesn't call the renderer
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
		 *     oCarousel.getPages().forEach( function( oPage ) {
		 *        if ( oCarousel.isPageToBeRendered( oPage ) ) {
		 *           rm.renderControl( oPage ); // onBeforeRendering, render, later onAfterRendering
		 *        } else {
		 *           rm.cleanupControlWithoutRendering( oPage ); // onBeforeRendering
		 *        }
		 *     });
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
		 * for invisible controls still renders a placeholder DOM. This allows rerendering of the
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
			assert(!oControl || BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control or empty");
			if (!oControl) {
				return;
			}

			var oDomRef = oControl.getDomRef();
			if (oDomRef) {

				// Call beforeRendering to allow cleanup
				triggerBeforeRendering(oControl);

				// as children are not visited during rendering, their DOM has to be preserved here
				RenderManager.preserveContent(oDomRef, /* bPreserveRoot */ false, /* bPreserveNodesWithId */ false);

				// Preserved controls still need to be alive
				if (!oDomRef.hasAttribute(ATTR_PRESERVE_MARKER)) {
					oControl._bNeedsRendering = false;
					oControl.bOutput = false;
				}
			}
		};

		/**
		 * Executes the control renderer with the valid rendering interface.
		 *
		 * @param {sap.ui.core.Control} oControl The control that should be rendered
		 * @param {boolean} bTriggerEvent Whether onBeforeRendering event should be triggered or not
		 * @private
		 */
		function executeRenderer(oControl, bTriggerEvent) {
			// trigger onBeforeRendering hook of the control if needed
			if (bTriggerEvent) {
				triggerBeforeRendering(oControl);
			}

			// unbind any generically bound browser event handlers
			if (oControl.bOutput == true) {
				var aBindings = oControl.aBindParameters;
				if (aBindings && aBindings.length > 0) {
					var $Control = oControl.$();
					aBindings.forEach(function(mParams) {
						$Control.off(mParams.sEventType, mParams.fnProxy);
					});
				}
			}

			// if the control uses default visible property then use the InvisibleRenderer, otherwise the renderer of the control
			var oRenderer = getCurrentRenderer(oControl);
			if (oRenderer == InvisibleRenderer) {

				// invoke the InvisibleRenderer in case the control uses the default visible property
				InvisibleRenderer.render(bDomInterface ? oDomInterface : oStringInterface, oControl);

				// if an invisible placeholder was rendered, mark with invisible marker
				oControl.bOutput = "invisible";

			} else if (oRenderer && typeof oRenderer.render === "function") {

				// before the control rendering get custom style classes of the control
				var oControlStyles = {};
				if (oControl.aCustomStyleClasses && oControl.aCustomStyleClasses.length > 0) {
					oControlStyles.aCustomStyleClasses = oControl.aCustomStyleClasses;
				}

				// push them to the style stack that will be read by the first writeClasses/openEnd/voidEnd call to append additional classes
				aStyleStack.push(oControlStyles);

				// mark that the rendering phase has been started
				oControl._bRenderingPhase = true;

				// execute the control renderer according to rendering interface
				if (bDomInterface) {

					// remember the cursor of the Patcher before the control renderer is executed
					var oCurrentNode = oPatcher.getCurrentNode();

					// let the rendering happen with DOM rendering interface
					oRenderer.render(oDomInterface, oControl);

					// determine whether an output is produced
					if (oPatcher.getCurrentNode() == oCurrentNode) {

						// during the rendering the cursor of the Patcher should move to the next element when openStart or voidStart is called
						// compare after rendering cursor with before rendering cursor to determine whether the control produced any output
						// we need to remove the control DOM if there is no output produced
						oPatcher.unsafeHtml("", oControl.getId());
						oControl.bOutput = false;

					} else {

						// the cursor of the patcher is moved so the output is produced
						oControl.bOutput = true;
					}

				} else {

					// remember the buffer size before the control renderer is executed
					var iBufferLength = aBuffer.length;

					// let the rendering happen with DOM rendering interface
					oRenderer.render(oStringInterface, oControl);

					// compare after rendering buffer size with the before rendering buffer size to determine whether the control produced any output
					oControl.bOutput = (aBuffer.length != iBufferLength);
				}

				// mark that the rendering phase is over
				oControl._bRenderingPhase = false;

				// pop from the style stack after rendering for the next control
				aStyleStack.pop();

			} else {
				Log.error("The renderer for class " + oControl.getMetadata().getName() + " is not defined or does not define a render function! Rendering of " + oControl.getId() + " will be skipped!");
			}

			// store the rendered control
			aRenderedControls.push(oControl);

			// clear the controls dirty marker
			oControl._bNeedsRendering = false;

			// let the UIArea know that this control has been rendered
			var oUIArea = oControl.getUIArea();
			if (oUIArea) {
				oUIArea._onControlRendered(oControl);
			}
		}

		/**
		 * Turns the given control into its HTML representation and appends it to the
		 * rendering buffer.
		 *
		 * If the given control is undefined or null, then nothing is rendered.
		 *
		 * @param {sap.ui.core.Control} oControl the control that should be rendered
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 * @public
		 */
		this.renderControl = function(oControl) {
			assert(!oControl || BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control or empty");
			if (!oControl) {
				return this;
			}

			var oDomRef, oRenderer;
			var bTriggerBeforeRendering = true;

			// determine the rendering interface
			if (aBuffer.length) {

				// string rendering has been already started therefore we cannot use DOM rendering interface anymore
				bDomInterface = false;

			} else if (bDomInterface === undefined) {

				// trigger onBeforeRendering before checking the visibility, since the visible property might change in the event handler
				triggerBeforeRendering(oControl);

				// mark that onBeforeRendering event has been already triggered and yet another onBeforeRendering event is not necessary
				bTriggerBeforeRendering = false;

				// if the control uses the default visible property then use the InvisibleRenderer, otherwise the renderer of the control
				oRenderer = getCurrentRenderer(oControl);

				// rendering interface must be determined for the root control once per rendering
				if (RenderManager.getApiVersion(oRenderer) != 1) {

					// get the visible or invisible DOM element of the control
					oDomRef = oControl.getDomRef() || InvisibleRenderer.getDomRef(oControl);

					// If the control is in the preserved area then we should not use the DOM-based rendering to avoid patching of preserved nodes
					if (RenderManager.isPreservedContent(oDomRef)) {
						bDomInterface = false;
					} else {
						// patching will happen during the control renderer calls therefore we need to get the focus info before the patching
						oDomRef && FocusHandler.storePatchingControlFocusInfo(oDomRef);

						// set the starting point of the Patcher
						oPatcher.setRootNode(oDomRef);

						// remember that we are using DOM based rendering interface
						bDomInterface = true;
					}

				} else {

					// DOM rendering is not possible we fall back to string rendering interface
					bDomInterface = false;
				}

			} else if (!sLegacyRendererControlId && bDomInterface) {

				// if the control uses the default visible property then use the InvisibleRenderer, otherwise the renderer of the control
				oRenderer = getCurrentRenderer(oControl);

				// for every subsequent renderControl call we need to check whether we can continue with the DOM based rendering
				if (RenderManager.getApiVersion(oRenderer) == 1) {

					// remember the control id that we have to provide string rendering interface
					sLegacyRendererControlId = oControl.getId();
					bDomInterface = false;
				}
			}

			// execute the renderer of the control through the valid rendering interface
			if (bDomInterface) {

				// determine whether we should execute the control renderer with DOM rendering interface or whether we can skip the rendering of the control if it does not need rendering
				if (oControl._bNeedsRendering || !oControl.getParent() || oPatcher.isCreating() || !RenderManager.canSkipRendering(oControl)
					|| !(oDomRef = oDomRef || oControl.getDomRef() || InvisibleRenderer.getDomRef(oControl))
					|| oDomRef.hasAttribute(ATTR_DO_NOT_SKIP_RENDERING_MARKER) || oDomRef.querySelector("[" + ATTR_DO_NOT_SKIP_RENDERING_MARKER + "]")) {

					// let the rendering happen with DOM rendering interface
					executeRenderer(oControl, bTriggerBeforeRendering);

				} else {

					// skip the control rendering and re-arrange the cursor of the Patcher
					oPatcher.alignWithDom(oDomRef);
				}

			} else {

				// let the rendering happen with string rendering interface
				executeRenderer(oControl, bTriggerBeforeRendering);

				// at the end of the rendering apply the rendering buffer of the control that is forced to render string interface
				if (sLegacyRendererControlId && sLegacyRendererControlId === oControl.getId()) {
					oPatcher.unsafeHtml(aBuffer.join(""), sLegacyRendererControlId, restoreStyles);
					sLegacyRendererControlId = "";
					bDomInterface = true;
					aBuffer = [];
				}
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
		 * @returns {string} the resulting HTML of the provided control
		 * @deprecated Since version 0.15.0. Use <code>flush()</code> instead render content outside the rendering phase.
		 * @public
		 */
		this.getHTML = function(oControl) {
			assert(oControl && BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");

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
						var oEvent = new jQuery.Event("AfterRendering");
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
				FocusHandler.restoreFocus(oStoredFocusInfo);
			} catch (e) {
				Log.warning("Problems while restoring the focus after rendering: " + e, null);
			}

			// Re-bind any generically bound browser event handlers (must happen after restoring focus to avoid focus event)
			for (i = 0; i < size; i++) {
				var oControl = aRenderedControls[i],
					aBindings = oControl.aBindParameters,
					oDomRef;

				// if we have stored bind calls and we have a DomRef
				if (aBindings && aBindings.length > 0 && (oDomRef = oControl.getDomRef())) {
					var $DomRef = jQuery(oDomRef);
					for (var j = 0; j < aBindings.length; j++) {
						var oParams = aBindings[j];
						$DomRef.on(oParams.sEventType, oParams.fnProxy);
					}
				}
			}
		}

		function flushInternal(fnPutIntoDom, fnDone, oTargetDomNode) {

			var oStoredFocusInfo;
			if (!bDomInterface) {
				// DOM-based rendering was not possible we are in the string-based initial rendering or re-rendering phase
				oStoredFocusInfo = FocusHandler.getControlFocusInfo();
				var sHtml = aBuffer.join("");
				if (sHtml && aRenderingStyles.length) {
					// During the string-based rendering, RM#writeStyles method is not writing the styles into the HTML buffer due to possible CSP restrictions.
					// Instead, we store the styles in the aRenderingStyles array and add an ATTR_STYLE_KEY_MARKER attribute marker for which the value
					// references the original style index in this array.
					// Not to violate the CSP, we need to bring the original styles via HTMLElement.style API. Here we are converting the HTML buffer of
					// string-based rendering to DOM nodes so that we can restore the orginal styles before we inject the rendering output to the DOM tree.
					if (oTargetDomNode instanceof SVGElement && oTargetDomNode.localName != "foreignObject") {
						oTemplate.innerHTML = "<svg>" + sHtml + "</svg>";
						oTemplate.replaceWith.apply(oTemplate.content.firstChild, oTemplate.content.firstChild.childNodes);
					} else {
						oTemplate.innerHTML = sHtml;
					}

					restoreStyles(oTemplate.content.childNodes);
					fnPutIntoDom(oTemplate.content);
				} else {
					fnPutIntoDom(sHtml);
				}
			} else {
				// get the root node of the Patcher to determine whether we are in the initial rendering or the re-rendering phase
				var oRootNode = oPatcher.getRootNode();

				// in case of DOM-based initial rendering, the Patcher creates a DocumentFragment to assemble all created control DOM nodes within it
				if (oRootNode.nodeType == 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
					// even though we are in the initial rendering phase a control within the control tree might has been already rendered before
					// therefore we need to store the currectly focused control info before we inject the DocumentFragment into the real DOM tree
					oStoredFocusInfo = FocusHandler.getControlFocusInfo();

					// controls are not necessarily need to produce output during their rendering
					// in case of output is produced, let the callback injects the DocumentFragment
					fnPutIntoDom(oRootNode.lastChild ? oRootNode : "");
				} else {
					// in case of DOM-based re-rendering, the root node of the Patcher must be an existing HTMLElement
					// since the re-rendering happens during the control renderer APIs are executed here we get the stored focus info before the patching
					oStoredFocusInfo = FocusHandler.getPatchingControlFocusInfo();
				}

				// make the Patcher ready for the next patching
				oPatcher.reset();
			}

			finalizeRendering(oStoredFocusInfo);

			reset();

			ActivityDetection.refresh();

			if (fnDone) {
				fnDone();
			}
		}

		function restoreStyle(oElement, iDomIndex) {
			var sStyleIndex = oElement.getAttribute(ATTR_STYLE_KEY_MARKER);
			if (sStyleIndex != iDomIndex) {
				return 0;
			}

			oElement.style = aRenderingStyles[iDomIndex];
			oElement.removeAttribute(ATTR_STYLE_KEY_MARKER);
			return 1;
		}

		function restoreStyles(aDomNodes) {
			if (!aRenderingStyles.length) {
				return;
			}

			var iDomIndex = 0;
			aDomNodes.forEach(function(oDomNode) {
				if (oDomNode.nodeType == 1 /* Node.ELEMENT_NODE */) {
					iDomIndex += restoreStyle(oDomNode, iDomIndex);
					oDomNode.querySelectorAll("[" + ATTR_STYLE_KEY_MARKER + "]").forEach(function(oElement) {
						iDomIndex += restoreStyle(oElement, iDomIndex);
					});
				}
			});
			aRenderingStyles = [];
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

			flushInternal(function(vHTML) {

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
						insertAdjacent(oTargetDomNode, "prepend", vHTML);
					} else { // new element should be inserted at a certain position > 0
						var oPredecessor = oTargetDomNode.children[vInsert - 1]; // find the element which should be directly before the new one
						if (oPredecessor) {
							// element found - put the HTML in after this element
							insertAdjacent(oPredecessor, "after", vHTML);
						} else {
							// element not found (this should not happen when properly used), append the new HTML
							insertAdjacent(oTargetDomNode, "append", vHTML);
						}
					}
				} else if (!vInsert) {
					jQuery(oTargetDomNode).html(vHTML); // Put the HTML into the given DOM Node
				} else {
					insertAdjacent(oTargetDomNode, "append", vHTML); // Append the HTML into the given DOM Node
				}

			}, fnDone, oTargetDomNode);

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
			assert(oControl && BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be a control");
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
			flushInternal(function(vHTML) {

				if (oControl && oTargetDomNode) {

					var oldDomNode = oControl.getDomRef();
					if ( !oldDomNode || RenderManager.isPreservedContent(oldDomNode) ) {
						// In case no old DOM node was found or only preserved DOM, search for a placeholder (invisible or preserved DOM placeholder)
						oldDomNode = InvisibleRenderer.getDomRef(oControl) || document.getElementById(RenderPrefixes.Dummy + oControl.getId());
					}

					var bNewTarget = oldDomNode && oldDomNode.parentNode != oTargetDomNode;

					if (bNewTarget) { //Control was rendered already and is now moved to different location

						if (!RenderManager.isPreservedContent(oldDomNode)) {
							if (RenderManager.isInlineTemplate(oldDomNode)) {
								jQuery(oldDomNode).empty();
							} else {
								jQuery(oldDomNode).remove();
							}
						}

						if (vHTML) {
							insertAdjacent(oTargetDomNode, "append", vHTML);
						}

					} else { //Control either rendered initially or rerendered at the same location

						if (vHTML) {
							if (oldDomNode) {
								if (RenderManager.isInlineTemplate(oldDomNode)) {
									jQuery(oldDomNode).html(vHTML);
								} else {
									insertAdjacent(oldDomNode, "after", vHTML);
									jQuery(oldDomNode).remove();
								}
							} else {
								insertAdjacent(oTargetDomNode, "append", vHTML);
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
			}, fnDone, oTargetDomNode);
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
		 * @returns {sap.ui.base.Interface} the interface
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
	 * @returns {sap.ui.core.Configuration} the configuration object
	 * @public
	 * @deprecated Since 1.92. Instead, use the {@link sap.ui.core.Core#getConfiguration} API.
	 */
	RenderManager.prototype.getConfiguration = function() {
		return sap.ui.require("sap/ui/core/Configuration");
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#openStart} or {@link sap.ui.core.RenderManager#voidStart}
	 *  of the {@link sap.ui.core.RenderManager Semantic Rendering API} and pass the desired control data as the second parameter to the new API.
	 */
	RenderManager.prototype.writeControlData = function(oControl) {
		assert(oControl && BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");
		this.writeElementData(oControl);
		return this;
	};

	/**
	 * Writes the elements data into the HTML.
	 * Element Data consists at least of the id of an element
	 * @param {sap.ui.core.Element} oElement the element whose identifying information should be written to the buffer
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#openStart} or {@link sap.ui.core.RenderManager#voidStart}
	 *  of the {@link sap.ui.core.RenderManager Semantic Rendering API} and pass the desired element data as the second parameter to the new API.
	 */
	RenderManager.prototype.writeElementData = function(oElement) {
		assert(oElement && BaseObject.isObjectA(oElement, 'sap.ui.core.Element'), "oElement must be an sap.ui.core.Element");

		this.attr("id", oElement.getId());
		renderElementData(this, oElement);

		return this;
	};

	/**
	 * Collects accessibility related attributes for an <code>Element</code> and renders them as part of
	 * the currently rendered DOM element.
	 *
	 * See the WAI-ARIA specification for a general description of the accessibility related attributes.
	 * Attributes are only rendered when the accessibility feature is activated in the UI5 runtime configuration.
	 *
	 * The values for the attributes are collected from the following sources (last one wins):
	 * <ol>
	 * <li>from the properties and associations of the given <code>oElement</code>, using a heuristic mapping
	 *     (described below)</li>
	 * <li>from the <code>mProps</code> parameter, as provided by the caller</li>
	 * <li>from the parent of the given <code>oElement</code>, if it has a parent and if the parent implements
	 *     the method {@link sap.ui.core.Element#enhanceAccessibilityState enhanceAccessibilityState}</li>
	 * </ol>
	 * If no <code>oElement</code> is given, only <code>mProps</code> will be taken into account.
	 *
	 *
	 * <h3>Heuristic Mapping</h3>
	 * The following mapping from properties/values to ARIA attributes is used (if the element does have such properties):
	 * <ul>
	 * <li><code>editable===false</code> => <code>aria-readonly="true"</code></li>
	 * <li><code>enabled===false</code> => <code>aria-disabled="true"</code></li>
	 * <li><code>visible===false</code> => <code>aria-hidden="true"</code></li>
	 * <li><code>required===true</code> => <code>aria-required="true"</code></li>
	 * <li><code>selected===true</code> => <code>aria-selected="true"</code></li>
	 * <li><code>checked===true</code> => <code>aria-checked="true"</code></li>
	 * </ul>
	 *
	 * In case of the <code>required</code> property, all label controls which reference the given element
	 * in their <code>labelFor</code> relation are additionally taken into account when determining the
	 * value for the <code>aria-required</code> attribute.
	 *
	 * Additionally, the associations <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code> are used to
	 * determine the lists of IDs for the ARIA attributes <code>aria-describedby</code> and
	 * <code>aria-labelledby</code>.
	 *
	 * Label controls that reference the given element in their <code>labelFor</code> relation are automatically
	 * added to the <code>aria-labelledby</code> attribute.
	 *
	 * Note: This function is only a heuristic of a control property to ARIA attribute mapping. Control developers
	 * have to check whether it fulfills their requirements. In case of problems (for example the <code>RadioButton</code> has a
	 * <code>selected</code> property but must provide an <code>aria-checked</code> attribute) the auto-generated
	 * result of this function can be influenced via the parameter <code>mProps</code> as described below.
	 *
	 * The parameter <code>mProps</code> can be used to either provide additional attributes which should be rendered
	 * and/or to avoid the automatic generation of single ARIA attributes. The 'aria-' prefix will be prepended
	 * automatically to the keys (Exception: Attribute <code>role</code> does not get the prefix 'aria-').
	 *
	 *
	 * Examples:<br>
	 * <code>{hidden : true}</code> results in <code>aria-hidden="true"</code> independent of the presence or
	 * absence of the visibility property.<br>
	 * <code>{hidden : null}</code> ensures that no <code>aria-hidden</code> attribute is written independent
	 * of the presence or absence of the visibility property.<br>
	 *
	 * The function behaves in the same way for the associations <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code>.
	 * To append additional values to the auto-generated <code>aria-describedby</code> and <code>aria-labelledby</code>
	 * attributes, the following format can be used:
	 * <pre>
	 *   {describedby : {value: "id1 id2", append: true}} =>  aria-describedby = "ida idb id1 id2"
	 * </pre>
	 * (assuming that "ida idb" is the auto-generated part based on the association <code>ariaDescribedBy</code>).
	 *
	 * @param {sap.ui.core.Element}
	 *            [oElement] The <code>Element</code> whose accessibility state should be rendered
	 * @param {object}
	 *            [mProps] A map of additional properties that should be added or changed.
	 * @ui5-omissible-params oElement
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.accessibilityState = function(oElement, mProps) {
		if (!ControlBehavior.isAccessibilityEnabled()) {
			return this;
		}

		if (arguments.length == 1 && !(BaseObject.isObjectA(oElement, 'sap.ui.core.Element'))) {
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
				return v === null || type === "number" || type === "string" || type === "boolean";
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
			Object.assign(mAriaProps, prop);
		}

		// allow parent (e.g. FormElement) to overwrite or enhance aria attributes
		if (BaseObject.isObjectA(oElement, 'sap.ui.core.Element')) {
			var oParent = oElement.getParent();
			if (oParent && oParent.enhanceAccessibilityState) {
				var mOldAriaProps = Object.assign({}, mAriaProps);
				oParent.enhanceAccessibilityState(oElement, mAriaProps);

				// disable the rendering skip in case of parent#enhanceAccessibilityState
				// disallows or changes the accessibility state of the child control
				if (mAriaProps.canSkipRendering == false
					|| (
						mAriaProps.canSkipRendering == undefined
						&& BaseObject.isObjectA(oElement, "sap.ui.core.Control")
						&& RenderManager.canSkipRendering(oElement)
						&& JSON.stringify(mOldAriaProps) != JSON.stringify(mAriaProps)
					)
				) {
					this.attr(ATTR_DO_NOT_SKIP_RENDERING_MARKER, "");
				}

				// delete the canSkipRendering marker in case of it exist
				delete mAriaProps.canSkipRendering;
			}
		}

		for (var p in mAriaProps) {
			if (mAriaProps[p] != null && mAriaProps[p] !== "") { //allow 0 and false but no null, undefined or empty string
				this.attr(p === "role" ? p : "aria-" + p, mAriaProps[p]);
			}
		}

		return this;
	};

	/**
	 * Collects accessibility related attributes for an <code>Element</code> and renders them as part of
	 * the currently rendered DOM element.
	 *
	 * See the WAI-ARIA specification for a general description of the accessibility related attributes.
	 * Attributes are only rendered when the accessibility feature is activated in the UI5 runtime configuration.
	 *
	 * The values for the attributes are collected from the following sources (last one wins):
	 * <ol>
	 * <li>from the properties and associations of the given <code>oElement</code>, using a heuristic mapping
	 *     (described below)</li>
	 * <li>from the <code>mProps</code> parameter, as provided by the caller</li>
	 * <li>from the parent of the given <code>oElement</code>, if it has a parent and if the parent implements
	 *     the method {@link sap.ui.core.Element#enhanceAccessibilityState enhanceAccessibilityState}</li>
	 * </ol>
	 * If no <code>oElement</code> is given, only <code>mProps</code> will be taken into account.
	 *
	 *
	 * <h3>Heuristic Mapping</h3>
	 * The following mapping from properties/values to ARIA attributes is used (if the element does have such properties):
	 * <ul>
	 * <li><code>editable===false</code> => <code>aria-readonly="true"</code></li>
	 * <li><code>enabled===false</code> => <code>aria-disabled="true"</code></li>
	 * <li><code>visible===false</code> => <code>aria-hidden="true"</code></li>
	 * <li><code>required===true</code> => <code>aria-required="true"</code></li>
	 * <li><code>selected===true</code> => <code>aria-selected="true"</code></li>
	 * <li><code>checked===true</code> => <code>aria-checked="true"</code></li>
	 * </ul>
	 *
	 * In case of the <code>required</code> property, all label controls which reference the given element
	 * in their <code>labelFor</code> relation are additionally taken into account when determining the
	 * value for the <code>aria-required</code> attribute.
	 *
	 * Additionally, the associations <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code> are used to
	 * determine the lists of IDs for the ARIA attributes <code>aria-describedby</code> and
	 * <code>aria-labelledby</code>.
	 *
	 * Label controls that reference the given element in their <code>labelFor</code> relation are automatically
	 * added to the <code>aria-labelledby</code> attribute.
	 *
	 * Note: This function is only a heuristic of a control property to ARIA attribute mapping. Control developers
	 * have to check whether it fulfills their requirements. In case of problems (for example the <code>RadioButton</code> has a
	 * <code>selected</code> property but must provide an <code>aria-checked</code> attribute) the auto-generated
	 * result of this function can be influenced via the parameter <code>mProps</code> as described below.
	 *
	 * The parameter <code>mProps</code> can be used to either provide additional attributes which should be rendered
	 * and/or to avoid the automatic generation of single ARIA attributes. The 'aria-' prefix will be prepended
	 * automatically to the keys (Exception: Attribute <code>role</code> does not get the prefix 'aria-').
	 *
	 *
	 * Examples:<br>
	 * <code>{hidden : true}</code> results in <code>aria-hidden="true"</code> independent of the presence or
	 * absence of the visibility property.<br>
	 * <code>{hidden : null}</code> ensures that no <code>aria-hidden</code> attribute is written independent
	 * of the presence or absence of the visibility property.<br>
	 *
	 * The function behaves in the same way for the associations <code>ariaDescribedBy</code> and <code>ariaLabelledBy</code>.
	 * To append additional values to the auto-generated <code>aria-describedby</code> and <code>aria-labelledby</code>
	 * attributes, the following format can be used:
	 * <pre>
	 *   {describedby : {value: "id1 id2", append: true}} =>  aria-describedby = "ida idb id1 id2"
	 * </pre>
	 * (assuming that "ida idb" is the auto-generated part based on the association <code>ariaDescribedBy</code>).
	 *
	 * @param {sap.ui.core.Element}
	 *            [oElement] The <code>Element</code> whose accessibility state should be rendered
	 * @param {object}
	 *            [mProps] A map of additional properties that should be added or changed.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#accessibilityState} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
	 * @function
	 */
	RenderManager.prototype.writeAccessibilityState = RenderManager.prototype.accessibilityState;


	/**
	 * Writes either an &lt;img&gt; tag for normal URI or a &lt;span&gt; tag with needed properties for an icon URI.
	 *
	 * Additional classes and attributes can be added to the tag with the second and third parameter.
	 * All of the given attributes are escaped when necessary for security consideration.
	 *
	 * When an &lt;img&gt; tag is rendered, the following two attributes are added by default
	 * and can be overwritten with corresponding values in the <code>mAttributes</code> parameter:
	 * <ul>
	 * <li><code>role: "presentation"</code></Li>
	 * <li><code>alt: ""</code></li>
	 * </ul>
	 *
	 * <b>Note:</b> This function requires the {@link sap.ui.core.IconPool} module. Ensure that the module is
	 * loaded before this function is called to avoid syncXHRs.
	 *
	 * @param {sap.ui.core.URI} sURI URI of an image or of an icon registered in {@link sap.ui.core.IconPool}
	 * @param {array|string} [aClasses] Additional classes that are added to the rendered tag
	 * @param {object} [mAttributes] Additional attributes that will be added to the rendered tag.
	 * Currently the attributes <code>class</code> and <code>style</code> are not allowed
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	RenderManager.prototype.icon = function(sURI, aClasses, mAttributes){
		var IconPool = sap.ui.require("sap/ui/core/IconPool");
		if (!IconPool) {
			Log.warning("Synchronous loading of IconPool due to sap.ui.core.RenderManager#icon call. " +
				"Ensure that 'sap/ui/core/IconPool is loaded before this function is called" , "SyncXHR", null, function() {
				return {
					type: "SyncXHR",
					name: "rendermanager-icon"
				};
			});
			IconPool = sap.ui.requireSync("sap/ui/core/IconPool"); // legacy-relevant: Sync fallback
		}

		var bIconURI = IconPool.isIconURI(sURI),
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

		mAttributes = extend(mDefaultAttributes, mAttributes);

		if (!mAttributes.id) {
			mAttributes.id = uid();
		}

		if (mAttributes.role === "presentation") {
			mAttributes["aria-hidden"] = true;
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
				this.openEnd();
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since 1.92. Instead use {@link sap.ui.core.RenderManager#icon} of the {@link sap.ui.core.RenderManager Semantic Rendering API}.
	 * @function
	 */
	RenderManager.prototype.writeIcon = RenderManager.prototype.icon;


	/**
	 * Returns the renderer class for a given control instance
	 *
	 * @param {sap.ui.core.Control} oControl the control that should be rendered
	 * @returns {sap.ui.core.ControlRenderer} the renderer class for a given control instance
	 * @public
	 */
	RenderManager.prototype.getRenderer = function(oControl) {
		assert(oControl && BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");
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
	 * @returns {object} the renderer class for a given control instance
	 * @static
	 * @public
	 */
	RenderManager.getRenderer = function(oControl) {
		assert(oControl && BaseObject.isObjectA(oControl, 'sap.ui.core.Control'), "oControl must be an sap.ui.core.Control");

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
			oDomNode.offsetHeight; // force repaint
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
			$preserve = jQuery("<div></div>",{"aria-hidden":"true",id:ID_PRESERVE_AREA}).
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
		var $Placeholder = jQuery("<div></div>", { id: RenderPrefixes.Dummy + node.id}).addClass("sapUiHidden");
		if (node.hasAttribute(ATTR_DO_NOT_SKIP_RENDERING_MARKER)) {
			$Placeholder.attr(ATTR_DO_NOT_SKIP_RENDERING_MARKER, "");
		}
		$Placeholder.insertBefore(node);
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
	RenderManager.preserveContent = function(oRootNode, bPreserveRoot, bPreserveNodesWithId, oControlBeforeRerender /* private */) {
		assert(typeof oRootNode === "object" && oRootNode.ownerDocument == document, "oRootNode must be a DOM element");

		Element = Element ? Element : sap.ui.require("sap/ui/core/Element");

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

		// determines whether given parameters are within the same visible control tree as well as DOM tree
		function isAncestor(oAncestor, oDescendant, oDescendantDom) {
			if (oAncestor === oDescendant) {
				return true;
			}

			for (var oParent = oDescendant.getParent(); oParent; oParent = oParent.isA("sap.ui.core.UIComponent") ? oParent.oContainer : oParent.getParent()) {
				if (oParent.isA("sap.ui.core.Control")) {
					if (!oParent.getVisible()) {
						return false;
					}

					var oParentDom = oParent.getDomRef();
					if (oParentDom && !oParentDom.contains(oDescendantDom)) {
						return false;
					}
				}

				if (oParent === oAncestor) {
					return true;
				}
			}
		}

		function check(candidate) {

			// don't process the preserve area or the static area
			if ( candidate.id === ID_PRESERVE_AREA || candidate.id === ID_STATIC_AREA ) {
				return;
			}

			var sPreserveMarker = candidate.getAttribute(ATTR_PRESERVE_MARKER);
			if ( sPreserveMarker )  { // node is marked with the preserve marker
				let oCandidateControl;
				// before the re-rendering, UIArea moves all "to-be-preserved" nodes to the preserved area
				// except the control dom nodes which must be moved to preserved area via control rendering cycle
				if ( oControlBeforeRerender ) {
					oCandidateControl = Element.getElementById(sPreserveMarker);

					// let the rendering cycle of the control handles the preserving
					// but only when the control stack and the dom stack are in sync
					if ( oCandidateControl && isAncestor(oControlBeforeRerender, oCandidateControl, candidate) ) {
						return;
					}
				}

				// always create a placeholder
				// - when the current node is the root node then we're doing a single control rerendering and need to know where to rerender
				// - when the parent DOM belongs to the preserved DOM of another control, that control needs a placeholder as well
				// - otherwise, the placeholder might be unnecessary but will be removed with the DOM removal following the current preserve
				if ( candidate === oRootNode || needsPlaceholder(candidate) ) {
					makePlaceholder(candidate);
				} else if ( oCandidateControl && candidate.hasAttribute(ATTR_DO_NOT_SKIP_RENDERING_MARKER) ) {
					// if the preservation is triggered by the UIArea and if the control cannot skip the rendering then we must ensure that
					// this control gets rendered to bring the control from preserved area to the original DOM tree. Leaving the placeholder
					// with ATTR_DO_NOT_SKIP_RENDERING_MARKER at the candicate location will ensure that parent rendering cannot be skipped.
					makePlaceholder(candidate);
				}

				FocusHandler.trackFocusForPreservedElement(candidate);

				$preserve.append(candidate);
			} else if ( bPreserveNodesWithId && candidate.id ) {

				FocusHandler.trackFocusForPreservedElement(candidate);

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
					if ( candidate.nodeType === 1 /* Node.ELEMENT_NODE */ ) {
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
	 * @returns {jQuery} a jQuery collection representing the found content
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
	 * @returns {boolean} Whether element is part of 'preserve' area
	 * @private
	 * @static
	 */
	RenderManager.isPreservedContent = function(oElement) {
		return ( oElement && oElement.getAttribute(ATTR_PRESERVE_MARKER) && oElement.parentNode && oElement.parentNode.id == ID_PRESERVE_AREA );
	};

	/**
	 * Returns the hidden area reference belonging to the current window instance.
	 *
	 * @returns {Element} The hidden area reference belonging to the current window instance.
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
	 * @returns {boolean} whether node is an 'inline template' area
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
	 * @returns {int} API version of the Renderer
	 * @private
	 * @static
	 */
	RenderManager.getApiVersion = function(oRenderer) {
		return (oRenderer && oRenderer.hasOwnProperty("apiVersion")) ? oRenderer.apiVersion : 1;
	};

	/**
	 * Indicates whether the control can skip the rendering.
	 *
	 * To skip the rendering:
	 *  1 - The own apiVersion property of the control renderer must be set to 4
	 *  2 - There must be no rendering related delegates belong to the control
	 *
	 * iUpdateDom options for the RENDER_ALWAYS dom marker:
	 *  0 : The DOM marker is not needed e.g. during the rendering
	 *  1 : Update the DOM marker only if the control's apiVersion is 4
	 *  2 : Always set the DOM marker independent of the control's apiVersion
	 *
	 * @param {sap.ui.core.Control} oControl The <code>Control</code> instance
	 * @param {int} [iUpdateDom=0] Whether a DOM marker should be updated or not
	 * @returns {boolean}
	 * @private
	 * @static
	 * @ui5-restricted sap.ui.core
	 */
	RenderManager.canSkipRendering = function(oControl, iUpdateDom) {
		var oRenderer = this.getRenderer(oControl);
		var bApiVersion4 = this.getApiVersion(oRenderer) == 4;
		if (!bApiVersion4 && iUpdateDom != 2) {
			return false;
		}

		var bSkipRendering = bApiVersion4 && !oControl.hasRenderingDelegate();
		if (iUpdateDom) {
			var oDomRef = oControl.getDomRef();
			if (oDomRef) {
				oDomRef.toggleAttribute(ATTR_DO_NOT_SKIP_RENDERING_MARKER, !bSkipRendering);
			}
		}

		return bSkipRendering;
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

		if (BaseObject.isObjectA(oElement, "sap.ui.core.Control") && !RenderManager.canSkipRendering(oElement)) {
			oRm.attr(ATTR_DO_NOT_SKIP_RENDERING_MARKER, "");
		}

		if (oElement.__slot) {
			oRm.attr("slot", oElement.__slot);
		}

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



	/**
	 * Inserts a given Node or HTML string at a given position relative to the provided HTML element.
	 *
	 * <!-- before : beforebegin -->
	 * <p>
	 *     <!-- prepend : afterbegin -->
	 *     foo
	 *     <!-- append : beforeend -->
	 * </p>
	 * <!-- after : afterend -->
	 *
	 * @param {HTMLElement} oElement The reference HTML element which the API is invoked upon
	 * @param {string} sPosition The insertion position "before", "after", "append", "prepend"
	 * @param {string|Node} vHTMLorNode The Node or HTML string to be inserted
	 * @private
	 */
	var mAdjacentMap = { before: "beforebegin", prepend: "afterbegin", append: "beforeend", after: "afterend" };
	function insertAdjacent(oElement, sPosition, vHTMLorNode) {
		if (typeof vHTMLorNode == "string")  {
			oElement.insertAdjacentHTML(mAdjacentMap[sPosition], vHTMLorNode);
		} else {
			oElement[sPosition](vHTMLorNode);
		}
	}

	/**
	 * Returns the renderer that should be used for the provided control in its current state.
	 *
	 * If the control is invisible and inherits its visible property from the sap.ui.core.Control
	 * then returns the InvisibleRenderer otherwise the renderer of the provided control class.
	 *
	 * @param {sap.ui.core.Control} oControl The <code>Control</code> instance
	 * @returns {object} Either InvisibleRenderer or the renderer of the control class
	 * @private
	 */
	function getCurrentRenderer(oControl) {
		var oMetadata = oControl.getMetadata();
		var bUsesInvisibleRenderer = (!oControl.getVisible() && oMetadata.getProperty("visible")._oParent.getName() == "sap.ui.core.Control");

		return bUsesInvisibleRenderer ? InvisibleRenderer : oMetadata.getRenderer();
	}

	return RenderManager;

}, true);
