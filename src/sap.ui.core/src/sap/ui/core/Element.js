/*!
 * ${copyright}
 */

// Provides the base class for all controls and UI elements.
sap.ui.define([
	'../base/DataType',
	'../base/Object',
	'../base/ManagedObject',
	'../base/ManagedObjectRegistry',
	'./ElementMetadata',
	'../Device',
	"sap/ui/performance/trace/Interaction",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/F6Navigation",
	"./RenderManager"
],
	function(
		DataType,
		BaseObject,
		ManagedObject,
		ManagedObjectRegistry,
		ElementMetadata,
		Device,
		Interaction,
		Log,
		assert,
		jQuery,
		F6Navigation,
		RenderManager
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
	 * If a key name is ambiguous for a specific control class (e.g. a property has the same
	 * name as an event), then this method prefers property, aggregation, association and
	 * event in that order. To resolve such ambiguities, the keys can be prefixed with
	 * <code>aggregation:</code>, <code>association:</code> or <code>event:</code>.
	 * In that case the keys must be quoted due to the ':'.
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
	 * @class Base Class for Elements.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.core.Element
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Element = ManagedObject.extend("sap.ui.core.Element", {

		metadata : {
			stereotype : "element",
			"abstract" : true,
			publicMethods : [ "getId", "getMetadata", "getTooltip_AsString", "getTooltip_Text", "getModel", "setModel", "hasModel", "bindElement", "unbindElement", "getElementBinding", "prop", "getLayoutData", "setLayoutData" ],
			library : "sap.ui.core",
			aggregations : {

				/**
				 * The tooltip that should be shown for this Element.
				 *
				 * Can either be an instance of a TooltipBase subclass or a simple string.
				 */
				tooltip : {name : "tooltip", type : "sap.ui.core.TooltipBase", altTypes : ["string"], multiple : false},

				/**
				 * Custom Data, a data structure like a map containing arbitrary key value pairs.
				 */
				customData : {name : "customData", type : "sap.ui.core.CustomData", multiple : true, singularName : "customData"},

				/**
				 * Defines the layout constraints for this control when it is used inside a Layout.
				 * LayoutData classes are typed classes and must match the embedding Layout.
				 * See VariantLayoutData for aggregating multiple alternative LayoutData instances to a single Element.
				 */
				layoutData : {name : "layoutData", type : "sap.ui.core.LayoutData", multiple : false, singularName : "layoutData"},

				/**
				 * Dependents are not rendered, but their databinding context and lifecycle are bound to the aggregating Element.
				 * @since 1.19
				 */
				dependents : {name : "dependents", type : "sap.ui.core.Element", multiple : true},

				/**
				 * Defines the drag-and-drop configuration.
				 * <b>Note:</b> This configuration might be ignored due to control {@link sap.ui.core.Element.extend metadata} restrictions.
				 *
				 * @since 1.56
				 */
				dragDropConfig : {name : "dragDropConfig", type : "sap.ui.core.dnd.DragDropBase", multiple : true, singularName : "dragDropConfig"}
			}
		},

		constructor : function(sId, mSettings) {
			ManagedObject.apply(this, arguments);
		},

		renderer : null // Element has no renderer

	}, /* Metadata constructor */ ElementMetadata);

	// apply the registry mixin
	ManagedObjectRegistry.apply(Element, {
		onDuplicate: function(sId, oldElement, newElement) {
			if ( oldElement._sapui_candidateForDestroy ) {
				Log.debug("destroying dangling template " + oldElement + " when creating new object with same ID");
				oldElement.destroy();
			} else {
				var sMsg = "adding element with duplicate id '" + sId + "'";
				// duplicate ID detected => fail or at least log a warning
				if (sap.ui.getCore().getConfiguration().getNoDuplicateIds()) {
					Log.error(sMsg);
					throw new Error("Error: " + sMsg);
				} else {
					Log.warning(sMsg);
				}
			}
		}
	});

	/**
	 * Creates metadata for a UI Element by extending the Object Metadata.
	 *
	 * @param {string} sClassName name of the class to build the metadata for
	 * @param {object} oStaticInfo static information used to build the metadata
	 * @param {function} [fnMetaImpl=sap.ui.core.ElementMetadata] constructor to be used for the metadata
	 * @return {sap.ui.core.ElementMetadata} the created metadata
	 * @static
	 * @public
	 * @deprecated Since 1.3.1. Use the static <code>extend</code> method of the desired base class (e.g. {@link sap.ui.core.Element.extend})
	 */
	Element.defineClass = function(sClassName, oStaticInfo, fnMetaImpl) {
		// create and attach metadata but with an Element specific implementation
		return BaseObject.defineClass(sClassName, oStaticInfo, fnMetaImpl || ElementMetadata);
	};

	/**
	 * @see sap.ui.base.Object#getInterface
	 * @public
	 */
	Element.prototype.getInterface = function() {
		return this;
	};

	/**
	 * Defines a new subclass of Element with the name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
	 * plus the following <code>dnd</code> property to configure drag-and-drop behavior in the metadata object literal:
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
	 *       items : { type: 'sap.ui.core.Control', multiple : true, dnd : {draggable: false, dropppable: true, layout: "Horizontal" } },
	 *       header : {type : "sap.ui.core.Control", multiple : false, dnd : true },
	 *     }
	 *   }
	 * });
	 * </pre>
	 *
	 * <h3><code>dnd</code> key as a metadata property</h3>
	 *
	 * <b>dnd</b>: <i>object|boolean</i><br>
	 * Defines draggable and droppable configuration of the element.
	 * The following keys can be provided via <code>dnd</code> object literal to configure drag-and-drop behavior of the element:
	 * <ul>
	 *  <li><code>[draggable=false]: <i>boolean</i></code> Defines whether the element is draggable or not. The default value is <code>false</code>.</li>
	 *  <li><code>[droppable=false]: <i>boolean</i></code> Defines whether the element is droppable (it allows being dropped on by a draggable element) or not. The default value is <code>false</code>.</li>
	 * </ul>
	 * If <code>dnd</code> property is of type Boolean, then the <code>draggable</code> and <code>droppable</code> configuration are set to this Boolean value.
	 *
	 * <h3><code>dnd</code> key as an aggregation metadata property</h3>
	 *
	 * <b>dnd</b>: <i>object|boolean</i><br>
	 * In addition to draggable and droppable configuration, the layout of the aggregation can be defined as a hint at the drop position indicator.
	 * <ul>
	 *  <li><code>[layout="Vertical"]: </code> The arrangement of the items in this aggregation. This setting is recommended for the aggregation with multiplicity 0..n (<code>multiple: true</code>). Possible values are <code>Vertical</code> (e.g. rows in a table) and <code>Horizontal</code> (e.g. columns in a table). It is recommended to use <code>Horizontal</code> layout if the arrangement is multidimensional.</li>
	 * </ul>
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo static info to construct the metadata from
	 * @returns {function} Created class / constructor function
	 *
	 * @public
	 * @static
	 * @name sap.ui.core.Element.extend
	 * @function
	 */

	/**
	 * Dispatches the given event, usually a browser event or a UI5 pseudo event.
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
			this[sHandlerName](oEvent);
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
	 * @protected
	 */
	Element.prototype.init = function() {
		// Before adding any implementation, please remember that this method was first implemented in release 1.54.
		// Therefore, many subclasses will not call this method at all.
	};

	/**
	 * Cleans up the element instance before destruction.
	 *
	 * Applications must not call this hook method directly, it is called by the framework
	 * when the element is {@link #destroy destroyed}.
	 *
	 * Subclasses of Element should override this hook to implement any necessary cleanup.
	 *
	 * @protected
	 */
	Element.prototype.exit = function() {
		// Before adding any implementation, please remember that this method was first implemented in release 1.54.
		// Therefore, many subclasses will not call this method at all.
	};

	/**
	 * Creates a new Element from the given data.
	 *
	 * If <code>vData</code> is an Element already, that element is returned.
	 * If <code>vData</code> is an object (literal), then a new element is created with <code>vData</code> as settings.
	 * The type of the element is either determined by a property named <code>Type</code> in the <code>vData</code> or
	 * by a type information in the <code>oKeyInfo</code> object
	 * @param {sap.ui.core.Element|object} vData Data to create the element from
	 * @param {object} [oKeyInfo] An entity information (e.g. aggregation info)
	 * @param {string} [oKeyInfo.type] Type info for the entity
	 * @public
	 * @static
	 * @deprecated As of 1.44, use the more flexible {@link sap.ui.base.ManagedObject.create}.
	 * @function
	 */
	Element.create = ManagedObject.create;

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
	 * @return {Element} The Element's DOM Element sub DOM Element or null
	 * @protected
	 */
	Element.prototype.getDomRef = function(sSuffix) {
		return (((sSuffix ? this.getId() + "-" + sSuffix : this.getId())) ? window.document.getElementById(sSuffix ? this.getId() + "-" + sSuffix : this.getId()) : null);
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
	 * @type boolean
	 * @return true if this element has an active parent
	 * @private
	 */
	Element.prototype.isActive = function() {
		return this.oParent && this.oParent.isActive();
	};

	/**
	 * This function either calls set[sPropertyName] or get[sPropertyName] with the specified property name
	 * depending if an <code>oValue</code> is provided or not.
	 *
	 * @param {string}  sPropertyName name of the property to set
	 * @param {any}     [oValue] value to set the property to
	 * @return {any|sap.ui.core.Element} Returns <code>this</code> to allow method chaining in case of setter and the property value in case of getter
	 * @public
	 * @deprecated Since 1.28.0 The contract of this method is not fully defined and its write capabilities overlap with applySettings
	 */
	Element.prototype.prop = function(sPropertyName, oValue) {

		var oPropertyInfo = this.getMetadata().getAllSettings()[sPropertyName];
		if (oPropertyInfo) {
			if (arguments.length == 1) {
				// getter
				return this[oPropertyInfo._sGetter]();
			} else {
				// setter
				this[oPropertyInfo._sMutator](oValue);
				return this;
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


	/// cyclic dependency
	//jQuery.sap.require("sap.ui.core.TooltipBase"); /// cyclic dependency


	/**
	 * This triggers immediate rerendering of its parent and thus of itself and its children.
	 *
	 * As <code>sap.ui.core.Element</code> "bubbles up" the rerender, changes to
	 * child-<code>Elements</code> will also result in immediate rerendering of the whole sub tree.
	 * @protected
	 */
	Element.prototype.rerender = function() {
		if (this.oParent) {
			this.oParent.rerender();
		}
	};


	/**
	 * Returns the UI area of this element, if any.
	 *
	 * @return {sap.ui.core.UIArea} The UI area of this element or null
	 * @private
	 */
	Element.prototype.getUIArea = function() {
		return this.oParent ? this.oParent.getUIArea() : null;
	};

	/**
	 * Cleans up the resources associated with this element and all its children.
	 *
	 * After an element has been destroyed, it can no longer be used in the UI!
	 *
	 * Applications should call this method if they don't need the element any longer.
	 *
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, the UI element is removed from DOM synchronously and parent will not be invalidated.
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

		ManagedObject.prototype.destroy.call(this, bSuppressInvalidate);

		// wrap custom data API to avoid creating new objects
		this.data = noCustomDataAfterDestroy;

		// exit early if there is no control DOM to remove
		var oDomRef = this.getDomRef();
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
			Interaction.notifyStepStart(this);
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
	 * @param {object} [oThis] if given, this object will be the "this" context in the listener methods; default is the delegate object itself
	 * @param {boolean} [bClone=false] if true, this delegate will also be attached to any clones of this element; default is "false"
	 * @return {sap.ui.core.Element} Returns <code>this</code> to allow method chaining
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
		return this;
	};

	/**
	 * Removes the given delegate from this element.
	 *
	 * This method will remove all registrations of the given delegate, not only one.
	 * If the delegate was marked to be cloned and this element has been cloned, the delegate will not be removed from any clones.
	 *
	 * @param {object} oDelegate the delegate object
	 * @return {sap.ui.core.Element} Returns <code>this</code> to allow method chaining
	 * @private
	 */
	Element.prototype.removeDelegate = function (oDelegate) {
		var i;
		for (i = 0; i < this.aDelegates.length; i++) {
			if (this.aDelegates[i].oDelegate == oDelegate) {
				this.aDelegates.splice(i, 1);
				i--; // One element removed means the next element now has the index of the current one
			}
		}
		for (i = 0; i < this.aBeforeDelegates.length; i++) {
			if (this.aBeforeDelegates[i].oDelegate == oDelegate) {
				this.aBeforeDelegates.splice(i, 1);
				i--; // One element removed means the next element now has the index of the current one
			}
		}
		return this;
	};


	/**
	 * Adds a delegate that listens to the events that are fired on this element (as opposed to events which are fired BY this element).
	 *
	 * When this element is cloned, the same delegate will be added to all clones. This behavior is well-suited for applications which want to add delegates
	 * that also work with templates in aggregation bindings.
	 * For control development the internal "addDelegate" method which does not clone delegates by default may be more suitable, as typically each control instance takes care of its own delegates.
	 *
	 * To avoid double registrations, all registrations of the given delegate are first
	 * removed and then the delegate is added.
	 *
	 * <strong>Important:</strong> If event delegates were added the delegate will still be called even if
	 * the event was processed and/or cancelled via <code>preventDefault</code> by the Element or another event delegate.
	 * <code>preventDefault</code> only prevents the event from bubbling.
	 * It should be checked e.g. in the event delegate's listener whether an Element is still enabled via <code>getEnabled</code>.
	 * Additionally there might be other things that delegates need to check depending on the event
	 * (e.g. not adding a key twice to an output string etc.).
	 *
	 * @param {object} oDelegate the delegate object
	 * @param {object} [oThis] if given, this object will be the "this" context in the listener methods; default is the delegate object itself
	 * @return {sap.ui.core.Element} Returns <code>this</code> to allow method chaining
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
	 * @param {object} oDelegate the delegate object
	 * @return {sap.ui.core.Element} Returns <code>this</code> to allow method chaining
	 * @since 1.9.0
	 * @public
	 */
	Element.prototype.removeEventDelegate = function (oDelegate) {
		return this.removeDelegate(oDelegate);
	};

	/**
	 * Returns the DOM Element that should get the focus.
	 *
	 * To be overwritten by the specific control method.
	 *
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	Element.prototype.getFocusDomRef = function () {
		return this.getDomRef() || null;
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
	 * Sets the focus to the stored focus DOM reference
	 *
	 * @param {object} oFocusInfo
	 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 if it's set to true, the focused
	 *   element won't be shifted into the viewport if it's not completely visible before the focus is set
	 * @public
	 */
	Element.prototype.focus = function (oFocusInfo) {
		var oFocusDomRef = this.getFocusDomRef(),
			aScrollHierarchy;

		oFocusInfo = oFocusInfo || {};

		if (oFocusDomRef) {
			// save the scroll position of all ancestor DOM elements
			// before the focus is set
			if (oFocusInfo.preventScroll === true) {
				aScrollHierarchy = getAncestorScrollPositions(oFocusDomRef);
			}

			oFocusDomRef.focus();

			if (aScrollHierarchy && aScrollHierarchy.length > 0) {
				// restore the scroll position if it's changed after setting focus
				if (Device.browser.safari || Device.browser.msie || Device.browser.edge) {
					// Safari, IE11 and Edge need a little delay to get the scroll position updated
					setTimeout(restoreScrollPositions.bind(null, aScrollHierarchy), 0);
				} else {
					restoreScrollPositions(aScrollHierarchy);
				}
			}
		}
	};

	/**
	 * Returns an object representing the serialized focus information
	 * To be overwritten by the specific control method
	 * @type object
	 * @return an object representing the serialized focus information
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
	 * @param {object} oFocusInfo
	 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 if it's set to true, the focused
	 *   element won't be shifted into the viewport if it's not completely visible before the focus is set
	 * @protected
	 */
	Element.prototype.applyFocusInfo = function (oFocusInfo) {
		this.focus(oFocusInfo);
		return this;
	};


	/**
	 * @see sap.ui.core.Element#setTooltip
	 * @private
	 */
	Element.prototype._refreshTooltipBaseDelegate = function (oTooltip) {
		var oOldTooltip = this.getTooltip();
		// if the old tooltip was a Tooltip object, remove it as a delegate
		if (BaseObject.isA(oOldTooltip, "sap.ui.core.TooltipBase")) {
			this.removeDelegate(oOldTooltip);
		}
		// if the new tooltip is a Tooltip object, add it as a delegate
		if (BaseObject.isA(oTooltip, "sap.ui.core.TooltipBase")) {
			oTooltip._currentControl = this;
			this.addDelegate(oTooltip);
		}
	};


	/**
	 * Sets a new tooltip for this object. The tooltip can either be a simple string
	 * (which in most cases will be rendered as the <code>title</code> attribute of this
	 * Element) or an instance of {@link sap.ui.core.TooltipBase}.
	 *
	 * If a new tooltip is set, any previously set tooltip is deactivated.
	 *
	 * @param {string|sap.ui.core.TooltipBase} vTooltip
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
	 * @return {string|sap.ui.core.TooltipBase} The tooltip for this Element.
	 * @public
	 */
	Element.prototype.getTooltip = function() {
		return this.getAggregation("tooltip");
	};

	Element.runWithPreprocessors = ManagedObject.runWithPreprocessors;

	/**
	 * Returns the tooltip for this element but only if it is a simple string.
	 * Otherwise an undefined value is returned.
	 *
	 * @return {string} string tooltip or undefined
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
	 * Returns the main text for the current tooltip or undefined if there is no such text.
	 * If the tooltip is an object derived from sap.ui.core.Tooltip, then the text property
	 * of that object is returned. Otherwise the object itself is returned (either a string
	 * or undefined or null).
	 *
	 * @return {string} text of the current tooltip or undefined
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
	 * @return {sap.ui.core.Element} <code>this</code> to allow method chaining
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
			Log.error("CustomData with key " + key + " should be written to HTML of " + oRelated + " but " + reason);
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
	 * Returns the data object with the given key
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
	 */
	function setCustomData(element, key, value, writeToDom) {
		var dataObject;

		// DELETE
		if (value === null) { // delete this property
			dataObject = findCustomData(element, key);
			if (!dataObject) {
				return;
			}

			var dataCount = element.getAggregation("customData").length;
			if (dataCount == 1) {
				element.destroyAggregation("customData", true); // destroy if there is no other data
			} else {
				element.removeAggregation("customData", dataObject, true);
				dataObject.destroy();
			}

			// ADD or CHANGE
		} else {
			dataObject = findCustomData(element, key);
			if (dataObject) {
				element.removeAggregation("customData", dataObject, true);
				dataObject.destroy();
			}

			// Double escaping of curly brackets for string objects required,
			// otherwise will be interpreted as binding update.
			if (typeof value === "string" &&
				value.charAt(0) === "{" && value.charAt(1) !== "/" && value.charAt(value.length - 1) === "}") {
				value = value.slice(0, value.length - 1);
				value = "\\" + value + "\\}";
			}

			dataObject = new CustomData({key:key,value:value, writeToDom:writeToDom});
			element.addAggregation("customData", dataObject, true);
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
			Log.error("Cannot create custom data on an already destroyed element '" + this + "'");
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
	 * @returns {sap.ui.core.Element} reference to the newly created clone
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
		for ( var i = 0; i < this.aBeforeDelegates.length; i++) {
			if (this.aBeforeDelegates[i].bClone) {
				oClone.aBeforeDelegates.push(this.aBeforeDelegates[i]);
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
	 * @return {sap.ui.core.Element} Returns <code>this</code> to allow method chaining
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
	 * Allows the parent of a control to enhance the aria information during rendering.
	 *
	 * This function is called by the RenderManager's writeAccessibilityState method
	 * for the parent of the currently rendered control - if the parent implements it.
	 *
	 * @function
	 * @name sap.ui.core.Element.prototype.enhanceAccessibilityState
	 * @param {sap.ui.core.Element} oElement the Control/Element for which aria properties are rendered
	 * @param {object} mAriaProps map of aria properties keyed by there name (without prefix "aria-")
	 * @return {object} map of enhanced aria properties
	 * @protected
	 * @abstract
	 */

	/**
	 * Bind the object to the referenced entity in the model, which is used as the binding context
	 * to resolve bound properties or aggregations of the object itself and all of its children
	 * relatively to the given path.
	 * If a relative binding path is used, this will be applied whenever the parent context changes.
	 * There is no difference between {@link sap.ui.core.Element#bindElement} and {@link sap.ui.base.ManagedObject#bindObject}.
	 * @param {string|object} vPath the binding path or an object with more detailed binding options
	 * @param {string} vPath.path the binding path
	 * @param {object} [vPath.parameters] map of additional parameters for this binding
	 * @param {string} [vPath.model] name of the model
	 * @param {object} [vPath.events] map of event listeners for the binding events
	 * @param {object} [mParameters] map of additional parameters for this binding (only taken into account when vPath is a string in that case it corresponds to vPath.parameters).
	 * The supported parameters are listed in the corresponding model-specific implementation of <code>sap.ui.model.ContextBinding</code>.
	 *
	 * @return {sap.ui.core.Element} reference to the instance itself
	 * @public
	 * @function
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
	 * @return {sap.ui.model.ContextBinding} Context binding for the given model name or <code>undefined</code>
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
	 * @ui5-restricted internal usage for drag and drop and sap.ui.dt
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
	 * @returns {*}
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
	 * @param {string} sName
	 * @returns {object}
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
			if (oMedia.from !== oL.media.from) {
				oL.media = oMedia;
				oL.callback.call(oL.listener || window, oMedia);
			}
		}, this);
	};

	/**
	 * Registers the given event handler to change events of the screen width/closest media container width, based on the range set with the specified name.
	 *
	 * @param {function} fnFunction
	 * @param {object} oListener
	 * @param {string} sName
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
	 * @param {function} fnFunction
	 * @param {object} oListener
	 * @param {string} sName
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

	/**
	 * Registry of all <code>sap.ui.core.Element</code>s that currently exist.
	 *
	 * @namespace sap.ui.core.Element.registry
	 * @public
	 */

	/**
	 * Number of existing elements.
	 *
	 * @type {int}
	 * @readonly
	 * @name sap.ui.core.Element.registry.size
	 * @public
	 */

	/**
	 * Return an object with all instances of <code>sap.ui.core.Element</code>,
	 * keyed by their ID.
	 *
	 * Each call creates a new snapshot object. Depending on the size of the UI,
	 * this operation therefore might be expensive. Consider to use the <code>forEach</code>
	 * or <code>filter</code> method instead of executing similar operations on the returned
	 * object.
	 *
	 * <b>Note</b>: The returned object is created by a call to <code>Object.create(null)</code>,
	 * and therefore lacks all methods of <code>Object.prototype</code>, e.g. <code>toString</code> etc.
	 *
	 * @returns {Object<sap.ui.core.ID,sap.ui.core.Element>} Object with all elements, keyed by their ID
	 * @name sap.ui.core.Element.registry.all
	 * @function
	 * @public
	 */

	/**
	 * Retrieves an Element by its ID.
	 *
	 * When the ID is <code>null</code> or <code>undefined</code> or when there's no element with
	 * the given ID, then <code>undefined</code> is returned.
	 *
	 * @param {sap.ui.core.ID} id ID of the element to retrieve
	 * @returns {sap.ui.core.Element} Element with the given ID or <code>undefined</code>
	 * @name sap.ui.core.Element.registry.get
	 * @function
	 * @public
	 */

	/**
	 * Calls the given <code>callback</code> for each element.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oElement, sID)
	 * </pre>
	 * where <code>oElement</code> is the currently visited element instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * The order in which the callback is called for elements is not specified and might change between
	 * calls (over time and across different versions of UI5).
	 *
	 * If elements are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When an element is destroyed during
	 * the filtering and was not visited yet, it might or might not be visited. As the behavior for such
	 * concurrent modifications is not specified, it may change in newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * @param {function(sap.ui.core.Element,sap.ui.core.ID)} callback
	 *        Function to call for each element
	 * @param {Object} [thisArg=undefined]
	 *        Context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name sap.ui.core.Element.registry.forEach
	 * @function
	 * @public
	 */

	/**
	 * Returns an array with elements for which the given <code>callback</code> returns a value that coerces
	 * to <code>true</code>.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oElement, sID)
	 * </pre>
	 * where <code>oElement</code> is the currently visited element instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * If elements are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When an element is destroyed during
	 * the filtering and was not visited yet, it might or might not be visited. As the behavior for such
	 * concurrent modifications is not specified, it may change in newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * This function returns an array with all elements matching the given predicate. The order of the
	 * elements in the array is not specified and might change between calls (over time and across different
	 * versions of UI5).
	 *
	 * @param {function(sap.ui.core.Element,sap.ui.core.ID):boolean} callback
	 *        predicate against which each element is tested
	 * @param {Object} [thisArg=undefined]
	 *        context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @returns {sap.ui.core.Element[]}
	 *        Array of elements matching the predicate; order is undefined and might change in newer versions of UI5
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name sap.ui.core.Element.registry.filter
	 * @function
	 * @public
	 */

	return Element;

});