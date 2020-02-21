/*!
 * ${copyright}
 */

// Provides base class sap.ui.core.Control for all controls
sap.ui.define([
	'./CustomStyleClassSupport',
	'./Element',
	'./UIArea',
	'./RenderManager',
	'./BusyIndicatorUtils',
	'./BlockLayerUtils',
	"sap/base/Log",
	"sap/ui/performance/trace/Interaction",
	"sap/ui/thirdparty/jquery"
],
	function(
		CustomStyleClassSupport,
		Element,
		UIArea,
		RenderManager,
		BusyIndicatorUtils,
		BlockLayerUtils,
		Log,
		Interaction,
		jQuery
	) {
	"use strict";

	// soft dependency
	var ResizeHandler;

	/**
	 * Creates and initializes a new control with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 * @public
	 *
	 * @class Base Class for Controls.
	 *
	 * Controls provide the following features:
	 * <ul>
	 * <li><b>Rendering</b>: the <code>RenderManager</code> only expects instances of class <code>Control</code>
	 *     in its {@link sap.ui.core.RenderManager#renderControl renderControl} method.
	 *     By convention, each control class has an associated static class that takes care of rendering
	 *     the control (its 'Renderer').</li>
	 * <li><b>show / hide</b>: a control can be hidden, although it is still part of the control tree,
	 *     see property {@link #getVisible visible}</li>
	 * <li><b>local busy indicator</b>: marks a control visually as 'busy', see properties {@link #getBusy busy}
	 *     and {@link #getBusyIndicatorDelay busyIndicatorDelay}</li>
	 * <li><b>field groups</b>: by assigning the same group ID to a set of editable controls, they form a
	 *     group which can be validated together. See property {@link #getFieldGroupIds fieldGroupIds}
	 *     and event {@link #event:validateFieldGroup validateFieldGroup}.
	 *     The term <i>field</i> was chosen as most often this feature will be used to group editable
	 *     fields in a form.</li>
	 *     See the documentation for {@link topic:5b0775397e394b1fb973fa207554003e Field Groups} for more details.
	 * <li><b>custom style classes</b>: all controls allow to add custom CSS classes to their rendered DOM
	 *     without modifying their renderer code. See methods {@link #addStyleClass addStyleClass},
	 *     {@link #removeStyleClass removeStyleClass}, {@link #toggleStyleClass toggleStyleClass}
	 *     and {@link #hasStyleClass hasStyleClass}.</br>
	 *     The necessary implementation is encapsulated in {@link sap.ui.core.CustomStyleClassSupport
	 *     CustomStyleClassSupport} and can be applied to selected element classes as well.</li>
	 * <li><b>browser events</b>: by calling the methods {@link #attachBrowserEvent attachBrowserEvent} and
	 *     {@link #detachBrowserEvent detachBrowserEvent}, consumers can let the control class take care of
	 *     registering / de-registering a given set of event listeners to the control's root DOM node.
	 *     The framework will adapt the registration whenever the DOM node changes (e.g. before or after
	 *     rendering or when the control is destroyed).</li>
	 * </ul>
	 *
	 * See section "{@link topic:8dcab0011d274051808f959800cabf9f Developing Controls}"
	 * in the documentation for an introduction to control development.
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.Control
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Control = Element.extend("sap.ui.core.Control", /** @lends sap.ui.core.Control */ {

		metadata : {
			stereotype : "control",
			"abstract" : true,
			publicMethods: ["placeAt", "attachBrowserEvent", "detachBrowserEvent", "getControlsByFieldGroup", "triggerValidateFieldGroup", "checkFieldGroupIds"],
			library: "sap.ui.core",
			properties : {
				/**
				 * Whether the control is currently in blocked state.
				 *
				 * @deprecated since version 1.69 The blocked property is deprecated.
				 * There is no accessibility support for this property.
				 * Blocked controls should not be used inside Controls, which rely on keyboard navigation, e.g. List controls.
				 */
				"blocked" : {type: "boolean", defaultValue: false},
				/**
				 * Whether the control is currently in busy state.
				 */
				"busy" : {type: "boolean", defaultValue: false},
				/**
				 * The delay in milliseconds, after which the busy indicator will show up for this control.
				 */
				"busyIndicatorDelay" : {type: "int", defaultValue: 1000},

				/**
				 * The size of the BusyIndicator. For controls with a width smaller 3rem a
				 * <code>sap.ui.core.BusyIndicatorSize.Small</code> should be used.
				 * If the size could vary in width and the width could get smaller than 3rem, the
				 * <code>sap.ui.core.BusyIndicatorSize.Auto</code> option could be used.
				 * The default is set to <code>sap.ui.core.BusyIndicatorSize.Medium</code>
				 * For a full screen BusyIndicator use <code>sap.ui.core.BusyIndicatorSize.Large</code>.
				 * @since 1.54
				 */
				"busyIndicatorSize" : {type: "sap.ui.core.BusyIndicatorSize", defaultValue: 'Medium'},

				/**
				 * Whether the control should be visible on the screen.
				 *
				 * If set to false, a placeholder will be rendered to mark the location of the invisible
				 * control in the DOM of the current page. The placeholder will be hidden and have
				 * zero dimensions (<code>display: none</code>).
				 *
				 * Also see {@link module:sap/ui/core/InvisibleRenderer InvisibleRenderer}.
				 */
				"visible" : { type: "boolean", group : "Appearance", defaultValue: true },

				/**
				 * The IDs of a logical field group that this control belongs to.
				 *
				 * All fields in a logical field group should share the same <code>fieldGroupId</code>.
				 * Once a logical field group is left, the <code>validateFieldGroup</code> event is fired.
				 *
				 * For backward compatibility with older releases, field group IDs are syntactically not
				 * limited, but it is suggested to use only valid {@link sap.ui.core.ID}s.
				 *
				 * See {@link #attachValidateFieldGroup} or consult the
				 * {@link topic:5b0775397e394b1fb973fa207554003e Field Group} documentation.
				 *
				 * @since 1.31
				 */
				"fieldGroupIds" : { type: "string[]", defaultValue: [] }

			},
			events : {
				/**
				 * Event is fired if a logical field group defined by <code>fieldGroupIds</code> of a control was left
				 * or when the user explicitly pressed the key combination that triggers validation.
				 *
				 * By default, the <code>RETURN</code> key without any modifier keys triggers validation,
				 * see {@link #triggerValidateFieldGroup}.
				 *
				 * Listen to this event to validate data of the controls belonging to a field group.
				 * See {@link #setFieldGroupIds}, or consult the
				 * {@link topic:5b0775397e394b1fb973fa207554003e Field Group} documentation.
				 */
				validateFieldGroup : {
					enableEventBubbling:true,
					parameters : {

						/**
						 * field group IDs of the logical field groups to validate
						 */
						fieldGroupIds : {type : "string[]"}
					}
				}
			}
		},

		constructor : function(sId, mSettings) {

			// TODO initialization should happen in init
			// but many of the existing controls don't call super.init()
			// As a workaround I moved the initialization of bAllowTextSelection here
			// so that it doesn't overwrite settings in init() (e.g. ListBox)
			this.bAllowTextSelection = true;

			Element.apply(this,arguments);
			this.bOutput = this.getDomRef() != null; // whether this control has already produced output

		},

		renderer : null // Control has no renderer

	});


	/**
	 * Defines a new subclass of Control with the name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.core.Element.extend} already accepts,
	 * plus the following <code>renderer</code> property:
	 *
	 * Example:
	 * <pre>
	 * Control.extend("sap.mylib.MyControl", {
	 *   metadata : {
	 *     library : "sap.mylib",
	 *     properties : {
	 *       text : "string",
	 *       width : "sap.ui.core.CSSSize"
	 *     }
	 *   },
	 *   renderer: {
	 *     apiVersion: 2,
	 *     render: function(oRM, oControl) {
	 *       oRM.openStart("div", oControl);
	 *       oRM.style("width", oControl.getWidth());
	 *       oRM.openEnd();
	 *       oRM.text(oControl.getText());
	 *       oRM.close("div");
	 *     }
	 *   }
	 * });
	 * </pre>
	 *
	 * There are multiple ways how a renderer can be specified:
	 * <ul>
	 * <li>As a <b>plain object</b>: The object will be used to create a new renderer by using {@link
	 *     sap.ui.core.Renderer.extend} to extend the renderer of the base class of this control. The new renderer
	 *     will have the same global name as this control class with the additional suffix 'Renderer'.<br>
	 *     <b>Note:</b> The <code>Renderer.extend</code> method expects a plain object (no prototype chain).</li>
	 * <li>As a <b>function</b>: The given function will be used as <code>render</code> function of a new renderer;
	 *     the renderer will be created in the same way as described for the <i>plain object</i> case.</li>
	 * <li>As a <b>ready-made renderer</b>, e.g. imported from the corresponding renderer module. As renderers
	 *     are simple objects (not instances of a specific class), some heuristic is used to distinguish
	 *     renderers from the <i>plain object</i> case above: An object is assumed to be a ready-made renderer
	 *     when it has a <code>render</code> function and either is already exposed under the expected global
	 *     name or has an <code>extend</code> method.</li>
	 * <li>As a <b>fully qualified name</b>: The name will be looked up as a global property. If not defined, a
	 *     module name will be derived from the global name (dots replaced by slashes), the module will be required
	 *     and provides the renderer, either as AMD export or via the named global property.</li>
	 * <li><b>Omitting the <code>renderer</code> property</b> or setting it to <code>undefined</code>:
	 *     The fully qualified name of the renderer will be derived from the fully qualified name of the control
	 *     by adding the suffix "Renderer". The renderer then is retrieved in the same way as described for the
	 *     <i>fully qualified name</i> case.</li>
	 * <li><b><code>null</code> or empty string</b>: The control will have no renderer, a call to
	 *     <code>oControl.getMetadata().getRenderer()</code> will return <code>undefined</code>.</li>
	 * </ul>
	 *
	 * If the resulting renderer is incomplete (has no <code>render</code> function) or if it cannot be found at all,
	 * rendering of the control will be skipped.
	 *
	 * The <code>apiVersion: 2</code> flag is required to enable in-place rendering technology.
	 * For more information, refer to {@link sap.ui.core.RenderManager RenderManager}.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo static info to construct the metadata from
	 * @returns {function} Constructor of the newly created class
	 *
	 * @public
	 * @static
	 * @name sap.ui.core.Control.extend
	 * @function
	 */

	/**
	 * Overrides {@link sap.ui.core.Element#clone Element.clone} to clone additional
	 * internal state.
	 *
	 * The additionally cloned information contains:
	 * <ul>
	 * <li>browser event handlers attached with {@link #attachBrowserEvent}</li>
	 * <li>text selection behavior</li>
	 * <li>style classes added with {@link #addStyleClass}</li>
	 * </ul>
	 *
	 * @param {string} [sIdSuffix] a suffix to be appended to the cloned element id
	 * @param {string[]} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @return {sap.ui.core.Control} reference to the newly created clone
	 * @public
	 */
	Control.prototype.clone = function() {
		var oClone = Element.prototype.clone.apply(this, arguments);

		if ( this.aBindParameters ) {
			for (var i = 0, l = this.aBindParameters.length; i < l; i++) {
				var aParams = this.aBindParameters[i];
				oClone.attachBrowserEvent(aParams.sEventType, aParams.fnHandler, aParams.oListener !== this ? aParams.oListener : undefined);
			}
		}
		oClone.bAllowTextSelection = this.bAllowTextSelection;
		return oClone;
	};

	// must appear after clone() method and metamodel definition
	CustomStyleClassSupport.apply(Control.prototype);


	/**
	 * Checks whether the control is still active (part of the active DOM)
	 *
	 * @return {boolean} whether the control is still in the active DOM
	 * @private
	 */
	Control.prototype.isActive = function() {
		return ((this.sId ? window.document.getElementById(this.sId) : null)) != null;
	};

	/**
	 * Marks this control and its children for a re-rendering, usually because its state has changed and now differs
	 * from the rendered DOM.
	 *
	 * Managed settings (properties, aggregations, associations) automatically invalidate the corresponding object.
	 * Changing the state via the standard mutators, therefore, does not require an explicit call to <code>invalidate</code>.
	 *
	 * By default, all invalidations are buffered and processed together (asynchronously) in a new browser task.
	 *
	 * The <code>oOrigin</code> parameter was introduced to allow parent controls to limit their re-rendering to
	 * certain areas that have been invalidated by their children. As there is no strong guideline for control
	 * developers whether or not to provide the parameter, it is not a reliable source of information. It is,
	 * therefore, not recommended in general to use it, only in scenarios where a control and its descendants
	 * know each other very well (e.g. complex controls where parent and children have the same code owner).
	 *
	 * @param {sap.ui.base.ManagedObject} [oOrigin] Child control for which the method was called
	 * @protected
	 */
	Control.prototype.invalidate = function(oOrigin) {
		var oUIArea;
		if ( this.bOutput && (oUIArea = this.getUIArea()) ) {
			// if this control has been rendered before (bOutput)
			// and if it is contained in a UIArea (!!oUIArea)
			// then control re-rendering can be used (see UIArea.rerender() for details)
			//
			// The check for bOutput is necessary as the control
			// re-rendering needs to identify the previous rendering results.
			// Otherwise it wouldn't be able to replace them.
			//
			// Note about destroy(): when this control is currently in the process of being
			// destroyed, registering it for an autonomous re-rendering doesn't make sense.
			// In most cases, invalidation of the parent also doesn't make sense,
			// but there might be composite controls that rely on being invalidated when
			// a child is destroyed, so we keep the invalidation propagation untouched.
			if ( !this._bIsBeingDestroyed ) {
				oUIArea.addInvalidatedControl(this);
			}
		} else {
			// else we bubble up the hierarchy
			var oParent = this.getParent();
			if (oParent && (
					this.bOutput /* && !this.getUIArea() */ ||
					/* !this.bOutput && */ !(this.getVisible && this.getVisible() === false))) {

				// Note: the two comments in the condition above show additional conditions
				//       that help to understand the logic. As they are always fulfilled,
				//       they have been omitted for better performance.
				//
				// If this control has a parent but either
				//  - has produced output before ('this.bOutput') but is not part of a UIArea (!this.getUIArea())
				//  - or if it didn't produce output (!this.bOutput') before and is/became visible
				// then invalidate the parent to request re-rendering
				//
				// The first commented condition is always true, otherwise the initial if condition
				// in this method would have been met. The second one must be true as well because of the
				// short evaluation logic of JavaScript. When bOutput is true the second half of the Or won't be processed.

				oParent.invalidate(this);
			}
		}
	};

	/**
	 * Synchronously updates the DOM of this control to reflect the current object state.
	 *
	 * Note that this method can only be called when the control already has a DOM representation (it has
	 * been rendered before) and when the control still is assigned to a UIArea.
	 *
	 * @deprecated As of 1.70, using this method is no longer recommended, but still works. Synchronous DOM
	 *   updates via this method have several drawbacks: they only work when the control has been rendered
	 *   before (no initial rendering possible), multiple state changes won't be combined automatically into
	 *   a single re-rendering, they might cause additional layout trashing, standard invalidation might
	 *   cause another async re-rendering.
	 *
	 *   The recommended alternative is to rely on invalidation and standard re-rendering.
	 * @protected
	 */
	Control.prototype.rerender = function() {
		UIArea.rerenderControl(this);
	};

	// @see sap.ui.core.Element#getDomRef
	Control.prototype.getDomRef = function(sSuffix) {
		// while cloning we know that control DOM does not exist
		if (this.bOutput === false && !this.oParent) {
			return null;
		}

		return Element.prototype.getDomRef.call(this, sSuffix);
	};

	/**
	 * Defines whether the user can select text inside this control.
	 * Defaults to <code>true</code> as long as this method has not been called.
	 *
	 * <b>Note:</b>This only works in IE and Safari; for Firefox the element's style must
	 * be set to:
	 * <pre>
	 *   -moz-user-select: none;
	 * </pre>
	 * in order to prevent text selection.
	 *
	 * @param {boolean} bAllow whether to allow text selection or not
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.allowTextSelection = function(bAllow) {
		this.bAllowTextSelection = bAllow;
		return this;
	};

	/**
	 * The string given as "sStyleClass" will be added to the "class" attribute of this control's root HTML element.
	 *
	 * This method is intended to be used to mark controls as being of a special type for which
	 * special styling can be provided using CSS selectors that reference this style class name.
	 *
	 * <pre>
	 * Example:
	 *    myButton.addStyleClass("myRedTextButton"); // add a CSS class to one button instance
	 *
	 * ...and in CSS:
	 *    .myRedTextButton {
	 *       color: red;
	 *    }
	 * </pre>
	 *
	 * This will add the CSS class "myRedTextButton" to the Button HTML and the CSS code above will then
	 * make the text in this particular button red.
	 *
	 * Only characters allowed inside HTML attributes are allowed.
	 * Quotes are not allowed and this method will ignore any strings containing quotes.
	 * Strings containing spaces are interpreted as multiple custom style classes which are split by space and can be removed
	 * individually later by calling removeStyleClass.
	 * Multiple calls with the same sStyleClass will have no different effect than calling once.
	 * If sStyleClass is null, empty string or it contains quotes, the call is ignored.
	 *
	 * @name sap.ui.core.Control.prototype.addStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the CSS class name to be added
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * Removes the given string from the list of custom style classes that have been set previously.
	 * Regular style classes like "sapUiBtn" cannot be removed.
	 *
	 * @name sap.ui.core.Control.prototype.removeStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the style to be removed
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * The string given as "sStyleClass" will be be either added to or removed from the "class" attribute of this control's root HTML element,
	 * depending on the value of "bAdd": if bAdd is true, sStyleClass will be added.
	 * If bAdd is not given, sStyleClass will be removed if it is currently present and will be added if not present.
	 * If sStyleClass is null or empty string, the call is ignored.
	 *
	 * See addStyleClass and removeStyleClass for further documentation.
	 *
	 * @name sap.ui.core.Control.prototype.toggleStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the CSS class name to be added or removed
	 * @param {boolean} bAdd whether sStyleClass should be added (or removed); when this parameter is not given, sStyleClass will be toggled (removed, if present, and added if not present)
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */

	/**
	 * Returns true if the given style class or all multiple style classes which are generated by splitting the given string with space are already set on the control
	 * via previous call(s) to addStyleClass().
	 *
	 * @name sap.ui.core.Control.prototype.hasStyleClass
	 * @function
	 *
	 * @param {string} sStyleClass the style to check for
	 * @type boolean
	 * @return whether the given style(s) has been set before
	 * @public
	 */


	/**
	 * Allows binding handlers for any native browser event to the root HTML element of this Control. This internally handles
	 * DOM element replacements caused by re-rendering.
	 *
	 * <b>IMPORTANT:</b></br>
	 * This should be only used as FALLBACK when the Control events do not cover a specific use-case! Always try using
	 * SAPUI5 control events, as e.g. accessibility-related functionality is then provided automatically.
	 * E.g. when working with a <code>sap.ui.commons.Button</code>, always use the Button's "press" event, not the native "click" event, because
	 * "press" is also guaranteed to be fired when certain keyboard activity is supposed to trigger the Button.
	 *
	 * In the event handler, <code>this</code> refers to the Control - not to the root DOM element like in jQuery. While the DOM element can
	 * be used and modified, the general caveats for working with SAPUI5 control DOM elements apply. In particular the DOM element
	 * may be destroyed and replaced by a new one at any time, so modifications that are required to have permanent effect may not
	 * be done. E.g. use {@link #addStyleClass} instead if the modification is of visual nature.
	 *
	 * Use {@link #detachBrowserEvent} to remove the event handler(s) again.
	 *
	 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] A function to execute each time the event is triggered.
	 * @param {object} [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.attachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof fnHandler === "function") {   // also do nothing if the second parameter is not a function
				// store the parameters for bind()
				if (!this.aBindParameters) {
					this.aBindParameters = [];
				}
				oListener = oListener || this;

				// FWE jQuery.proxy can't be used as it breaks our contract when used with same function but different listeners
				var fnProxy = fnHandler.bind(oListener);

				this.aBindParameters.push({
					sEventType: sEventType,
					fnHandler: fnHandler,
					oListener: oListener,
					fnProxy : fnProxy
				});

				if (!this._sapui_bInAfterRenderingPhase) {
					// if control is rendered, directly call bind()
					this.$().bind(sEventType, fnProxy);
				}
			}
		}

		return this;
	};


	/**
	 * Removes event handlers which have been previously attached using {@link #attachBrowserEvent}.
	 *
	 * Note: listeners are only removed, if the same combination of event type, callback function
	 * and context object is given as in the call to <code>attachBrowserEvent</code>.
	 *
	 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] The function that is to be no longer executed.
	 * @param {object} [oListener] The context object that was given in the call to <code>attachBrowserEvent</code>.
	 * @public
	 */
	Control.prototype.detachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof (fnHandler) === "function") {   // also do nothing if the second parameter is not a function
				var $ = this.$(),i,oParamSet;
				oListener = oListener || this;

				// remove the bind parameters from the stored array
				if (this.aBindParameters) {
					for (i = this.aBindParameters.length - 1; i >= 0; i--) {
						oParamSet = this.aBindParameters[i];
						if ( oParamSet.sEventType === sEventType  && oParamSet.fnHandler === fnHandler  &&  oParamSet.oListener === oListener ) {
							this.aBindParameters.splice(i, 1);
							// if control is rendered, directly call unbind()
							$.unbind(sEventType, oParamSet.fnProxy);
						}
					}
				}

			}
		}

		return this;
	};



	/**
	 * Returns a renderer for this control instance.
	 *
	 * It is retrieved using the RenderManager as done during rendering.
	 *
	 * @return {object} a Renderer suitable for this Control instance.
	 * @protected
	 */
	Control.prototype.getRenderer = function () {
		return RenderManager.getRenderer(this);
	};

	/**
	 * Puts <code>this</code> control into the specified container (<code>oRef</code>) at the given
	 * position (<code>oPosition</code>).
	 *
	 * First it is checked whether <code>oRef</code> is a container element / control (has a
	 * multiple aggregation with type <code>sap.ui.core.Control</code> and name 'content') or is an Id String
	 * of such a container.
	 * If this is not the case <code>oRef</code> can either be a Dom Reference or Id String of the UIArea
	 * (if it does not yet exist implicitly a new UIArea is created),
	 *
	 * The <code>oPosition</code> can be one of the following:
	 *
	 * <ul>
	 *  <li>"first": The control is added as the first element to the container.</li>
	 *  <li>"last": The control is added as the last element to the container (default).</li>
	 *  <li>"only": All existing children of the container are removed (not destroyed!) and the control is added as new child.</li>
	 *  <li><i>index</i>: The control is added at the specified <i>index</i> to the container.</li>
	 * </ul>
	 *
	 * @param {string|Element|sap.ui.core.Control} oRef container into which the control should be put
	 * @param {string|int} [vPosition="last"] Describes the position where the control should be put into the container
	 * @return {sap.ui.core.Control} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.placeAt = function(oRef, vPosition) {
		var oCore = sap.ui.getCore();
		if (oCore.isInitialized()) {
			// core already initialized, do it now

			// 1st try to resolve the oRef as a Container control
			var oContainer = oRef;
			if (typeof oContainer === "string") {
				oContainer = oCore.byId(oRef);
			}
			// if no container control is found use the corresponding UIArea
			var bIsUIArea = false;
			if (!(oContainer instanceof Element)) {
				oContainer = oCore.createUIArea(oRef);
				bIsUIArea = true;
			}

			if (!oContainer) {
				return this;
			}

			if (!bIsUIArea) {
				var oContentAggInfo = oContainer.getMetadata().getAggregation("content");
				var bContainerSupportsPlaceAt = true;

				if (oContentAggInfo) {
					if (!oContentAggInfo.multiple || oContentAggInfo.type != "sap.ui.core.Control") {
						bContainerSupportsPlaceAt = false;
					}
				} else if (!oContainer.addContent ||
						!oContainer.insertContent ||
						!oContainer.removeAllContent) {
					//Temporary workaround for sap.ui.commons.AbsoluteLayout to enable
					// placeAt even when no content aggregation is available.
					// TODO: Find a proper solution
					bContainerSupportsPlaceAt = false;
				}
				if (!bContainerSupportsPlaceAt) {
					Log.warning("placeAt cannot be processed because container " + oContainer + " does not have an aggregation 'content'.");
					return this;
				}
			}

			if (typeof vPosition === "number") {
				oContainer.insertContent(this, vPosition);
			} else {
				vPosition = vPosition || "last"; //"last" is default
				switch (vPosition) {
					case "last":
						oContainer.addContent(this);
						break;
					case "first":
						oContainer.insertContent(this, 0);
						break;
					case "only":
						oContainer.removeAllContent();
						oContainer.addContent(this);
						break;
					default:
						Log.warning("Position " + vPosition + " is not supported for function placeAt.");
				}
			}
		} else {
			// core not yet initialized, defer execution
			var that = this;
			oCore.attachInitEvent(function () {
				that.placeAt(oRef, vPosition);
			});
		}
		return this;
	};

	/*
	 * Event handling
	 */

	/**
	 * Cancels user text selection if text selection is disabled for this control.
	 * See the {@link #allowTextSelection} method.
	 * @private
	 */
	Control.prototype.onselectstart = function (oBrowserEvent) {
		if (!this.bAllowTextSelection) {
			oBrowserEvent.preventDefault();
			oBrowserEvent.stopPropagation();
		}
	};

	/*
	 * Rendering
	 */

	/**
	 * Function is called before the rendering of the control is started.
	 *
	 * Applications must not call this hook method directly, it is called by the framework.
	 *
	 * Subclasses of Control should override this hook to implement any necessary actions before the rendering.
	 *
	 * @protected
	 */
	Control.prototype.onBeforeRendering = function() {
		// Before adding any implementation, please remember that this method was first implemented in release 1.54.
		// Therefore, many subclasses will not call this method at all.
	};

	/**
	 * Function is called when the rendering of the control is completed.
	 *
	 * Applications must not call this hook method directly, it is called by the framework.
	 *
	 * Subclasses of Control should override this hook to implement any necessary actions after the rendering.
	 *
	 * @protected
	 */
	Control.prototype.onAfterRendering = function() {
		// Before adding any implementation, please remember that this method was first implemented in release 1.54.
		// Therefore, many subclasses will not call this method at all.
	};

	/**
	 * Returns the DOMNode Id to be used for the "labelFor" attribute of the label.
	 *
	 * By default, this is the Id of the control itself.
	 *
	 * @return {string} Id to be used for the <code>labelFor</code>
	 * @public
	 */
	Control.prototype.getIdForLabel = function () {
		return this.getId();
	};

	Control.prototype.destroy = function(bSuppressInvalidate) {
		// ignore repeated calls
		if (this.bIsDestroyed) {
			return;
		}

		// avoid rerendering
		this._bIsBeingDestroyed = true;

		//Cleanup Busy Indicator
		this._cleanupBusyIndicator();

		// do not load ResizeHandler - if it isn't there, there should be no resize handler registrations
		ResizeHandler = ResizeHandler || sap.ui.require("sap/ui/core/ResizeHandler");
		if ( ResizeHandler ) {
			ResizeHandler.deregisterAllForControl(this.getId());
		}

		// Controls can have their visible-property set to "false" in which case the Element's destroy method will
		// fail to remove the placeholder content from the DOM. We have to remove it here in that case
		if (!this.getVisible()) {
			var oPlaceholder = document.getElementById(RenderManager.createInvisiblePlaceholderId(this));
			if (oPlaceholder && oPlaceholder.parentNode) {
				oPlaceholder.parentNode.removeChild(oPlaceholder);
			}
		}

		Element.prototype.destroy.call(this, bSuppressInvalidate);
	};


	// ---- local busy indicator handling ---------------------------------------------------------------------------------------
	var oRenderingDelegate = {
		onBeforeRendering: function() {
			// remove all block-layers to prevent leftover DOM elements and eventhandlers
			fnRemoveAllBlockLayers.call(this);
		},
		onAfterRendering: function () {
			if (this.getBlocked() && this.getDomRef() && !this.getDomRef("blockedLayer")) {
				this._oBlockState = BlockLayerUtils.block(this, this.getId() + "-blockedLayer", this._sBlockSection);
				jQuery(this._oBlockState.$blockLayer.get(0)).addClass("sapUiBlockLayerOnly");
			}
			if (this.getBusy() && this.getDomRef() && !this._busyIndicatorDelayedCallId && !this.getDomRef("busyIndicator")) {
				// Also use the BusyIndicatorDelay when a control is initialized
				// with "busy = true". If the delayed call was already initialized
				// skip any further call if the control was re-rendered while
				// the delay is running.
				var iDelay = this.getBusyIndicatorDelay();

				// Only do it via timeout if there is a delay. Otherwise append the
				// BusyIndicator immediately
				if (iDelay) {
					this._busyIndicatorDelayedCallId = setTimeout(fnAppendBusyIndicator.bind(this), iDelay);
				} else {
					fnAppendBusyIndicator.call(this);
				}
			}
		}
	};


	/**
	 * Add busy indicator to DOM
	 *
	 * @private
	 */
	function fnAppendBusyIndicator() {

		// Only append if busy state is still set
		if (!this.getBusy()) {
			return;
		}

		var $this = this.$(this._sBusySection);

		//If there is a pending delayed call to append the busy indicator, we can clear it now
		if (this._busyIndicatorDelayedCallId) {
			clearTimeout(this._busyIndicatorDelayedCallId);
			delete this._busyIndicatorDelayedCallId;
		}

		// if no busy section/control jquery instance could be retrieved -> the control is not part of the dom anymore
		// this might happen in certain scenarios when e.g. a dialog is closed faster than the busyIndicatorDelay
		if (!$this || $this.length === 0) {
			Log.warning("BusyIndicator could not be rendered. The outer control instance is not valid anymore.");
			return;
		}

		if (this._sBlockSection === this._sBusySection) {
			if (this._oBlockState) {
				BusyIndicatorUtils.addHTML(this._oBlockState, this.getBusyIndicatorSize());

				BlockLayerUtils.toggleAnimationStyle(this._oBlockState, true);

				this._oBusyBlockState = this._oBlockState;

			} else {
				// BusyIndicator is the first blocking element created (and )
				fnAddStandaloneBusyIndicator.call(this);
			}
		} else {
			// Standalone busy indicator
			fnAddStandaloneBusyIndicator.call(this);
		}
	}

	/**
	 * Adds a standalone block-layer. Might be shared with a BusyIndicator later on.
	 */
	function fnAddStandaloneBlockLayer () {
		this._oBlockState = BlockLayerUtils.block(this, this.getId() + "-blockedLayer", this._sBlockSection);
		jQuery(this._oBlockState.$blockLayer.get(0)).addClass("sapUiBlockLayerOnly");
	}

	/**
	 * Adds a standalone BusyIndicator.
	 * The block-layer code is able to recognize that a new block-layer is not needed.
	 */
	function fnAddStandaloneBusyIndicator () {
		this._oBusyBlockState = BlockLayerUtils.block(this, this.getId() + "-busyIndicator", this._sBusySection);
		BusyIndicatorUtils.addHTML(this._oBusyBlockState, this.getBusyIndicatorSize());
	}

	/**
	 * Cleanup all block-layers.
	 * Doesn't matter if it's a busy- or regular block-layer.
	 * Used to remove all unnecessary DOM elements and event-handlers during destroy and before rerendering.
	 */
	function fnRemoveAllBlockLayers() {
		BlockLayerUtils.unblock(this._oBlockState);
		BlockLayerUtils.unblock(this._oBusyBlockState);

		delete this._oBlockState;
		delete this._oBusyBlockState;
	}

	/**
	 * Remove busy indicator from DOM
	 * @param {boolean} bForceRemoval Forces the removal of all Block layers
	 * @private
	 */
	function fnRemoveBusyIndicator(bForceRemoval) {
		// removing all block layers is done upon rerendering and destroy of the control
		if (bForceRemoval) {
			fnRemoveAllBlockLayers.call(this);
			return;
		}

		var $this = this.$(this._sBusySection);

		$this.removeClass('sapUiLocalBusy');
		//Unset the actual DOM Element´s 'aria-busy'
		$this.removeAttr('aria-busy');

		if (this._sBlockSection === this._sBusySection) {
			if (!this.getBlocked() && !this.getBusy()) {
				// Remove shared block state & busy block state reference
				fnRemoveAllBlockLayers.call(this);

			} else if (this.getBlocked()) {
				// Hide animation in shared block layer
				BlockLayerUtils.toggleAnimationStyle(this._oBlockState || this._oBusyBlockState, false);

				this._oBlockState = this._oBusyBlockState;

			} else if (this._oBusyBlockState) {
				BlockLayerUtils.unblock(this._oBusyBlockState);

				delete this._oBusyBlockState;
			}
		} else if (this._oBusyBlockState) {
			// standalone busy block state
			BlockLayerUtils.unblock(this._oBusyBlockState);

			delete this._oBusyBlockState;
		}
	}

	/**
	 * Set the controls block state.
	 *
	 * @param {boolean} bBlocked The new blocked state to be set
	 * @return {sap.ui.core.Control} <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.core, sap.m, sap.viz
	 */
	Control.prototype.setBlocked = function(bBlocked, sBlockedSection /* this is an internal parameter to apply partial blocking for a specific section of the control */) {
		//If the new state is already set, we don't need to do anything
		if (!!bBlocked == this.getProperty("blocked")) {
			return this;
		}
		this._sBlockSection = sBlockedSection || this._sBlockSection;

		//No rerendering - should be modeled as a non-invalidating property once we have that
		this.setProperty("blocked", bBlocked, /*bSuppressInvalidate*/ true);

		if (bBlocked) {
			this.addDelegate(oRenderingDelegate, false, this);
		} else {
			this.removeDelegate(oRenderingDelegate);
		}

		//If no domref exists stop here.
		if (!this.getDomRef()) {
			return this;
		}

		if (bBlocked) {
			// blocking
			if (this._sBlockSection === this._sBusySection) {
				// only create a new block state if neither busy nor blocking blockState is present
				if (!this._oBusyBlockState && !this._oBlockState) {
					fnAddStandaloneBlockLayer.call(this);
				} else {
					Log.info("The control is already busy. Hence, no new block-layer was created for the shared section.");
				}
			} else {
				fnAddStandaloneBlockLayer.call(this);
			}
		} else {
			// unblocking
			if (this._sBlockSection === this._sBusySection) {
				if (!this.getBlocked() && !this.getBusy()) {
					// Remove shared block state & busy block state reference
					fnRemoveAllBlockLayers.call(this);

				} else if (this.getBusy()) {
					// Control or section is still busy, hence no removal required
					Log.info("The control is already busy. Hence, no new block-layer was created for the shared section.");

				}
			} else if (this._oBlockState) {
				// standalone block state
				BlockLayerUtils.unblock(this._oBlockState);

				delete this._oBlockState;
			}
		}

		return this;
	};

	/**
	 * Set the controls busy state.
	 *
	 * @param {boolean} bBusy The new busy state to be set
	 * @return {sap.ui.core.Control} <code>this</code> to allow method chaining
	 * @public
	 */
	Control.prototype.setBusy = function (bBusy, sBusySection /* this is an internal parameter to apply partial local busy indicator for a specific section of the control */) {
		//If the new state is already set, we don't need to do anything
		if (!!bBusy == this.getProperty("busy")) {
			return this;
		}

		this._sBusySection = sBusySection || this._sBusySection;

		//No rerendering - should be modeled as a non-invalidating property once we have that
		this.setProperty("busy", bBusy, /*bSuppressInvalidate*/ true);

		if (bBusy) {
			Interaction.notifyShowBusyIndicator(this);
			this.addDelegate(oRenderingDelegate, false, this);
		} else {
			this.removeDelegate(oRenderingDelegate);
			//If there is a pending delayed call we clear it
			if (this._busyIndicatorDelayedCallId) {
				clearTimeout(this._busyIndicatorDelayedCallId);
				delete this._busyIndicatorDelayedCallId;
			}
		}

		//If no domref exists stop here.
		if (!this.getDomRef()) {
			return this;
		}

		if (bBusy) {
			if (this.getBusyIndicatorDelay() <= 0) {
				fnAppendBusyIndicator.call(this);
			} else {
				this._busyIndicatorDelayedCallId = setTimeout(fnAppendBusyIndicator.bind(this), this.getBusyIndicatorDelay());
			}
		} else {
			fnRemoveBusyIndicator.call(this);
			Interaction.notifyHideBusyIndicator(this);
		}
		return this;
	};

	/**
	 * Check if the control is currently in busy state.
	 *
	 * @public
	 * @deprecated As of 1.15, use {@link #getBusy} instead
	 * @return boolean
	 * @function
	 */
	Control.prototype.isBusy = Control.prototype.getBusy;

	/**
	 * Define the delay, after which the busy indicator will show up.
	 *
	 * @public
	 * @param {int} iDelay The delay in ms
	 * @return {sap.ui.core.Control} <code>this</code> to allow method chaining
	 */
	Control.prototype.setBusyIndicatorDelay = function(iDelay) {
		// should be modeled as a non-invalidating property once we have that
		this.setProperty("busyIndicatorDelay", iDelay, /*bSuppressInvalidate*/ true);
		return this;
	};

	/**
	 * Cleanup all timers which might have been created by the busy indicator.
	 *
	 * @private
	 */
	Control.prototype._cleanupBusyIndicator = function() {
		//If there is a pending delayed call we clear it
		if (this._busyIndicatorDelayedCallId) {
			clearTimeout(this._busyIndicatorDelayedCallId);
			delete this._busyIndicatorDelayedCallId;
		}
		fnRemoveBusyIndicator.call(this, true);
	};


	// ---- field groups --------------------------------------------------------------------------------------

	/**
	 * Returns a copy of the field group IDs array. Modification of the field group IDs
	 * need to call {@link #setFieldGroupIds setFieldGroupIds} to apply the changes.
	 *
	 * @name sap.ui.core.Control.prototype.getFieldGroupIds
	 * @function
	 *
	 * @return {string[]} copy of the field group IDs
	 * @public
	 */

	/**
	 * Returns a list of all child controls with a field group ID.
	 * See {@link #checkFieldGroupIds checkFieldGroupIds} for a description of the
	 * <code>vFieldGroupIds</code> parameter.
	 * Associated controls are not taken into account.
	 *
	 * @param {string|string[]} [vFieldGroupIds] ID of the field group or an array of field group IDs to match
	 * @return {sap.ui.core.Control[]} The list of controls with a field group ID
	 * @public
	 */
	Control.prototype.getControlsByFieldGroupId = function(vFieldGroupIds) {
		return this.findAggregatedObjects(true, function(oElement) {
			if (oElement instanceof Control) {
				return oElement.checkFieldGroupIds(vFieldGroupIds);
			}
			return false;
		});
	};

	/**
	 * Returns whether this control belongs to a given combination of field groups.
	 *
	 * If the <code>vFieldGroupIds</code> parameter is not specified, the method checks whether this control belongs
	 * to <strong>any</strong> field group, that is, whether any field group ID is defined for it.
	 *
	 * If a list of field group IDs is specified, either as an array of strings or as a single string (interpreted as
	 * a comma separated list of IDs), then the method will check whether this control belongs to <strong>all</strong>
	 * given field groups. Accordingly, an empty list of IDs (empty array or empty string) will always return true.
	 *
	 * Note that a string value for <code>vFieldGroupIds</code> (comma separated list) will not be trimmed.
	 * All whitespace characters are significant, but in general not recommended in field group IDs.
	 *
	 * @param {string|string[]} [vFieldGroupIds] An array of field group IDs or a single string with a comma separated list of IDs to match
	 * @return {boolean} Whether the field group IDs defined for the control match the given ones
	 * @public
	 * @see {@link #setFieldGroupIds}
	 */
	Control.prototype.checkFieldGroupIds = function(vFieldGroupIds) {
		if (typeof vFieldGroupIds === "string") {
			// normalize single field group ID or a comma separated list of field group IDs to an array
			vFieldGroupIds = vFieldGroupIds ? vFieldGroupIds.split(",") : [];
		}
		var aFieldGroups = this._getFieldGroupIds();
		if (Array.isArray(vFieldGroupIds)) {
			// all given field group IDs must be defined for the control
			return vFieldGroupIds.every(function(sFieldGroupId) {
				return aFieldGroups.indexOf(sFieldGroupId) >= 0;
			});
		} else if ( !vFieldGroupIds ) {
			// no field group ID(s) given: check if any field group is defined for the control
			return aFieldGroups.length > 0;
		}
		return false;
	};

	/**
	 * Triggers the <code>validateFieldGroup</code> event for this control.
	 *
	 * Called by <code>sap.ui.core.UIArea</code> if a field group should be validated after it lost
	 * the focus or when the key combination was pressed that was configured to trigger validation.
	 *
	 * By default, the <code>RETURN</code> key without any modifier keys triggers validation.
	 * There's no public API to change that key combination.
	 *
	 * See {@link #attachValidateFieldGroup}.
	 *
	 * @public
	 */
	Control.prototype.triggerValidateFieldGroup = function(aFieldGroupIds) {
		this.fireValidateFieldGroup({
			fieldGroupIds : aFieldGroupIds
		});
	};

	/**
	 * This function (if available on the concrete control) provides
	 * the current accessibility state of the control.
	 *
	 * Applications must not call this hook method directly, it is called by the framework.
	 *
	 * Subclasses of Control should implement this hook to provide any necessary accessibility information:
	 *
	 * <pre>
	 * MyControl.prototype.getAccessibilityInfo = function() {
	 *    return {
	 *      role: "textbox",      // String which represents the WAI-ARIA role which is implemented by the control.
	 *      type: "date input",   // String which represents the control type (Must be a translated text). Might correlate with
	 *                            // the role.
	 *      description: "value", // String which describes the most relevant control state (e.g. the inputs value). Must be a
	 *                            // translated text.
	 *                            // Note: The type and the enabled/editable state must not be handled here.
	 *      focusable: true,      // Boolean which describes whether the control can get the focus.
	 *      enabled: true,        // Boolean which describes whether the control is enabled. If not relevant it must not be set or
	 *                            // <code>null</code> can be provided.
	 *      editable: true,       // Boolean which describes whether the control is editable. If not relevant it must not be set or
	 *                            // <code>null</code> can be provided.
	 *      children: []          // Aggregations of the given control (e.g. when the control is a layout). Primitive aggregations will be ignored.
	 *                            // Note: Children should only be provided when it is helpful to understand the accessibility context
	 *                            //       (e.g. a form control must not provide details of its internals (fields, labels, ...) but a
	 *                            //       layout should).
	 *    };
	 * };
	 * </pre>
	 *
	 * Note: The returned object provides the accessibility state of the control at the point in time when this function is called.
	 *
	 * @return {object} Current accessibility state of the control.
	 * @since 1.37.0
	 * @function
	 * @name sap.ui.core.Control.prototype.getAccessibilityInfo
	 * @protected
	 */
	//Control.prototype.getAccessibilityInfo = function() { return null; };

	return Control;

});
