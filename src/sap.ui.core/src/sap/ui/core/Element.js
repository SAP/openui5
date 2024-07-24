/*!
 * ${copyright}
 */

// Provides the base class for all controls and UI elements.
sap.ui.define([
	'../base/DataType',
	'../base/Object',
	'../base/ManagedObject',
	'./ElementMetadata',
	'../Device',
	"sap/ui/dom/findTabbable",
	"sap/ui/performance/trace/Interaction",
	"sap/base/future",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/F6Navigation",
	"sap/ui/util/_enforceNoReturnValue",
	"./RenderManager",
	"./Rendering",
	"./EnabledPropagator",
	"./ElementRegistry",
	"./Theming",
	"sap/ui/core/util/_LocalizationHelper",
	/* jQuery Plugin "firstFocusableDomRef"*/
	"sap/ui/dom/jquery/Focusable",
	/* jQuery custom selectors ":sapFocusable"*/
	"sap/ui/dom/jquery/Selectors"
],
	function(
		DataType,
		BaseObject,
		ManagedObject,
		ElementMetadata,
		Device,
		findTabbable,
		Interaction,
		future,
		assert,
		jQuery,
		F6Navigation,
		_enforceNoReturnValue,
		RenderManager,
		Rendering,
		EnabledPropagator,
		ElementRegistry,
		Theming,
		_LocalizationHelper
	) {
		"use strict";

		/**
		 * Constructs and initializes a UI Element with the given <code>sId</code> and settings.
		 *
		 *
		 * <h3>Uniqueness of IDs</h3>
		 *
		 * Each <code>Element</code> must have an ID. If no <code>sId</code> or <code>mSettings.id</code> is
		 * given at construction time, a new ID will be created automatically. The IDs of all elements that exist
		 * at the same time in the same window must be different. Providing an ID which is already used by another
		 * element throws an error.
		 *
		 * When an element is created from a declarative source (e.g. XMLView), then an ID defined in that
		 * declarative source needs to be unique only within the declarative source. Declarative views will
		 * prefix that ID with their own ID (and some separator) before constructing the element.
		 * Programmatically created views (JSViews) can do the same with the {@link sap.ui.core.mvc.View#createId} API.
		 * Similarly, UIComponents can prefix the IDs of elements created in their context with their own ID.
		 * Also see {@link sap.ui.core.UIComponent#getAutoPrefixId UIComponent#getAutoPrefixId}.
		 *
		 *
		 * <h3>Settings</h3>
		 * If the optional <code>mSettings</code> are given, they must be a JSON-like object (object literal)
		 * that defines values for properties, aggregations, associations or events keyed by their name.
		 *
		 * <b>Valid Names:</b>
		 *
		 * The property (key) names supported in the object literal are exactly the (case sensitive)
		 * names documented in the JSDoc for the properties, aggregations, associations and events
		 * of the control and its base classes. Note that for  0..n aggregations and associations this
		 * usually is the plural name, whereas it is the singular name in case of 0..1 relations.
		 *
		 * Each subclass should document the set of supported names in its constructor documentation.
		 *
		 * <b>Valid Values:</b>
		 *
		 * <ul>
		 * <li>for normal properties, the value has to be of the correct simple type (no type conversion occurs)</li>
		 * <li>for 0..1 aggregations, the value has to be an instance of the aggregated control or element type</li>
		 * <li>for 0..n aggregations, the value has to be an array of instances of the aggregated type</li>
		 * <li>for 0..1 associations, an instance of the associated type or an id (string) is accepted</li>
		 * <li>0..n associations are not supported yet</li>
		 * <li>for events either a function (event handler) is accepted or an array of length 2
		 *     where the first element is a function and the 2nd element is an object to invoke the method on.</li>
		 * </ul>
		 *
		 * Special aggregation <code>dependents</code> is connected to the lifecycle management and databinding,
		 * but not rendered automatically and can be used for popups or other dependent controls or elements.
		 * This allows the definition of popup controls in declarative views and enables propagation of model
		 * and context information to them.
		 *
		 * @param {string} [sId] id for the new control; generated automatically if no non-empty id is given
		 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
		 * @param {object} [mSettings] optional map/JSON-object with initial property values, aggregated objects etc. for the new element
		 *
		 * @abstract
		 *
		 * @class Base Class for UI Elements.
		 *
		 * <code>Element</code> is the most basic building block for UI5 UIs. An <code>Element</code> has state like a
		 * <code>ManagedObject</code>, it has a unique ID by which the framework remembers it. It can have associated
		 * DOM, but it can't render itself. Only {@link sap.ui.core.Control Controls} can render themselves and also
		 * take care of rendering <code>Elements</code> that they aggregate as children. If an <code>Element</code>
		 * has been rendered, its related DOM gets the same ID as the <code>Element</code> and thereby can be retrieved
		 * via API. When the state of an <code>Element</code> changes, it informs its parent <code>Control</code> which
		 * usually re-renders then.
		 *
		 * <h3>Dispatching Events</h3>
		 *
		 * The UI5 framework already registers generic listeners for common browser events, such as <code>click</code>
		 * or <code>keydown</code>. When called, the generic listener first determines the corresponding target element
		 * using {@link jQuery#control}. Then it checks whether the element has an event handler method for the event.
		 * An event handler method by convention has the same name as the event, but prefixed with "on": Method
		 * <code>onclick</code> is the handler for the <code>click</code> event, method <code>onkeydown</code> the handler
		 * for the <code>keydown</code> event and so on. If there is such a method, it will be called with the original
		 * event as the only parameter. If the element has a list of delegates registered, their handler functions will
		 * be called the same way, where present. The set of implemented handlers might differ between element and
		 * delegates. Not each handler implemented by an element has to be implemented by its delegates, and delegates
		 * can implement handlers that the corresponding element doesn't implement.
		 *
		 * A list of browser events that are handled that way can be found in {@link module:sap/ui/events/ControlEvents}.
		 * Additionally, the framework dispatches pseudo events ({@link module:sap/ui/events/PseudoEvents}) using the same
		 * naming convention. Last but not least, some framework events are also dispatched that way, e.g.
		 * <code>BeforeRendering</code>, <code>AfterRendering</code> (only for controls) and <code>ThemeChanged</code>.
		 *
		 * If further browser events are needed, controls can register listeners on the DOM using native APIs in their
		 * <code>onAfterRendering</code> handler. If needed, they can do this for their aggregated elements as well.
		 * If events might fire often (e.g. <code>mousemove</code>), it is best practice to register them only while
		 * needed, and deregister afterwards. Anyhow, any registered listeners must be cleaned up in the
		 * <code>onBeforeRendering</code> listener and before destruction in the <code>exit</code> hook.
		 *
		 * @extends sap.ui.base.ManagedObject
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @alias sap.ui.core.Element
		 */
		var Element = ManagedObject.extend("sap.ui.core.Element", {

			metadata : {
				stereotype : "element",
				"abstract" : true,
				library : "sap.ui.core",

				aggregations : {

					/**
					 * The tooltip that should be shown for this Element.
					 *
					 * In the most simple case, a tooltip is a string that will be rendered by the control and
					 * displayed by the browser when the mouse pointer hovers over the control's DOM. In this
					 * variant, <code>tooltip</code> behaves like a simple control property.
					 *
					 * Controls need to explicitly support this kind of tooltip as they have to render it,
					 * but most controls do. Exceptions will be documented for the corresponding controls
					 * (e.g. <code>sap.ui.core.HTML</code> does not support tooltips).
					 *
					 * Alternatively, <code>tooltip</code> can act like a 0..1 aggregation and can be set to a
					 * tooltip control (an instance of a subclass of <code>sap.ui.core.TooltipBase</code>). In
					 * that case, the framework will take care of rendering the tooltip control in a popup-like
					 * manner. Such a tooltip control can display arbitrary content, not only a string.
					 *
					 * UI5 currently does not provide a recommended implementation of <code>TooltipBase</code>
					 * as the use of content-rich tooltips is discouraged by the Fiori Design Guidelines.
					 * Existing subclasses of <code>TooltipBase</code> therefore have been deprecated.
					 * However, apps can still subclass from <code>TooltipBase</code> and create their own
					 * implementation when needed (potentially taking the deprecated implementations as a
					 * starting point).
					 *
					 * See the section {@link https://experience.sap.com/fiori-design-web/using-tooltips/ Using Tooltips}
					 * in the Fiori Design Guideline.
					 */
					tooltip : {type : "sap.ui.core.TooltipBase", altTypes : ["string"], multiple : false},

					/**
					 * Custom Data, a data structure like a map containing arbitrary key value pairs.
					 */
					customData : {type : "sap.ui.core.CustomData", multiple : true, singularName : "customData"},

					/**
					 * Defines the layout constraints for this control when it is used inside a Layout.
					 * LayoutData classes are typed classes and must match the embedding Layout.
					 * See VariantLayoutData for aggregating multiple alternative LayoutData instances to a single Element.
					 */
					layoutData : {type : "sap.ui.core.LayoutData", multiple : false, singularName : "layoutData"},

					/**
					 * Dependents are not rendered, but their databinding context and lifecycle are bound to the aggregating Element.
					 * @since 1.19
					 */
					dependents : {type : "sap.ui.core.Element", multiple : true},

					/**
					 * Defines the drag-and-drop configuration.
					 * <b>Note:</b> This configuration might be ignored due to control {@link sap.ui.core.Element.extend metadata} restrictions.
					 *
					 * @since 1.56
					 */
					dragDropConfig : {type : "sap.ui.core.dnd.DragDropBase", multiple : true, singularName : "dragDropConfig"}
				},

				associations : {
					/**
					 * Reference to the element to show the field help for this control; if unset, field help is
					 * show on the control itself.
					 */
					fieldHelpDisplay : {type: "sap.ui.core.Element", multiple: false}
				}
			},

			constructor : function(sId, mSettings) {
				ManagedObject.apply(this, arguments);
				this._iRenderingDelegateCount = 0;
			},

			renderer : null // Element has no renderer

		}, /* Metadata constructor */ ElementMetadata);

		ElementRegistry.init(Element);

		/**
		 * Elements don't have a facade and therefore return themselves as their interface.
		 *
		 * @returns {this} <code>this</code> as there's no facade for elements
		 * @see sap.ui.base.Object#getInterface
		 * @public
		 */
		Element.prototype.getInterface = function() {
			return this;
		};

		/**
		 * @typedef {sap.ui.base.ManagedObject.MetadataOptions} sap.ui.core.Element.MetadataOptions
		 *
		 * The structure of the "metadata" object which is passed when inheriting from sap.ui.core.Element using its static "extend" method.
		 * See {@link sap.ui.core.Element.extend} for details on its usage.
		 *
		 * @property {boolean | sap.ui.core.Element.MetadataOptions.DnD} [dnd=false]
		 *     Defines draggable and droppable configuration of the element.
		 *     The following boolean properties can be provided in the given object literal to configure drag-and-drop behavior of the element
		 *     (see {@link sap.ui.core.Element.MetadataOptions.DnD DnD} for details): draggable, droppable
		 *     If the <code>dnd</code> property is of type Boolean, then the <code>draggable</code> and <code>droppable</code> configuration are both set to this Boolean value.
		 *
		 * @public
		 */

		/**
		 * @typedef {object} sap.ui.core.Element.MetadataOptions.DnD
		 *
		 * An object literal configuring the drag&drop capabilities of a class derived from sap.ui.core.Element.
		 * See {@link sap.ui.core.Element.MetadataOptions MetadataOptions} for details on its usage.
		 *
		 * @property {boolean} [draggable=false] Defines whether the element is draggable or not. The default value is <code>false</code>.
		 * @property {boolean} [droppable=false] Defines whether the element is droppable (it allows being dropped on by a draggable element) or not. The default value is <code>false</code>.
		 *
		 * @public
		 */

		/**
		 * Defines a new subclass of Element with the name <code>sClassName</code> and enriches it with
		 * the information contained in <code>oClassInfo</code>.
		 *
		 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
		 * plus the <code>dnd</code> property in the metadata object literal to configure drag-and-drop behavior
		 * (see {@link sap.ui.core.Element.MetadataOptions MetadataOptions} for details). Objects describing aggregations can also
		 * have a <code>dnd</code> property when used for a class extending <code>Element</code>
		 * (see {@link sap.ui.base.ManagedObject.MetadataOptions.AggregationDnD AggregationDnD}).
		 *
		 * Example:
		 * <pre>
		 * Element.extend('sap.mylib.MyElement', {
		 *   metadata : {
		 *     library : 'sap.mylib',
		 *     properties : {
		 *       value : 'string',
		 *       width : 'sap.ui.core.CSSSize'
		 *     },
		 *     dnd : { draggable: true, droppable: false },
		 *     aggregations : {
		 *       items : { type: 'sap.ui.core.Control', multiple : true, dnd : {draggable: false, droppable: true, layout: "Horizontal" } },
		 *       header : {type : "sap.ui.core.Control", multiple : false, dnd : true },
		 *     }
		 *   }
		 * });
		 * </pre>
		 *
		 * @param {string} sClassName Name of the class to be created
		 * @param {object} [oClassInfo] Object literal with information about the class
		 * @param {sap.ui.core.Element.MetadataOptions} [oClassInfo.metadata] the metadata object describing the class: properties, aggregations, events etc.
		 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.core.ElementMetadata</code>.
		 * @returns {function} Created class / constructor function
		 *
		 * @public
		 * @static
		 * @name sap.ui.core.Element.extend
		 * @function
		 */

		/**
		 * Dispatches the given event, usually a browser event or a UI5 pseudo event.
		 *
		 * @param {jQuery.Event} oEvent The event
		 * @private
		 */
		Element.prototype._handleEvent = function (oEvent) {

			var that = this,
				sHandlerName = "on" + oEvent.type;

			function each(aDelegates) {
				var i,l,oDelegate;
				if ( aDelegates && (l = aDelegates.length) > 0 ) {
					// To be robust against concurrent modifications of the delegates list, we loop over a copy.
					// When there is only a single entry, the loop is safe without a copy (length is determined only once!)
					aDelegates = l === 1 ? aDelegates : aDelegates.slice();
					for (i = 0; i < l; i++ ) {
						if (oEvent.isImmediateHandlerPropagationStopped()) {
							return;
						}
						oDelegate = aDelegates[i].oDelegate;
						if (oDelegate[sHandlerName]) {
							oDelegate[sHandlerName].call(aDelegates[i].vThis === true ? that : aDelegates[i].vThis || oDelegate, oEvent);
						}
					}
				}
			}

			each(this.aBeforeDelegates);

			if ( oEvent.isImmediateHandlerPropagationStopped() ) {
				return;
			}
			if ( this[sHandlerName] ) {
				if (oEvent._bNoReturnValue) {
					// fatal throw if listener isn't allowed to have a return value
					_enforceNoReturnValue(this[sHandlerName](oEvent), /*mLogInfo=*/{ name: sHandlerName, component: this.getId() });
				} else {
					this[sHandlerName](oEvent);
				}
			}

			each(this.aDelegates);
		};


		/**
		 * Initializes the element instance after creation.
		 *
		 * Applications must not call this hook method directly, it is called by the framework
		 * while the constructor of an element is executed.
		 *
		 * Subclasses of Element should override this hook to implement any necessary initialization.
		 *
		 * @returns {void|undefined} This hook method must not have a return value. Return value <code>void</code> is deprecated since 1.120, as it does not force functions to <b>not</b> return something.
		 * 	This implies that, for instance, no async function returning a Promise should be used.
		 *
		 * 	<b>Note:</b> While the return type is currently <code>void|undefined</code>, any
		 *	implementation of this hook must not return anything but undefined. Any other
		 * 	return value will cause an error log in this version of UI5 and will fail in future
		 * 	major versions of UI5.
		 * @protected
		 */
		Element.prototype.init = function() {
			// Before adding any implementation, please remember that this method was first implemented in release 1.54.
			// Therefore, many subclasses will not call this method at all.
			return undefined;
		};

		/**
		 * Hook method for cleaning up the element instance before destruction.
		 *
		 * Applications must not call this hook method directly, it is called by the framework
		 * when the element is {@link #destroy destroyed}.
		 *
		 * Subclasses of Element should override this hook to implement any necessary cleanup.
		 *
		 * <pre>
		 * exit: function() {
		 *     // ... do any further cleanups of your subclass e.g. detach events...
		 *     this.$().off("click", this.handleClick);
		 *
		 *     if (Element.prototype.exit) {
		 *         Element.prototype.exit.apply(this, arguments);
		 *     }
		 * }
		 * </pre>
		 *
		 * For a more detailed description how to to use the exit hook, see Section
		 * {@link topic:d4ac0edbc467483585d0c53a282505a5 exit() Method} in the documentation.
		 *
		 * @returns {void|undefined} This hook method must not have a return value. Return value <code>void</code> is deprecated since 1.120, as it does not force functions to <b>not</b> return something.
		 * 	This implies that, for instance, no async function returning a Promise should be used.
		 *
		 * 	<b>Note:</b> While the return type is currently <code>void|undefined</code>, any
		 *	implementation of this hook must not return anything but undefined. Any other
		 * 	return value will cause an error log in this version of UI5 and will fail in future
		 * 	major versions of UI5.
		 * @protected
		 */
		Element.prototype.exit = function() {
			// Before adding any implementation, please remember that this method was first implemented in release 1.54.
			// Therefore, many subclasses will not call this method at all.
			return undefined;
		};

		/**
		 * Returns a simple string representation of this element.
		 *
		 * Mainly useful for tracing purposes.
		 * @public
		 * @return {string} a string description of this element
		 */
		Element.prototype.toString = function() {
			return "Element " + this.getMetadata().getName() + "#" + this.sId;
		};


		/**
		 * Returns the best suitable DOM Element that represents this UI5 Element.
		 * By default the DOM Element with the same ID as this Element is returned.
		 * Subclasses should override this method if the lookup via id is not sufficient.
		 *
		 * Note that such a DOM Element does not necessarily exist in all cases.
		 * Some elements or controls might not have a DOM representation at all (e.g.
		 * a naive FlowLayout) while others might not have one due to their current
		 * state (e.g. an initial, not yet rendered control).
		 *
		 * If an ID suffix is given, the ID of this Element is concatenated with the suffix
		 * (separated by a single dash) and the DOM node with that compound ID will be returned.
		 * This matches the UI5 naming convention for named inner DOM nodes of a control.
		 *
		 * @param {string} [sSuffix] ID suffix to get the DOMRef for
		 * @returns {Element|null} The Element's DOM Element, sub DOM Element or <code>null</code>
		 * @protected
		 */
		Element.prototype.getDomRef = function(sSuffix) {
			return document.getElementById(sSuffix ? this.getId() + "-" + sSuffix : this.getId());
		};

		/**
		 * Returns the best suitable DOM node that represents this Element wrapped as jQuery object.
		 * I.e. the element returned by {@link sap.ui.core.Element#getDomRef} is wrapped and returned.
		 *
		 * If an ID suffix is given, the ID of this Element is concatenated with the suffix
		 * (separated by a single dash) and the DOM node with that compound ID will be wrapped by jQuery.
		 * This matches the UI5 naming convention for named inner DOM nodes of a control.
		 *
		 * @param {string} [sSuffix] ID suffix to get a jQuery object for
		 * @return {jQuery} The jQuery wrapped element's DOM reference
		 * @protected
		 */

		Element.prototype.$ = function(sSuffix) {
			return jQuery(this.getDomRef(sSuffix));
		};

		/**
		 * Checks whether this element has an active parent.
		 *
		 * @returns {boolean} Whether this element has an active parent
		 * @private
		 */
		Element.prototype.isActive = function() {
			return this.oParent && this.oParent.isActive();
		};

		/*
		 * Intercept any changes for properties named "enabled" and "visible".
		 *
		 * If a change for "enabled" property is detected, inform all descendants that use the `EnabledPropagator`
		 * so that they can recalculate their own, derived enabled state.
		 * This is required in the context of rendering V4 to make the state of controls/elements
		 * self-contained again when they're using the `EnabledPropagator` mixin.
		 *
		 * Fires "focusfail" event, if the "enabled" or "visible" property is changed to "false" and the element was focused.
		 */
		Element.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {

			if ((sPropertyName != "enabled" && sPropertyName != "visible") || bSuppressInvalidate) {
				return ManagedObject.prototype.setProperty.apply(this, arguments);
			}

			if (sPropertyName == "enabled") {
				var bOldEnabled = this.mProperties.enabled;
				ManagedObject.prototype.setProperty.apply(this, arguments);

				if (bOldEnabled != this.mProperties.enabled) {
					// the EnabledPropagator knows better which descendants to update
					EnabledPropagator.updateDescendants(this);
				}
			} else if (sPropertyName === "visible") {
				ManagedObject.prototype.setProperty.apply(this, arguments);
				if (vValue === false && this.getDomRef()?.contains(document.activeElement)) {
					Element.fireFocusFail.call(this, /*bRenderingPending=*/true);
				}
			}

			return this;
		};

		function _focusTarget(oOriginalDomRef, oFocusTarget) {
			// jQuery custom selectors ":sapFocusable"
			if (oOriginalDomRef?.contains(document.activeElement) || !jQuery(document.activeElement).is(":sapFocusable")) {
				oFocusTarget?.focus({
					preventScroll: true
				});
			}
		}

		/**
		* Handles the 'focusfail' event by attempting to find and focus on a tabbable element.
		* The 'focusfail' event is triggered when the current element, which initially holds the focus,
		* becomes disabled or invisible. The event is received by the parent of the element that failed
		* to retain the focus.
		*
		* @param {Event} oEvent - The event object containing the source element that failed to gain focus.
		* @protected
		*/
		Element.prototype.onfocusfail = function(oEvent) {
			let oDomRef = oEvent.srcControl.getDomRef();
			const oOriginalDomRef = oDomRef;

			let oParent = this;
			let oParentDomRef = oParent.getDomRef();

			let oRes;
			let oFocusTarget;

			do {
				if (oParentDomRef?.contains(oDomRef)) {
					// search tabbable element to the right
					oRes = findTabbable(oDomRef, {
						scope: oParentDomRef,
						forward: true,
						skipChild: true
					});

					// if nothing is found
					if (oRes?.startOver) {
						// search tabbable element to the left
						oRes = findTabbable(oDomRef, {
							scope: oParentDomRef,
							forward: false
						});
					}

					oFocusTarget = oRes?.element;

					if (oFocusTarget === oParentDomRef) {
						// Reached the parent DOM which is tabbable
						break;
					}

					// Continue with the parent's siblings
					oDomRef = oParentDomRef;
					oParent = oParent?.getParent();
					oParentDomRef = oParent?.getDomRef?.();
				} else {
					// The DOM Element which lost the focus isn't rendered within the parent
					// jQuery Plugin "firstFocusableDomRef"
					oFocusTarget = oParentDomRef && jQuery(oParentDomRef).firstFocusableDomRef();
					break;
				}
			} while ((!oRes || oRes.startOver) && oDomRef);

			if (oFocusTarget) {
				// In the meantime, the focus could be set somewhere else.
				// If that element is focusable, then we don't steal the focus from it
				if (oEvent._bRenderingPending) {
					Rendering.addPrerenderingTask(() => {
						_focusTarget(oOriginalDomRef, oFocusTarget);
					});
				} else {
					Promise.resolve().then(() => {
						_focusTarget(oOriginalDomRef, oFocusTarget);
					});
				}
			}

		};

		Element.prototype.insertDependent = function(oElement, iIndex) {
			this.insertAggregation("dependents", oElement, iIndex, true);
			return this; // explicitly return 'this' to fix controls that override insertAggregation wrongly
		};

		Element.prototype.addDependent = function(oElement) {
			this.addAggregation("dependents", oElement, true);
			return this; // explicitly return 'this' to fix controls that override addAggregation wrongly
		};

		Element.prototype.removeDependent = function(vElement) {
			return this.removeAggregation("dependents", vElement, true);
		};

		Element.prototype.removeAllDependents = function() {
			return this.removeAllAggregation("dependents", true);
		};

		Element.prototype.destroyDependents = function() {
			this.destroyAggregation("dependents", true);
			return this; // explicitly return 'this' to fix controls that override destroyAggregation wrongly
		};

		/**
		 * Returns the UI area of this element, if any.
		 *
		 * @return {sap.ui.core.UIArea|null} The UI area of this element or <code>null</code>
		 * @private
		 */
		Element.prototype.getUIArea = function() {
			return this.oParent ? this.oParent.getUIArea() : null;
		};

		/**
		 * Fires a "focusfail" event.
		 * The event is propagated to the parent of the current element.
		 *
		 * @private
		 */
		Element.fireFocusFail = function(bRenderingPending) {
			const oEvent = jQuery.Event("focusfail");
			oEvent.srcControl = this;
			oEvent._bRenderingPending = bRenderingPending || false;

			const oParent = this.getParent();
			oParent?._handleEvent?.(oEvent);
		};

		/**
		 * Cleans up the resources associated with this element and all its children.
		 *
		 * After an element has been destroyed, it can no longer be used in the UI!
		 *
		 * Applications should call this method if they don't need the element any longer.
		 *
		 * @param {boolean} [bSuppressInvalidate=false] If <code>true</code>, this ManagedObject and all its ancestors won't be invalidated.
		 *      <br>This flag should be used only during control development to optimize invalidation procedures.
		 *      It should not be used by any application code.
		 * @public
		 */
		Element.prototype.destroy = function(bSuppressInvalidate) {
			// ignore repeated calls
			if (this.bIsDestroyed) {
				return;
			}

			// determine whether parent exists or not
			var bHasNoParent = !this.getParent();

			// update the focus information (potentially) stored by the central UI5 focus handling
			Element._updateFocusInfo(this);

			var oDomRef = this.getDomRef();

			ManagedObject.prototype.destroy.call(this, bSuppressInvalidate);

			// wrap custom data API to avoid creating new objects
			this.data = noCustomDataAfterDestroy;

			// exit early if there is no control DOM to remove
			if (!oDomRef) {
				return;
			}

			// Determine whether to remove the control DOM from the DOM Tree or not:
			// If parent invalidation is not possible, either bSuppressInvalidate=true or there is no parent to invalidate then we must remove the control DOM synchronously.
			// Controls that implement marker interface sap.ui.core.PopupInterface are by contract not rendered by their parent so we cannot keep the DOM of these controls.
			// If the control is destroyed while its content is in the preserved area then we must remove DOM synchronously since we cannot invalidate the preserved area.
			var bKeepDom = (bSuppressInvalidate === "KeepDom");
			if (bSuppressInvalidate === true || (!bKeepDom && bHasNoParent) || this.isA("sap.ui.core.PopupInterface") || RenderManager.isPreservedContent(oDomRef)) {
				jQuery(oDomRef).remove();
			} else {
				// Make sure that the control DOM won't get preserved after it is destroyed (even if bSuppressInvalidate="KeepDom")
				oDomRef.removeAttribute("data-sap-ui-preserve");
				if (!bKeepDom) {
					// On destroy we do not remove the control DOM synchronously and just let the invalidation happen on the parent.
					// At the next tick of the RenderManager, control DOM nodes will be removed via rerendering of the parent anyway.
					// To make this new behavior more compatible we are changing the id of the control's DOM and all child nodes that start with the control id.
					oDomRef.id = "sap-ui-destroyed-" + this.getId();
					for (var i = 0, aDomRefs = oDomRef.querySelectorAll('[id^="' + this.getId() + '-"]'); i < aDomRefs.length; i++) {
						aDomRefs[i].id = "sap-ui-destroyed-" + aDomRefs[i].id;
					}
				}
			}
		};

		/*
		 * Class <code>sap.ui.core.Element</code> intercepts fireEvent calls to enforce an 'id' property
		 * and to notify others like interaction detection etc.
		 */
		Element.prototype.fireEvent = function(sEventId, mParameters, bAllowPreventDefault, bEnableEventBubbling) {
			if (this.hasListeners(sEventId)) {
				Interaction.notifyStepStart(sEventId, this);
			}

			// get optional parameters right
			if (typeof mParameters === 'boolean') {
				bEnableEventBubbling = bAllowPreventDefault;
				bAllowPreventDefault = mParameters;
				mParameters = null;
			}

			mParameters = mParameters || {};
			mParameters.id = mParameters.id || this.getId();

			if (Element._interceptEvent) {
				Element._interceptEvent(sEventId, this, mParameters);
			}

			return ManagedObject.prototype.fireEvent.call(this, sEventId, mParameters, bAllowPreventDefault, bEnableEventBubbling);
		};

		/**
		 * Intercepts an event. This method is meant for private usages. Apps are not supposed to used it.
		 * It is created for an experimental purpose.
		 * Implementation should be injected by outside.
		 *
		 * @param {string} sEventId the name of the event
		 * @param {sap.ui.core.Element} oElement the element itself
		 * @param {object} mParameters The parameters which complement the event. Hooks must not modify the parameters.
		 * @function
		 * @private
		 * @ui5-restricted
		 * @experimental Since 1.58
		 */
		Element._interceptEvent = undefined;

		/**
		 * Updates the count of rendering-related delegates and if the given threshold is reached,
		 * informs the RenderManager` to enable/disable rendering V4 for the element.
		 *
		 * @param {sap.ui.core.Element} oElement The element instance
		 * @param {object} oDelegate The delegate instance
		 * @param {iThresholdCount} iThresholdCount Whether the delegate has been added=1 or removed=0.
		 *    At the same time serves as threshold when to inform the `RenderManager`.
		 * @private
		 */
		function updateRenderingDelegate(oElement, oDelegate, iThresholdCount) {
			if (oDelegate.canSkipRendering || !(oDelegate.onAfterRendering || oDelegate.onBeforeRendering)) {
				return;
			}

			oElement._iRenderingDelegateCount += (iThresholdCount || -1);

			if (oElement.bOutput === true && oElement._iRenderingDelegateCount == iThresholdCount) {
				RenderManager.canSkipRendering(oElement, 1 /* update skip-the-rendering DOM marker, only if the apiVersion is 4 */);
			}
		}

		/**
		 * Returns whether the element has rendering-related delegates that might prevent skipping the rendering.
		 *
		 * @returns {boolean}
		 * @private
		 * @ui5-restricted sap.ui.core.RenderManager
		 */
		Element.prototype.hasRenderingDelegate = function() {
			return Boolean(this._iRenderingDelegateCount);
		};

		/**
		 * Adds a delegate that listens to the events of this element.
		 *
		 * Note that the default behavior (delegate attachments are not cloned when a control is cloned) is usually the desired behavior in control development
		 * where each control instance typically creates a delegate and adds it to itself. (As opposed to application development where the application may add
		 * one delegate to a template and then expects aggregation binding to add the same delegate to all cloned elements.)
		 *
		 * To avoid double registrations, all registrations of the given delegate are first removed and then the delegate is added.
		 *
		 * @param {object} oDelegate the delegate object
		 * @param {boolean} [bCallBefore=false] if true, the delegate event listeners are called before the event listeners of the element; default is "false". In order to also set bClone, this parameter must be given.
		 * @param {object} [oThis=oDelegate] if given, this object will be the "this" context in the listener methods; default is the delegate object itself
		 * @param {boolean} [bClone=false] if true, this delegate will also be attached to any clones of this element; default is "false"
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @private
		 */
		Element.prototype.addDelegate = function (oDelegate, bCallBefore, oThis, bClone) {
			assert(oDelegate, "oDelegate must be not null or undefined");

			if (!oDelegate) {
				return this;
			}

			this.removeDelegate(oDelegate);

			// shift parameters
			if (typeof bCallBefore === "object") {
				bClone = oThis;
				oThis = bCallBefore;
				bCallBefore = false;
			}

			if (typeof oThis === "boolean") {
				bClone = oThis;
				oThis = undefined;
			}

			(bCallBefore ? this.aBeforeDelegates : this.aDelegates).push({oDelegate:oDelegate, bClone: !!bClone, vThis: ((oThis === this) ? true : oThis)}); // special case: if this element is the given context, set a flag, so this also works after cloning (it should be the cloned element then, not the given one)
			updateRenderingDelegate(this, oDelegate, 1);

			return this;
		};

		/**
		 * Removes the given delegate from this element.
		 *
		 * This method will remove all registrations of the given delegate, not only one.
		 * If the delegate was marked to be cloned and this element has been cloned, the delegate will not be removed from any clones.
		 *
		 * @param {object} oDelegate the delegate object
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @private
		 */
		Element.prototype.removeDelegate = function (oDelegate) {
			var i;
			for (i = 0; i < this.aDelegates.length; i++) {
				if (this.aDelegates[i].oDelegate == oDelegate) {
					this.aDelegates.splice(i, 1);
					updateRenderingDelegate(this, oDelegate, 0);
					i--; // One element removed means the next element now has the index of the current one
				}
			}
			for (i = 0; i < this.aBeforeDelegates.length; i++) {
				if (this.aBeforeDelegates[i].oDelegate == oDelegate) {
					this.aBeforeDelegates.splice(i, 1);
					updateRenderingDelegate(this, oDelegate, 0);
					i--; // One element removed means the next element now has the index of the current one
				}
			}
			return this;
		};


		/**
		 * Adds a delegate that can listen to the browser-, pseudo- and framework events that are handled by this
		 * <code>Element</code> (as opposed to events which are fired by this <code>Element</code>).
		 *
		 * Delegates are simple objects that can have an arbitrary number of event handler methods. See the section
		 * "Handling of Events" in the {@link #constructor} documentation to learn how events will be dispatched
		 * and how event handler methods have to be named to be found.
		 *
		 * If multiple delegates are registered for the same element, they will be called in the order of their
		 * registration. Double registrations are prevented. Before a delegate is added, all registrations of the same
		 * delegate (no matter what value for <code>oThis</code> was used for their registration) are removed and only
		 * then the delegate is added. Note that this might change the position of the delegate in the list of delegates.
		 *
		 * When an element is cloned, all its event delegates will be added to the clone. This behavior is well-suited
		 * for applications which want to add delegates that also work with templates in aggregation bindings.
		 * For control development, the internal <code>addDelegate</code> method may be more suitable. Delegates added
		 * via that method are not cloned automatically, as typically each control instance takes care of adding its
		 * own delegates.
		 *
		 * <strong>Important:</strong> If event delegates were added, the delegate will still be called even if
		 * the event was processed and/or cancelled via <code>preventDefault</code> by the Element or another event delegate.
		 * <code>preventDefault</code> only prevents the event from bubbling.
		 * It should be checked e.g. in the event delegate's listener whether an Element is still enabled via <code>getEnabled</code>.
		 * Additionally there might be other things that delegates need to check depending on the event
		 * (e.g. not adding a key twice to an output string etc.).
		 *
		 * See {@link topic:bdf3e9818cd84d37a18ee5680e97e1c1 Event Handler Methods} for a general explanation of
		 * event handling in controls.
		 *
		 * <b>Note:</b> Setting the special <code>canSkipRendering</code> property to <code>true</code> for the event delegate
		 * object itself lets the framework know that the <code>onBeforeRendering</code> and <code>onAfterRendering</code>
		 * event handlers of the delegate are compatible with the contract of {@link sap.ui.core.RenderManager Renderer.apiVersion 4}.
		 * See example "Adding a rendering delegate...".
		 *
		 * @example <caption>Adding a delegate for the keydown and afterRendering event</caption>
		 * <pre>
		 * var oDelegate = {
		 *   onkeydown: function(){
		 *     // Act when the keydown event is fired on the element
		 *   },
		 *   onAfterRendering: function(){
		 *     // Act when the afterRendering event is fired on the element
		 *   }
		 * };
		 * oElement.addEventDelegate(oDelegate);
		 * </pre>
		 *
		 * @example <caption>Adding a rendering delegate that is compatible with the rendering optimization</caption>
		 * <pre>
		 * var oDelegate = {
		 *   canSkipRendering: true,
		 *   onBeforeRendering: function() {
		 *     // Act when the beforeRendering event is fired on the element
		 *     // The code here only accesses HTML elements inside the root node of the control
		 *   },
		 *   onAfterRendering: function(){
		 *     // Act when the afterRendering event is fired on the element
		 *     // The code here only accesses HTML elements inside the root node of the control
		 *   }
		 * };
		 * oElement.addEventDelegate(oDelegate);
		 * </pre>
		 *
		 * @param {object} oDelegate The delegate object which consists of the event handler names and the corresponding event handler functions
		 * @param {object} [oThis=oDelegate] If given, this object will be the "this" context in the listener methods; default is the delegate object itself
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @since 1.9.0
		 * @public
		 */
		Element.prototype.addEventDelegate = function (oDelegate, oThis) {
			return this.addDelegate(oDelegate, false, oThis, true);
		};

		/**
		 * Removes the given delegate from this element.
		 *
		 * This method will remove all registrations of the given delegate, not only one.
		 *
		 * @example <caption>Removing a delegate for the keydown and afterRendering event. The delegate object which was used when adding the event delegate</caption>
		 * <pre>
		 * var oDelegate = {
		 *   onkeydown: function(){
		 *     // Act when the keydown event is fired on the element
		 *   },
		 *   onAfterRendering: function(){
		 *     // Act when the afterRendering event is fired on the element
		 *   }
		 * };
		 * oElement.removeEventDelegate(oDelegate);
		 * </pre>
		 * @param {object} oDelegate The delegate object which consists of the event handler names and the corresponding event handler functions
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @since 1.9.0
		 * @public
		 */
		Element.prototype.removeEventDelegate = function (oDelegate) {
			return this.removeDelegate(oDelegate);
		};

		/**
		 * Returns the DOM Element that should get the focus or <code>null</code> if there's no such element currently.
		 *
		 * To be overwritten by the specific control method.
		 *
		 * @returns {Element|null} Returns the DOM Element that should get the focus or <code>null</code>
		 * @protected
		 */
		Element.prototype.getFocusDomRef = function () {
			return this.getDomRef() || null;
		};


		/**
		 * Returns the intersection of two intervals. When the intervals don't
		 * intersect at all, <code>null</code> is returned.
		 *
		 * For example, <code>intersection([0, 3], [2, 4])</code> returns
		 * <code>[2, 3]</code>
		 *
		 * @param {number[]} interval1 The first interval
		 * @param {number[]} interval2 The second interval
		 * @returns {number[]|null} The intersection or null when the intervals are apart from each other
		 */
		function intersection(interval1, interval2) {
			if ( interval2[0] > interval1[1] || interval1[0] > interval2[1]) {
				return null;
			} else {
				return [Math.max(interval1[0], interval2[0]), Math.min(interval1[1], interval2[1])];
			}
		}

		/**
		 * Checks whether an element is able to get the focus after {@link #focus} is called.
		 *
		 * An element is treated as 'focusable' when all of the following conditions are met:
		 * <ul>
		 *   <li>The element and all of its parents are not 'busy' or 'blocked',</li>
		 *   <li>the element is rendered at the top layer on the UI and not covered by any other DOM elements, such as an
		 *   opened modal popup or the global <code>BusyIndicator</code>,</li>
		 *   <li>the element matches the browser's prerequisites for being focusable: if it's a natively focusable element,
		 *   for example <code>input</code>, <code>select</code>, <code>textarea</code>, <code>button</code>, and so on, no
		 *   'tabindex' attribute is needed. Otherwise, 'tabindex' must be set. In any case, the element must be visible in
		 *   order to be focusable.</li>
		 * </ul>
		 *
		 * @returns {boolean} Whether the element can get the focus after calling {@link #focus}
		 * @since 1.110
		 * @public
		 */
		Element.prototype.isFocusable = function() {
			var oFocusDomRef = this.getFocusDomRef();

			if (!oFocusDomRef) {
				return false;
			}

			var oCurrentDomRef = oFocusDomRef;
			var aViewport = [[0, window.innerWidth], [0, window.innerHeight]];

			var aIntersectionX;
			var aIntersectionY;

			// find the first element through the parent chain which intersects
			// with the current viewport because document.elementsFromPoint can
			// return meaningful DOM elements only when the given coordinate is
			// within the current view port
			while (!aIntersectionX || !aIntersectionY) {
				var oRect = oCurrentDomRef.getBoundingClientRect();
				aIntersectionX = intersection(aViewport[0], [oRect.x, oRect.x + oRect.width]);
				aIntersectionY = intersection(aViewport[1], [oRect.y, oRect.y + oRect.height]);

				if (oCurrentDomRef.assignedSlot) {
					// assigned slot's bounding client rect has all properties set to 0
					// therefore we jump to the slot's parentElement directly in the next "if...else if...else"
					oCurrentDomRef = oCurrentDomRef.assignedSlot;
				}

				if (oCurrentDomRef.parentElement) {
					oCurrentDomRef = oCurrentDomRef.parentElement;
				} else if (oCurrentDomRef.parentNode && oCurrentDomRef.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
					oCurrentDomRef = oCurrentDomRef.parentNode.host;
				} else {
					break;
				}
			}

			var aElements = document.elementsFromPoint(
				Math.floor((aIntersectionX[0] + aIntersectionX[1]) / 2),
				Math.floor((aIntersectionY[0] + aIntersectionY[1]) / 2)
			);

			var iFocusDomRefIndex = aElements.findIndex(function(oElement) {
				return oElement.contains(oFocusDomRef);
			});

			var iBlockLayerIndex = aElements.findIndex(function(oElement) {
				return oElement.classList.contains("sapUiBLy") || oElement.classList.contains("sapUiBlockLayer");
			});

			if (iBlockLayerIndex !== -1 && iFocusDomRefIndex > iBlockLayerIndex) {
				// when block layer is visible and it's displayed over the Element's DOM
				return false;
			}

			// jQuery custom selectors ":sapFocusable"
			return jQuery(oFocusDomRef).is(":sapFocusable");
		};

		function getAncestorScrollPositions(oDomRef) {
			var oParentDomRef,
				aScrollHierarchy = [];

			oParentDomRef = oDomRef.parentNode;
			while (oParentDomRef) {
				aScrollHierarchy.push({
					node: oParentDomRef,
					scrollLeft: oParentDomRef.scrollLeft,
					scrollTop: oParentDomRef.scrollTop
				});
				oParentDomRef = oParentDomRef.parentNode;
			}

			return aScrollHierarchy;
		}

		function restoreScrollPositions(aScrollHierarchy) {
			aScrollHierarchy.forEach(function(oScrollInfo) {
				var oDomRef = oScrollInfo.node;

				if (oDomRef.scrollLeft !== oScrollInfo.scrollLeft) {
					oDomRef.scrollLeft = oScrollInfo.scrollLeft;
				}

				if (oDomRef.scrollTop !== oScrollInfo.scrollTop) {
					oDomRef.scrollTop = oScrollInfo.scrollTop;
				}
			});
		}

		/**
		 * Sets the focus to the stored focus DOM reference.
		 *
		 * @param {object} [oFocusInfo={}] Options for setting the focus
		 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 if it's set to true, the focused
		 *   element won't be shifted into the viewport if it's not completely visible before the focus is set
		 * @param {any} [oFocusInfo.targetInfo] Further control-specific setting of the focus target within the control @since 1.98
		 * @public
		 */
		Element.prototype.focus = function (oFocusInfo) {
			var oFocusDomRef = this.getFocusDomRef(),
			aScrollHierarchy = [];

			if (!oFocusDomRef) {
				return;
			}

			// jQuery custom selectors ":sapFocusable"
			if (jQuery(oFocusDomRef).is(":sapFocusable")) {
				oFocusInfo = oFocusInfo || {};
				// save the scroll position of all ancestor DOM elements
				// before the focus is set, because preventScroll is not supported by the following browsers
				if (Device.browser.safari) {
					if (oFocusInfo.preventScroll === true) {
						aScrollHierarchy = getAncestorScrollPositions(oFocusDomRef);
					}
					oFocusDomRef.focus();
					if (aScrollHierarchy.length > 0) {
						// restore the scroll position if it's changed after setting focus
						// Safari needs a little delay to get the scroll position updated
						setTimeout(restoreScrollPositions.bind(null, aScrollHierarchy), 0);
					}
				} else {
					oFocusDomRef.focus(oFocusInfo);
				}
			} else {
				const oDomRef = this.getDomRef();
				// In case the control already contains the active element, we
				// should not fire 'FocusFail' even when the oFocusDomRef isn't
				// focusable because not all controls defines the 'getFocusDomRef'
				// method properly
				if (oDomRef && !oDomRef.contains(document.activeElement) && !this._bIsBeingDestroyed) {
					Element.fireFocusFail.call(this);
				}
			}
		};

		/**
		 * Returns an object representing the serialized focus information.
		 *
		 * To be overwritten by the specific control method.
		 *
		 * @returns {object} an object representing the serialized focus information
		 * @protected
		 */
		Element.prototype.getFocusInfo = function () {
			return {id:this.getId()};
		};

		/**
		 * Applies the focus info.
		 *
		 * To be overwritten by the specific control method.
		 *
		 * @param {object} oFocusInfo Focus info object as returned by {@link #getFocusInfo}
		 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 if it's set to true, the focused
		 *   element won't be shifted into the viewport if it's not completely visible before the focus is set
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @protected
		 */
		Element.prototype.applyFocusInfo = function (oFocusInfo) {
			this.focus(oFocusInfo);
			return this;
		};


		/**
		 * Refreshs the tooltip base delegate with the given <code>oTooltip</code>
		 *
		 * @see sap.ui.core.Element#setTooltip
		 * @param {sap.ui.core.TooltipBase} oTooltip The new tooltip
		 * @private
		 */
		Element.prototype._refreshTooltipBaseDelegate = function (oTooltip) {
			var oOldTooltip = this.getTooltip();
			// if the old tooltip was a Tooltip object, remove it as a delegate
			if (BaseObject.isObjectA(oOldTooltip, "sap.ui.core.TooltipBase")) {
				this.removeDelegate(oOldTooltip);
			}
			// if the new tooltip is a Tooltip object, add it as a delegate
			if (BaseObject.isObjectA(oTooltip, "sap.ui.core.TooltipBase")) {
				oTooltip._currentControl = this;
				this.addDelegate(oTooltip);
			}
		};


		/**
		 * Sets a new tooltip for this object.
		 *
		 * The tooltip can either be a simple string (which in most cases will be rendered as the
		 * <code>title</code> attribute of this  Element) or an instance of {@link sap.ui.core.TooltipBase}.
		 *
		 * If a new tooltip is set, any previously set tooltip is deactivated.
		 *
		 * @param {string|sap.ui.core.TooltipBase} vTooltip New tooltip
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		Element.prototype.setTooltip = function(vTooltip) {

			this._refreshTooltipBaseDelegate(vTooltip);
			this.setAggregation("tooltip", vTooltip);

			return this;
		};

		/**
		 * Returns the tooltip for this element if any or an undefined value.
		 * The tooltip can either be a simple string or a subclass of
		 * {@link sap.ui.core.TooltipBase}.
		 *
		 * Callers that are only interested in tooltips of type string (e.g. to render
		 * them as a <code>title</code> attribute), should call the convenience method
		 * {@link #getTooltip_AsString} instead. If they want to get a tooltip text no
		 * matter where it comes from (be it a string tooltip or the text from a TooltipBase
		 * instance) then they could call {@link #getTooltip_Text} instead.
		 *
		 * @returns {string|sap.ui.core.TooltipBase|null} The tooltip for this Element or <code>null</code>.
		 * @public
		 */
		Element.prototype.getTooltip = function() {
			return this.getAggregation("tooltip");
		};

		Element.runWithPreprocessors = ManagedObject.runWithPreprocessors;

		/**
		 * Returns the tooltip for this element but only if it is a simple string.
		 * Otherwise, <code>undefined</code> is returned.
		 *
		 * @returns {string|undefined} string tooltip or <code>undefined</code>
		 * @public
		 */
		Element.prototype.getTooltip_AsString = function() {
			var oTooltip = this.getTooltip();
			if (typeof oTooltip === "string" || oTooltip instanceof String ) {
				return oTooltip;
			}
			return undefined;
		};

		/**
		 * Returns the main text for the current tooltip or <code>undefined</code> if there is no such text.
		 *
		 * If the tooltip is an object derived from <code>sap.ui.core.TooltipBase</code>, then the text property
		 * of that object is returned. Otherwise the object itself is returned (either a string
		 * or <code>undefined</code> or <code>null</code>).
		 *
		 * @returns {string|undefined|null} Text of the current tooltip or <code>undefined</code> or <code>null</code>
		 * @public
		 */
		Element.prototype.getTooltip_Text = function() {
			var oTooltip = this.getTooltip();
			if (oTooltip && typeof oTooltip.getText === "function" ) {
				return oTooltip.getText();
			}
			return oTooltip;
		};

		/**
		 * Destroys the tooltip in the aggregation
		 * named <code>tooltip</code>.
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.core.Element#destroyTooltip
		 * @function
		 */

		/**
		 * Returns the runtime metadata for this UI element.
		 *
		 * When using the defineClass method, this function is automatically created and returns
		 * a runtime representation of the design time metadata.
		 *
		 * @function
		 * @name sap.ui.core.Element.prototype.getMetadata
		 * @return {object} runtime metadata
		 * @public
		 */
		// sap.ui.core.Element.prototype.getMetadata = sap.ui.base.Object.ABSTRACT_METHOD;

		// ---- data container ----------------------------------

		// Note: the real class documentation can be found in sap/ui/core/CustomData so that the right module is
		// shown in the API reference. A reduced copy of the class documentation and the documentation of the
		// settings has to be provided here, close to the runtime metadata to allow extracting the metadata.
		/**
		 * @class
		 * Contains a single key/value pair of custom data attached to an <code>Element</code>.
		 * @public
		 * @alias sap.ui.core.CustomData
		 * @synthetic
		 */
		var CustomData = Element.extend("sap.ui.core.CustomData", /** @lends sap.ui.core.CustomData.prototype */ { metadata : {

			library : "sap.ui.core",
			properties : {

				/**
				 * The key of the data in this CustomData object.
				 * When the data is just stored, it can be any string, but when it is to be written to HTML
				 * (<code>writeToDom == true</code>) then it must also be a valid HTML attribute name.
				 * It must conform to the {@link sap.ui.core.ID} type and may contain no colon. To avoid collisions,
				 * it also may not start with "sap-ui". When written to HTML, the key is prefixed with "data-".
				 * If any restriction is violated, a warning will be logged and nothing will be written to the DOM.
				 */
				key : {type : "string", group : "Data", defaultValue : null},

				/**
				 * The data stored in this CustomData object.
				 * When the data is just stored, it can be any JS type, but when it is to be written to HTML
				 * (<code>writeToDom == true</code>) then it must be a string. If this restriction is violated,
				 * a warning will be logged and nothing will be written to the DOM.
				 */
				value : {type : "any", group : "Data", defaultValue : null},

				/**
				 * If set to "true" and the value is of type "string" and the key conforms to the documented restrictions,
				 * this custom data is written to the HTML root element of the control as a "data-*" attribute.
				 * If the key is "abc" and the value is "cde", the HTML will look as follows:
				 *
				 * <pre>
				 *   &lt;SomeTag ... data-abc="cde" ... &gt;
				 * </pre>
				 *
				 * Thus the application can provide stable attributes by data binding which can be used for styling or
				 * identification purposes.
				 *
				 * <b>ATTENTION:</b> use carefully to not create huge attributes or a large number of them.
				 * @since 1.9.0
				 */
				writeToDom : {type : "boolean", group : "Data", defaultValue : false}
			},
			designtime: "sap/ui/core/designtime/CustomData.designtime"
		}});

		CustomData.prototype.setValue = function(oValue) {
			this.setProperty("value", oValue, true);

			var oControl = this.getParent();
			if (oControl && oControl.getDomRef()) {
				var oCheckResult = this._checkWriteToDom(oControl);
				if (oCheckResult) {
					// update DOM directly
					oControl.$().attr(oCheckResult.key, oCheckResult.value);
				}
			}
			return this;
		};

		CustomData.prototype._checkWriteToDom = function(oRelated) {
			if (!this.getWriteToDom()) {
				return null;
			}

			var key = this.getKey();
			var value = this.getValue();

			function error(reason) {
				future.errorThrows("CustomData with key " + key + " should be written to HTML of " + oRelated + " but " + reason);
				return null;
			}

			if (typeof value != "string") {
				return error("the value is not a string.");
			}

			var ID = DataType.getType("sap.ui.core.ID");

			if (!(ID.isValid(key)) || (key.indexOf(":") != -1)) {
				return error("the key is not valid (must be a valid sap.ui.core.ID without any colon).");
			}

			if (key == F6Navigation.fastNavigationKey) {
				value = /^\s*(x|true)\s*$/i.test(value) ? "true" : "false"; // normalize values
			} else if (key.indexOf("sap-ui") == 0) {
				return error("the key is not valid (may not start with 'sap-ui').");
			}

			return {key: "data-" + key, value: value};

		};

		/**
		 * Returns the data object with the given <code>key</code>
		 *
		 * @private
		 * @param {sap.ui.core.Element} element The element
		 * @param {string} key The key of the desired custom data
		 * @returns {sap.ui.core.CustomData} The custom data
		 */
		function findCustomData(element, key) {
			var aData = element.getAggregation("customData");
			if (aData) {
				for (var i = 0; i < aData.length; i++) {
					if (aData[i].getKey() == key) {
						return aData[i];
					}
				}
			}
			return null;
		}

		/**
		 * Contains the data modification logic
		 *
		 * @private
		 * @param {sap.ui.core.Element} element The element
		 * @param {string} key The key of the desired custom data
		 * @param {string|any} value The value of the desired custom data
		 * @param {boolean} writeToDom Whether this custom data entry should be written to the DOM during rendering
		 */
		function setCustomData(element, key, value, writeToDom) {
			var oDataObject = findCustomData(element, key);

			if (value === null) { // delete this property
				if (!oDataObject) {
					return;
				}
				var dataCount = element.getAggregation("customData").length;
				if (dataCount == 1) {
					element.destroyAggregation("customData", true); // destroy if there is no other data
				} else {
					element.removeAggregation("customData", oDataObject, true);
					oDataObject.destroy();
				}
			} else if (oDataObject) { // change the existing data object
				oDataObject.setValue(value);
				oDataObject.setWriteToDom(writeToDom);
			} else { // add a new data object
				element.addAggregation("customData",
					new CustomData({ key: key, value: value, writeToDom: writeToDom }),
					true);
			}
		}

		/**
		 * Retrieves, modifies or removes custom data attached to an <code>Element</code>.
		 *
		 * Usages:
		 * <h4>Setting the value for a single key</h4>
		 * <pre>
		 *    data("myKey", myData)
		 * </pre>
		 * Attaches <code>myData</code> (which can be any JS data type, e.g. a number, a string, an object, or a function)
		 * to this element, under the given key "myKey". If the key already exists,the value will be updated.
		 *
		 *
		 * <h4>Setting a value for a single key (rendered to the DOM)</h4>
		 * <pre>
		 *    data("myKey", myData, writeToDom)
		 * </pre>
		 * Attaches <code>myData</code> to this element, under the given key "myKey" and (if <code>writeToDom</code>
		 * is true) writes key and value to the HTML. If the key already exists,the value will be updated.
		 * While <code>oValue</code> can be any JS data type to be attached, it must be a string to be also
		 * written to DOM. The key must also be a valid HTML attribute name (it must conform to <code>sap.ui.core.ID</code>
		 * and may contain no colon) and may not start with "sap-ui". When written to HTML, the key is prefixed with "data-".
		 *
		 *
		 * <h4>Getting the value for a single key</h4>
		 * <pre>
		 *    data("myKey")
		 * </pre>
		 * Retrieves whatever data has been attached to this element (using the key "myKey") before.
		 *
		 *
		 * <h4>Removing the value for a single key</h4>
		 * <pre>
		 *    data("myKey", null)
		 * </pre>
		 * Removes whatever data has been attached to this element (using the key "myKey") before.
		 *
		 *
		 * <h4>Removing all custom data for all keys</h4>
		 * <pre>
		 *    data(null)
		 * </pre>
		 *
		 *
		 * <h4>Getting all custom data values as a plain object</h4>
		 * <pre>
		 *    data()
		 * </pre>
		 * Returns all data, as a map-like object, property names are keys, property values are values.
		 *
		 *
		 * <h4>Setting multiple key/value pairs in a single call</h4>
		 * <pre>
		 *    data({"myKey1": myData, "myKey2": null})
		 * </pre>
		 * Attaches <code>myData</code> (using the key "myKey1" and removes any data that had been
		 * attached for key "myKey2".
		 *
		 * @see See chapter {@link topic:91f0c3ee6f4d1014b6dd926db0e91070 Custom Data - Attaching Data Objects to Controls}
		 *    in the documentation.
		 *
		 * @param {string|Object<string,any>|null} [vKeyOrData]
		 *     Single key to set or remove, or an object with key/value pairs or <code>null</code> to remove
		 *     all custom data
		 * @param {string|any} [vValue]
		 *     Value to set or <code>null</code> to remove the corresponding custom data
		 * @param {boolean} [bWriteToDom=false]
		 *     Whether this custom data entry should be written to the DOM during rendering
		 * @returns {Object<string,any>|any|null|sap.ui.core.Element}
		 *     A map with all custom data, a custom data value for a single specified key or <code>null</code>
		 *     when no custom data exists for such a key or this element when custom data was to be removed.
		 * @throws {TypeError}
		 *     When the type of the given parameters doesn't match any of the documented usages
		 * @public
		 */
		Element.prototype.data = function() {
			var argLength = arguments.length;

			if (argLength == 0) {                    // return ALL data as a map
				var aData = this.getAggregation("customData"),
					result = {};
				if (aData) {
					for (var i = 0; i < aData.length; i++) {
						result[aData[i].getKey()] = aData[i].getValue();
					}
				}
				return result;

			} else if (argLength == 1) {
				var arg0 = arguments[0];

				if (arg0 === null) {                  // delete ALL data
					this.destroyAggregation("customData", true); // delete whole map
					return this;

				} else if (typeof arg0 == "string") { // return requested data element
					var dataObject = findCustomData(this, arg0);
					return dataObject ? dataObject.getValue() : null;

				} else if (typeof arg0 == "object") { // should be a map - set multiple data elements
					for (var key in arg0) { // TODO: improve performance and avoid executing setData multiple times
						setCustomData(this, key, arg0[key]);
					}
					return this;

				} else {
					// error, illegal argument
					throw new TypeError("When data() is called with one argument, this argument must be a string, an object or null, but is " + (typeof arg0) + ":" + arg0 + " (on UI Element with ID '" + this.getId() + "')");
				}

			} else if (argLength == 2) {            // set or remove one data element
				setCustomData(this, arguments[0], arguments[1]);
				return this;

			} else if (argLength == 3) {            // set or remove one data element
				setCustomData(this, arguments[0], arguments[1], arguments[2]);
				return this;

			} else {
				// error, illegal arguments
				throw new TypeError("data() may only be called with 0-3 arguments (on UI Element with ID '" + this.getId() + "')");
			}
		};

		/**
		 * Expose CustomData class privately
		 * @private
		 */
		Element._CustomData = CustomData;

		/**
		 * Define CustomData class as the default for the built-in "customData" aggregation.
		 * We need to do this here via the aggregation itself, since the CustomData class is
		 * an Element subclass and thus cannot be directly referenced in Element's metadata definition.
		 */
		Element.getMetadata().getAggregation("customData").defaultClass = CustomData;

		/*
		 * Alternative implementation of <code>Element#data</code> which is applied after an element has been
		 * destroyed. It prevents the creation of new CustomData instances.
		 *
		 * See {@link sap.ui.core.Element.prototype.destroy}
		 */
		function noCustomDataAfterDestroy() {
			// Report and ignore only write calls; read and remove calls are well-behaving
			var argLength = arguments.length;
			if ( argLength === 1 && arguments[0] !== null && typeof arguments[0] == "object"
				 || argLength > 1 && argLength < 4 && arguments[1] !== null ) {
				future.errorThrows("Cannot create custom data on an already destroyed element '" + this + "'");
				return this;
			}
			return Element.prototype.data.apply(this, arguments);
		}


		/**
		 * Create a clone of this Element.
		 *
		 * Calls {@link sap.ui.base.ManagedObject#clone} and additionally clones event delegates.
		 *
		 * @param {string} [sIdSuffix] Suffix to be appended to the cloned element ID
		 * @param {string[]} [aLocalIds] Array of local IDs within the cloned hierarchy (internally used)
		 * @returns {this} reference to the newly created clone
		 * @public
		 */
		Element.prototype.clone = function(sIdSuffix, aLocalIds){

			var oClone = ManagedObject.prototype.clone.apply(this, arguments);
			// Clone delegates
			for ( var i = 0; i < this.aDelegates.length; i++) {
				if (this.aDelegates[i].bClone) {
					oClone.aDelegates.push(this.aDelegates[i]);
				}
			}
			for ( var k = 0; k < this.aBeforeDelegates.length; k++) {
				if (this.aBeforeDelegates[k].bClone) {
					oClone.aBeforeDelegates.push(this.aBeforeDelegates[k]);
				}
			}

			if (this._sapui_declarativeSourceInfo) {
				oClone._sapui_declarativeSourceInfo = Object.assign({}, this._sapui_declarativeSourceInfo);
			}

			return oClone;
		};

		/**
		 * Searches and returns an array of child elements and controls which are
		 * referenced within an aggregation or aggregations of child elements/controls.
		 * This can be either done recursive or not.
		 *
		 * <b>Take care: this operation might be expensive.</b>
		 * @param {boolean}
		 *          bRecursive true, if all nested children should be returned.
		 * @return {sap.ui.core.Element[]} array of child elements and controls
		 * @public
		 * @function
		 */
		Element.prototype.findElements = ManagedObject.prototype.findAggregatedObjects;


		function fireLayoutDataChange(oElement) {
			var oLayout = oElement.getParent();
			if (oLayout) {
				var oEvent = jQuery.Event("LayoutDataChange");
				oEvent.srcControl = oElement;
				oLayout._handleEvent(oEvent);
			}
		}

		/**
		 * Sets the {@link sap.ui.core.LayoutData} defining the layout constraints
		 * for this control when it is used inside a layout.
		 *
		 * @param {sap.ui.core.LayoutData} oLayoutData which should be set
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		Element.prototype.setLayoutData = function(oLayoutData) {
			this.setAggregation("layoutData", oLayoutData, true); // No invalidate because layout data changes does not affect the control / element itself
			fireLayoutDataChange(this);
			return this;
		};

		/*
		 * The LayoutDataChange event needs to be propagated on destruction of the aggregation.
		 */
		Element.prototype.destroyLayoutData = function() {
			this.destroyAggregation("layoutData", true);
			fireLayoutDataChange(this);
			return this;
		};

		/**
		 * Allows the parent of a control to enhance the ARIA information during rendering.
		 *
		 * This function is called by the RenderManager's
		 * {@link sap.ui.core.RenderManager#accessibilityState accessibilityState} and
		 * {@link sap.ui.core.RenderManager#writeAccessibilityState writeAccessibilityState} methods
		 * for the parent of the currently rendered control - if the parent implements it.
		 *
		 * <b>Note:</b> Setting the special <code>canSkipRendering</code> property of the <code>mAriaProps</code> parameter to <code>true</code> lets the <code>RenderManager</code> know
		 * that the accessibility enhancement is static and does not interfere with the child control's {@link sap.ui.core.RenderManager Renderer.apiVersion 4} rendering optimization.
		 *
		 * @example <caption>Setting an accessibility state that is compatible with the rendering optimization</caption>
		 * <pre>
		 * MyControl.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		 *     mAriaProps.label = "An appropriate label from the parent";
		 *     mAriaProps.canSkipRendering = true;
		 * };
		 * </pre>
		 *
		 * @function
		 * @name sap.ui.core.Element.prototype.enhanceAccessibilityState?
		 * @param {sap.ui.core.Element} oElement
		 *   The Control/Element for which ARIA properties are collected
		 * @param {object} mAriaProps
		 *   Map of ARIA properties keyed by their name (without prefix "aria-"); the method
		 *   implementation can enhance this map in any way (add or remove properties, modify values)
		 * @protected
		 */

		/**
		 * Bind the object to the referenced entity in the model, which is used as the binding context
		 * to resolve bound properties or aggregations of the object itself and all of its children
		 * relatively to the given path.
		 *
		 * If a relative binding path is used, this will be applied whenever the parent context changes.
		 *
		 * There's no difference between <code>bindElement</code> and {@link sap.ui.base.ManagedObject#bindObject}.
		 *
		 * @param {string|sap.ui.base.ManagedObject.ObjectBindingInfo} vPath the binding path or an object with more detailed binding options
		 * @param {object} [mParameters] map of additional parameters for this binding.
		 * Only taken into account when <code>vPath</code> is a string. In that case it corresponds to <code>mParameters</code> of {@link sap.ui.base.ManagedObject.ObjectBindingInfo}.
		 * The supported parameters are listed in the corresponding model-specific implementation of <code>sap.ui.model.ContextBinding</code>.
		 *
		 * @returns {this} reference to the instance itself
		 * @public
		 * @function
		 * @see {@link sap.ui.base.ManagedObject#bindObject}
		 */
		Element.prototype.bindElement = ManagedObject.prototype.bindObject;

		/**
		 * Removes the defined binding context of this object, all bindings will now resolve
		 * relative to the parent context again.
		 *
		 * @param {string} sModelName
		 * @return {sap.ui.base.ManagedObject} reference to the instance itself
		 * @public
		 * @function
		 */
		Element.prototype.unbindElement = ManagedObject.prototype.unbindObject;

		/**
		 * Get the context binding object for a specific model name.
		 *
		 * <b>Note:</b> to be compatible with future versions of this API, you must not use the following model names:
		 * <ul>
		 * <li><code>null</code></li>
		 * <li>empty string <code>""</code></li>
		 * <li>string literals <code>"null"</code> or <code>"undefined"</code></li>
		 * </ul>
		 * Omitting the model name (or using the value <code>undefined</code>) is explicitly allowed and
		 * refers to the default model.
		 *
		 * @param {string} [sModelName=undefined] Name of the model or <code>undefined</code>
		 * @return {sap.ui.model.ContextBinding|undefined} Context binding for the given model name or <code>undefined</code>
		 * @public
		 * @function
		 */
		Element.prototype.getElementBinding = ManagedObject.prototype.getObjectBinding;

		/*
		 * If Control has no FieldGroupIds use the one of the parents.
		 */
		Element.prototype._getFieldGroupIds = function() {

			var aFieldGroupIds;
			if (this.getMetadata().hasProperty("fieldGroupIds")) {
				aFieldGroupIds = this.getFieldGroupIds();
			}

			if (!aFieldGroupIds || aFieldGroupIds.length == 0) {
				var oParent = this.getParent();
				if (oParent && oParent._getFieldGroupIds) {
					return oParent._getFieldGroupIds();
				}
			}

			return aFieldGroupIds || [];

		};

		/**
		 * This function (if available on the concrete subclass) provides information for the field help.
		 *
		 * Applications must not call this hook method directly, it is called by the framework.
		 *
		 * Subclasses should implement this hook to provide any necessary information for displaying field help:
		 *
		 * <pre>
		 * MyElement.prototype.getFieldHelpInfo = function() {
		 *    return {
		 *      label: "some label"
		 *    };
		 * };
		 * </pre>
		 *
		 * @return {{label: string}} Field Help Information of the element.
		 * @function
		 * @name sap.ui.core.Element.prototype.getFieldHelpInfo?
		 * @protected
		 */
		//Element.prototype.getFieldHelpInfo = function() { return null; };

		/**
		 * Returns a DOM Element representing the given property or aggregation of this <code>Element</code>.
		 *
		 * Check the documentation for the <code>selector</code> metadata setting in {@link sap.ui.base.ManagedObject.extend}
		 * for details about its syntax or its expected result.
		 *
		 * The default implementation of this method will return <code>null</code> in any of the following cases:
		 * <ul>
		 * <li>no setting (property or aggregation) with the given name exists in the class of this <code>Element</code></li>
		 * <li>the setting has no selector defined in its metadata</li>
		 * <li>{@link #getDomRef this.getDomRef()} returns no DOM Element for this <code>Element</code>
		 *     or the returned DOM Element has no parentNode</li>
		 * <li>the selector does not match anything in the context of <code>this.getDomRef().parentNode</code></li>
		 * </ul>
		 * If more than one DOM Element within the element matches the selector, the first occurrence is returned.
		 *
		 * Subclasses can override this method to handle more complex cases which can't be described by a CSS selector.
		 *
		 * @param {string} sSettingsName Name of the property or aggregation
		 * @returns {Element} The first matching DOM Element for the setting or <code>null</code>
		 * @throws {SyntaxError} When the selector string in the metadata is not a valid CSS selector group
		 * @private
		 * @ui5-restricted drag and drop, sap.ui.dt
		 */
		Element.prototype.getDomRefForSetting = function (sSettingsName) {
			var oSetting = this.getMetadata().getAllSettings()[sSettingsName];
			if (oSetting && oSetting.selector) {
				var oDomRef = this.getDomRef();
				if (oDomRef) {
					oDomRef = oDomRef.parentNode;
					if (oDomRef && oDomRef.querySelector ) {
						var sSelector = oSetting.selector.replace(/\{id\}/g, this.getId().replace(/(:|\.)/g,'\\$1'));
						return oDomRef.querySelector(sSelector);
					}
				}
			}
			return null;
		};

		//*************** MEDIA REPLACEMENT ***********************//

		/**
		 * Returns the contextual width of an element, if set, or <code>undefined</code> otherwise
		 *
		 * @returns {*} The contextual width
		 * @private
		 * @ui5-restricted
		 */
		Element.prototype._getMediaContainerWidth = function () {
			if (typeof this._oContextualSettings === "undefined") {
				return undefined;
			}

			return this._oContextualSettings.contextualWidth;
		};

		/**
		 * Returns the current media range of the Device or the closest media container
		 *
		 * @param {string} [sName=Device.media.RANGESETS.SAP_STANDARD] The name of the range set
		 * @returns {object} Information about the current active interval of the range set.
		 *  The returned object has the same structure as the argument of the event handlers ({@link sap.ui.Device.media.attachHandler})
		 * @private
		 * @ui5-restricted
		 */
		Element.prototype._getCurrentMediaContainerRange = function (sName) {
			var iWidth = this._getMediaContainerWidth();

			sName = sName || Device.media.RANGESETS.SAP_STANDARD;

			return Device.media.getCurrentRange(sName, iWidth);
		};

		/**
		 * Called whenever there is a change in contextual settings for the Element
		 * @private
		 */
		Element.prototype._onContextualSettingsChanged = function () {
			var iWidth = this._getMediaContainerWidth(),
				bShouldUseContextualWidth = iWidth !== undefined,
				bProviderChanged = bShouldUseContextualWidth ^ !!this._bUsingContextualWidth,// true, false or false, true (convert to boolean in case of default undefined)
				aListeners = this._aContextualWidthListeners || [];

			if (bProviderChanged) {

				if (bShouldUseContextualWidth) {
					// Contextual width was set for an element that was already using Device.media => Stop using Device.media
					aListeners.forEach(function (oL) {
						Device.media.detachHandler(oL.callback, oL.listener, oL.name);
					});
				} else {
					// Contextual width was unset for an element that had listeners => Start using Device.media
					aListeners.forEach(function (oL) {
						Device.media.attachHandler(oL.callback, oL.listener, oL.name);
					});
				}

				this._bUsingContextualWidth = bShouldUseContextualWidth;
			}

			// Notify all listeners, for which a media breakpoint change occurred, based on their RangeSet
			aListeners.forEach(function (oL) {
				var oMedia = this._getCurrentMediaContainerRange(oL.name);
				if (oMedia && oMedia.from !== oL.media.from) {
					oL.media = oMedia;
					oL.callback.call(oL.listener || window, oMedia);
				}
			}, this);
		};

		/**
		 * Registers the given event handler to change events of the screen width/closest media container width,
		 *  based on the range set with the given <code>sName</code>.
		 *
		 * @param {function} fnFunction The handler function to call when the event occurs.
		 *  This function will be called in the context of the <code>oListener</code> instance (if present) or
		 *  on the element instance.
		 * @param {object} oListener The object that wants to be notified when the event occurs
		 *  (<code>this</code> context within the handler function).
		 *  If it is not specified, the handler function is called in the context of the element.
		 * @param {string} sName The name of the desired range set
		 * @private
		 * @ui5-restricted
		 */
		Element.prototype._attachMediaContainerWidthChange = function (fnFunction, oListener, sName) {
			sName = sName || Device.media.RANGESETS.SAP_STANDARD;

			// Add the listener to the list (and optionally initialize the list first)
			this._aContextualWidthListeners = this._aContextualWidthListeners || [];
			this._aContextualWidthListeners.push({
				callback: fnFunction,
				listener: oListener,
				name: sName,
				media: this._getCurrentMediaContainerRange(sName)
			});

			// Register to Device.media, unless contextual width was set
			if (!this._bUsingContextualWidth) {
				Device.media.attachHandler(fnFunction, oListener, sName);
			}
		};

		/**
		 * Removes a previously attached event handler from the change events of the screen width/closest media container width.
		 *
		 * @param {function} fnFunction The handler function to call when the event occurs.
		 *  This function will be called in the context of the <code>oListener</code> instance (if present) or
		 *  on the element instance.
		 * @param {object} oListener The object that wants to be notified when the event occurs
		 *  (<code>this</code> context within the handler function).
		 *  If it is not specified, the handler function is called in the context of the element.
		 * @param {string} sName The name of the desired range set
		 * @private
		 * @ui5-restricted
		 */
		Element.prototype._detachMediaContainerWidthChange = function (fnFunction, oListener, sName) {
			var oL;

			sName = sName || Device.media.RANGESETS.SAP_STANDARD;

			// Do nothing if the Element doesn't have any listeners
			if (!this._aContextualWidthListeners) {
				return;
			}

			for (var i = 0, iL = this._aContextualWidthListeners.length; i < iL; i++) {
				oL = this._aContextualWidthListeners[i];
				if (oL.callback === fnFunction && oL.listener === oListener && oL.name === sName) {

					// De-register from Device.media, if using it
					if (!this._bUsingContextualWidth) {
						Device.media.detachHandler(fnFunction, oListener, sName);
					}

					this._aContextualWidthListeners.splice(i,1);
					break;
				}
			}
		};

		var FocusHandler;
		Element._updateFocusInfo = function(oElement) {
			FocusHandler = FocusHandler || sap.ui.require("sap/ui/core/FocusHandler");
			if (FocusHandler) {
				FocusHandler.updateControlFocusInfo(oElement);
			}
		};

		/**
		 * Returns the nearest [UI5 Element]{@link sap.ui.core.Element} that wraps the given DOM element.
		 *
		 * A DOM element or a CSS selector is accepted as a given parameter. When a CSS selector is given as parameter, only
		 * the first DOM element that matches the CSS selector is taken to find the nearest UI5 Element that wraps it. When
		 * no UI5 Element can be found, <code>undefined</code> is returned.
		 *
		 * @param {HTMLElement|string} vParam A DOM Element or a CSS selector from which to start the search for the nearest
		 *  UI5 Element by traversing up the DOM tree
		 * @param {boolean} [bIncludeRelated=false] Whether the <code>data-sap-ui-related</code> attribute is also accepted
		 *  as a selector for a UI5 Element, in addition to <code>data-sap-ui</code>
		 * @returns {sap.ui.core.Element|undefined} The UI5 Element that wraps the given DOM element. <code>undefined</code> is
		 *  returned when no UI5 Element can be found.
		 * @public
		 * @since 1.106
		 * @throws {DOMException} when an invalid CSS selector is given
		 *
		 */
		Element.closestTo = function(vParam, bIncludeRelated) {
			var sSelector = "[data-sap-ui]",
				oDomRef, sId;

			if (vParam === undefined || vParam === null) {
				return undefined;
			}

			if (typeof vParam === "string") {
				oDomRef = document.querySelector(vParam);
			} else if (vParam instanceof window.Element){
				oDomRef = vParam;
			} else if (vParam.jquery) {
				oDomRef = vParam[0];
				future.errorThrows("Do not call Element.closestTo() with jQuery object as parameter. The function should be called with either a DOM Element or a CSS selector.");
			} else {
				throw new TypeError("Element.closestTo accepts either a DOM element or a CSS selector string as parameter, but not '" + vParam + "'");
			}

			if (bIncludeRelated) {
				sSelector += ",[data-sap-ui-related]";
			}

			oDomRef = oDomRef && oDomRef.closest(sSelector);

			if (oDomRef) {
				if (bIncludeRelated) {
					sId = oDomRef.getAttribute("data-sap-ui-related");
				}

				sId = sId || oDomRef.getAttribute("id");
			}

			return Element.getElementById(sId);
		};

		/**
		 * Returns the registered element with the given ID, if any.
		 *
		 * The ID must be the globally unique ID of an element, the same as returned by <code>oElement.getId()</code>.
		 *
		 * When the element has been created from a declarative source (e.g. XMLView), that source might have used
		 * a shorter, non-unique local ID. A search for such a local ID cannot be executed with this method.
		 * It can only be executed on the corresponding scope (e.g. on an XMLView instance), by using the
		 * {@link sap.ui.core.mvc.View#byId View#byId} method of that scope.
		 *
		 * @param {sap.ui.core.ID|null|undefined} sId ID of the element to search for
		 * @returns {sap.ui.core.Element|undefined} Element with the given ID or <code>undefined</code>
		 * @public
		 * @function
		 * @since 1.119
		 */
		Element.getElementById = ElementRegistry.get;

		/**
		 * Returns the element currently in focus.
		 *
		 * @returns {sap.ui.core.Element|undefined} The currently focused element
		 * @public
		 * @since 1.119
		 */
		Element.getActiveElement = () => {
			try {
				var $Act = jQuery(document.activeElement);
				if ($Act.is(":focus")) {
					return Element.closestTo($Act[0]);
				}
			} catch (err) {
				//escape eslint check for empty block
			}
		};

		Theming.attachApplied(function(oEvent) {
			// notify all elements/controls via a pseudo browser event
			var oJQueryEvent = jQuery.Event("ThemeChanged");
			oJQueryEvent.theme = oEvent.theme;
			ElementRegistry.forEach(function(oElement) {
				oJQueryEvent._bNoReturnValue = true; // themeChanged handler aren't allowed to have any retun value. Mark for future fatal throw.
				oElement._handleEvent(oJQueryEvent);
			});
		});

		_LocalizationHelper.registerForUpdate("Elements", ElementRegistry.all);

		return Element;
	});
