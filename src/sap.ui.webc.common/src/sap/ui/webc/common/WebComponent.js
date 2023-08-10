/*!
 * ${copyright}
 */

// Provides the base class for all Web Component wrappers.
sap.ui.define([
		"sap/ui/core/Control",
		"sap/ui/core/Element",
		"./WebComponentMetadata",
		"./WebComponentRenderer",
		"sap/base/strings/hyphenate",
		"sap/base/strings/camelize",
		"sap/ui/core/library",
		"sap/ui/core/LabelEnablement"
	],
	function(
		Control,
		Element,
		WebComponentMetadata,
		WebComponentRenderer,
		hyphenate,
		camelize,
		coreLibrary,
		LabelEnablement
	) {
		"use strict";

		var TextDirection = coreLibrary.TextDirection;

		/**
		 * Returns the sap.ui.core.Element instance for an arbitrary HTML Element, or undefined, if the HTML element is not a sap.ui.core.Element
		 *
		 * @private
		 * @param obj
		 * @returns {sap.ui.core.Element|undefined}
		 */
		var fnGetControlFor = function(obj) {
			if (obj.id && Element.registry.get(obj.id)) {
				return Element.registry.get(obj.id);
			}
		};

		/**
		 * Takes an object as an argument and returns another object, where all fields in the original object, that are HTML Elements, are deeply replaced with their sap.ui.core.Element counterparts, where applicable
		 *
		 * @private
		 * @param obj
		 * @param level
		 * @param maxLevel
		 * @returns {Object}
		 */
		var fnConvert = function(obj, level, maxLevel) {
			if (level === undefined) {
				level = 0;
			}
			if (maxLevel === undefined) {
				maxLevel = 2;
			}

			// Null
			if (obj == null) {
				return obj;
			}

			// HTML Element - if represents a control, return the control. Otherwise return the HTML Element and stop.
			if (obj instanceof window.HTMLElement) {
				var oControl = fnGetControlFor(obj);
				return oControl ? oControl : obj;
			}

			if (level < maxLevel) {
				// Array
				if (Array.isArray(obj)) {
					return obj.map(fnConvert, level + 1, maxLevel);
				}

				// Object
				if (typeof obj === "object") {
					var oResult = {};
					for (var i in obj) {
						if (obj.hasOwnProperty(i)) {
							oResult[i] = fnConvert(obj[i], level + 1, maxLevel);
						}
					}
					return oResult;
				}
			}

			// Anything else
			return obj;
		};

		/**
		 * Constructs and initializes a Web Component Wrapper with the given <code>sId</code> and settings.
		 *
	 	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 	 * @param {object} [mSettings] Object with initial settings for the new control
		 *
		 * @class Base Class for Web Components.
		 * Web Components are agnostic UI elements which can be integrated into the UI5
		 * programming model by using this wrapper control. This wrapper control takes
		 * care to propagate the properties, the aggregations and the events. It also
		 * ensures to render the control and put the aggregated controls in the dedicated
		 * slots of the Web Component.
		 *
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @since 1.92.0
		 * @alias sap.ui.webc.common.WebComponent
		 * @experimental Since 1.92.0 The API might change. It is not intended for productive usage yet!
		 */
		var WebComponent = Control.extend("sap.ui.webc.common.WebComponent", {

			metadata : {
				stereotype : "webcomponent",
				"abstract" : true,
				library : "sap.ui.webc.common",
				properties: {
					__isBusy: {
						type: "boolean",
						visibility: "hidden",
						defaultValue: false,
						mapping: {
							type: "attribute",
							to: "__is-busy"
						}
					}
				}
			},

			constructor : function(sId, mSettings) {
				Control.apply(this, arguments);

				this.__busyIndicatorTimeout = null;

				this.__onInvalidationBound = this.__onInvalidation.bind(this);
				this.__handleCustomEventBound = this.__handleCustomEvent.bind(this);

				this.__delegates = {
					onBeforeRendering: this.__onBeforeRenderingDelegate,
					onAfterRendering: this.__onAfterRenderingDelegate
				};
				this.addDelegate(this.__delegates, true, this, false);
			},

			renderer: WebComponentRenderer

		}, /* Metadata constructor */ WebComponentMetadata);

		/**
		 * @typedef {sap.ui.core.Element.MetadataOptions} sap.ui.webc.common.WebComponent.MetadataOptions
		 *
		 * The structure of the "metadata" object which is passed when inheriting from sap.ui.core.Element using its static "extend" method.
		 * See {@link sap.ui.core.Element.extend} for details on its usage.
		 *
		 * @property {string} tag
		 *     Tag name of the Web Component to be used in the renderer to render the HTML.
		 * @property {Object<string, string | sap.ui.webc.common.WebComponent.MetadataOptions.Property>} [properties]
		 *     An object literal whose properties each define a new managed property in the WebComponent subclass.
		 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Property Property} for more details.
		 * @property {Object<string, string | sap.ui.webc.common.WebComponent.MetadataOptions.Aggregation>} [aggregations]
		 *     An object literal whose properties each define a new aggregation in the ManagedObject subclass.
		 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation Aggregation} for more details.
		 * @property {Object<string, string | sap.ui.webc.common.WebComponent.MetadataOptions.Association>} [associations]
		 *     An object literal whose properties each define a new association in the ManagedObject subclass.
		 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Association Association} for more details.
		 * @property {string[]} [getters]
		 *     Proxied public getters of the Web Component which are directly accessible on the wrapper Control.
		 * @property {string[]} [methods]
		 *     Proxied public methods of the Web Component which are directly accessible on the wrapper Control.
		 *
		 * @public
		 */

		/**
		 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Property} sap.ui.webc.common.WebComponent.MetadataOptions.Property
		 *
		 * An object literal describing a property of a class derived from <code>sap.ui.webc.common.WebComponent</code>.
		 * See {@link sap.ui.webc.common.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
		 *
		 * @property {"attribute" | "style" | "textContent" | "slot" | "none" | sap.ui.webc.common.WebComponent.MetadataOptionsPropertyMapping} [mapping="attribute"] Defines the mapping of the attribute to be either "attribute", "style", "textContent", "slot", or "none".
		 *     The default mapping of a property is "attribute" which just renders the value of the property into an attribute of the tag.
		 *
		 * @public
		 */

		/**
		 * @typedef {object} sap.ui.webc.common.WebComponent.MetadataOptions.Property.Mapping
		 *
		 * An object literal describing the mapping of a property of a class derived from <code>sap.ui.webc.common.WebComponent</code>.
		 *
		 * @property {"attribute" | "style" | "textContent" | "slot" | "none"} [type="attribute"] Defines the mapping of the property to be either "attribute", "style", "textContent", "slot", or "none".
		 *     The default mapping of a property is "attribute" which just renders the value into an attribute of the tag.
		 * @property {string} [to] Defines the target of the mapping of the attribute to which it will be mapped to.
		 * @property {string} [formatter] Defines the name of the formatter function at the WebComponent instance to format the value before its being mapped.
		 *
		 * @public
		 */

		/**
		 * @typedef {sap.ui.webc.common.WebComponent.MetadataOptions.Property.Mapping} sap.ui.webc.common.WebComponent.MetadataOptionsPropertyMapping
		 *
		 * HACK! This mapping omits the <code>no-unnecessary-qualifier</code> error or we need to extend the <code>tslint.json</code>!
		 *
		 * @public
		 */

		/**
		 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Aggregation} sap.ui.webc.common.WebComponent.MetadataOptions.Aggregation
		 *
		 * An object literal describing a property of a class derived from <code>sap.ui.webc.common.WebComponent</code>.
		 * See {@link sap.ui.webc.common.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
		 *
		 * @property {string} [slot] Flag that marks the property as deprecated (defaults to false). May lead to an additional warning
		 *     log message at runtime when the property is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
		 *     describing since when it is deprecated and what any alternatives are.
		 *
		 * @public
		 */

		/**
		 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Association} sap.ui.webc.common.WebComponent.MetadataOptions.Association
		 *
		 * An object literal describing an association of a class derived from <code>sap.ui.webc.common.WebComponent</code>.
		 * See {@link sap.ui.webc.common.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
		 *
		 * @property {"property" | sap.ui.webc.common.WebComponent.MetadataOptionsAssociationMapping} [mapping="property"] Defines the mapping of the association which default to "property".
		 *     The default mapping of a property is "property" which just renders the value into an attribute of the tag.
		 *
		 * @public
		 */

		/**
		 * @typedef {object} sap.ui.webc.common.WebComponent.MetadataOptions.Association.Mapping
		 *
		 * An object literal describing the mapping of an association as property of a class derived from <code>sap.ui.webc.common.WebComponent</code>.
		 *
		 * @property {"property"} [type="property"] Defines the mapping of the association which defaults to "property".
		 * @property {string} [to] Defines the target of the mapping of the association to which property it will be mapped to.
		 * @property {string} [formatter] Defines the name of the formatter function at the WebComponent instance to format the value before its being mapped.
		 *
		 * @public
		 */

		/**
		 * @typedef {sap.ui.webc.common.WebComponent.MetadataOptions.Association.Mapping} sap.ui.webc.common.WebComponent.MetadataOptionsAssociationMapping
		 *
		 * HACK! This mapping omits the <code>no-unnecessary-qualifier</code> error or we need to extend the <code>tslint.json</code>!
		 *
		 * @public
		 */

		/**
		 * Defines a new subclass of WebComponent with the name <code>sClassName</code> and enriches it with
		 * the information contained in <code>oClassInfo</code>.
		 *
		 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
		 * plus the <code>dnd</code> property in the metadata object literal to configure drag-and-drop behavior
		 * (see {@link sap.ui.webc.common.WebComponent.MetadataOptions MetadataOptions} for details). Objects describing aggregations can also
		 * have a <code>dnd</code> property when used for a class extending <code>WebComponent</code>
		 * (see {@link sap.ui.base.ManagedObject.MetadataOptions.AggregationDnD AggregationDnD}).
		 *
		 * Example:
		 * <pre>
		 * WebComponent.extend('sap.mylib.MyElement', {
		 *   metadata : {
		 *     library : 'sap.mylib',
		 *     tag : 'my-webcomponent',
		 *     properties : {
		 *       value : 'string',
		 *       width : {
		 *         type: 'sap.ui.core.CSSSize',
		 *         mapping: 'style'
		 *       }
		 *     },
		 *     defaultAggregation: "content",
		 *     aggregations : {
		 *       content : {
		 *         type: 'sap.ui.core.Control',
		 *         multiple : true
		 *       },
		 *       header : {
		 *         type : 'sap.ui.core.Control',
		 *         multiple : false,
		 *         slot: 'header'
		 *       }
		 *     }
		 *   }
		 * });
		 * </pre>
		 *
		 * @param {string} sClassName Name of the class to be created
		 * @param {object} [oClassInfo] Object literal with information about the class
		 * @param {sap.ui.webc.common.WebComponent.MetadataOptions} [oClassInfo.metadata] the metadata object describing the class: tag, properties, aggregations, events etc.
		 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.core.ElementMetadata</code>.
		 * @returns {function} Created class / constructor function
		 *
		 * @public
		 * @static
		 * @name sap.ui.webc.common.WebComponent.extend
		 * @function
		 */

		/**
		 * Assigns the __slot property which tells RenderManager to render the sap.ui.core.Element (oElement) with a "slot" attribute
		 *
		 * @param oElement
		 * @param sAggregationName
		 * @private
		 */
		WebComponent.prototype._setSlot = function(oElement, sAggregationName) {
			var aDenyList = ["tooltip", "customData", "layoutData", "dependents", "dragDropConfig"];
			if (oElement && !aDenyList.includes(sAggregationName)) {
				var sSlot = this.getMetadata().getAggregationSlot(sAggregationName);
				oElement.__slot = sSlot;
			}
		};

		/**
		 * Removes the __slot property from the sap.ui.core.Element instance
		 *
		 * @param oElement
		 * @private
		 */
		WebComponent.prototype._unsetSlot = function(oElement) {
			if (oElement) {
				delete oElement.__slot;
			}
		};

		/**
		 * Set the slot for each newly added child control, based on its aggregation
		 *
		 * @override
		 * @param sAggregationName
		 * @param oObject
		 * @param bSuppressInvalidate
		 * @returns {this}
		 */
		WebComponent.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var vResult = Control.prototype.setAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		/**
		 * Set the slot for each newly added child control, based on its aggregation
		 *
		 * @override
		 * @param sAggregationName
		 * @param oObject
		 * @param iIndex
		 * @param bSuppressInvalidate
		 * @returns {this}
		 */
		WebComponent.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			var vResult = Control.prototype.insertAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		/**
		 * Set the slot for each newly added child control, based on its aggregation
		 *
		 * @override
		 * @param sAggregationName
		 * @param oObject
		 * @param bSuppressInvalidate
		 * @returns {this}
		 */
		WebComponent.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var vResult = Control.prototype.addAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		/**
		 * Remove the slot for each removed child control
		 *
		 * @override
		 * @param sAggregationName
		 * @param vObject
		 * @param bSuppressInvalidate
		 * @returns {sap.ui.base.ManagedObject}
		 */
		WebComponent.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			var oChild = Control.prototype.removeAggregation.apply(this, arguments);
			this._unsetSlot(oChild);
			return oChild;
		};

		/**
		 * Remove the slot for each removed child control
		 *
		 * @override
		 * @param sAggregationName
		 * @param bSuppressInvalidate
		 * @returns {*}
		 */
		WebComponent.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			var aChildren = Control.prototype.removeAllAggregation.apply(this, arguments);
			aChildren.forEach(function(oChild) {
				this._unsetSlot(oChild);
			}, this);

			return aChildren;
		};

		/**
		 * @private
		 */
		WebComponent.prototype.__onBeforeRenderingDelegate = function() {
			this.__detachCustomEventsListeners();
		};

		/**
		 * @private
		 */
		WebComponent.prototype.__onAfterRenderingDelegate = function() {
			this.__attachCustomEventsListeners();

			var oDomRef = this.getDomRef();
			window.customElements.whenDefined(oDomRef.localName).then(function() {
				if (typeof oDomRef.attachInvalidate === "function") {
					oDomRef.attachInvalidate(this.__onInvalidationBound);
				}

				if (oDomRef._individualSlot) {
					this.__slot = oDomRef._individualSlot; // If the component creates individual slots for children, f.e. columns-3 or default-1, update the __slot property, otherwise RenderManager will set the normal slot name, f.e. columns or ""
				}
				this.__updateObjectProperties(oDomRef);
			}.bind(this));
		};

		/**
		 * Updates all object properties (can't be done via the renderer)
		 * @param oDomRef
		 * @private
		 */
		WebComponent.prototype.__updateObjectProperties = function(oDomRef) {
			var oAttrProperties = this.getMetadata().getPropertiesByMapping("attribute");
			for (var sPropName in oAttrProperties) {
				if (this.isPropertyInitial(sPropName)) {
					continue; // do not set properties that were not explicitly set/bound
				}

				var oPropData = oAttrProperties[sPropName];
				var vPropValue = oPropData.get(this);

				if (oPropData.type === "object" || typeof vPropValue === "object") {
					var sWebComponentPropName = oPropData._sMapTo ? oPropData._sMapTo : sPropName;
					oDomRef[sWebComponentPropName] = vPropValue;
				}
			}
		};

		WebComponent.prototype.setBusy = function(bBusy) {
			var bCurrentBusyState = this.getBusy();

			this.setProperty("busy", bBusy, true);

			if (bCurrentBusyState !== bBusy) {
				if (bBusy) {
					this.__busyIndicatorTimeout = setTimeout(function() {
						this.setProperty("__isBusy", bBusy);
					}.bind(this), this.getBusyIndicatorDelay());
				} else {
					this.setProperty("__isBusy", bBusy);
					clearTimeout(this.__busyIndicatorTimeout);
				}
			}

			return this;
		};

		/**
		 * Synchronize user-controlled properties (such as checked, value)
		 * @param oChangeInfo
		 * @private
		 */
		WebComponent.prototype.__onInvalidation = function(oChangeInfo) {
			if (oChangeInfo.type === "property") {
				var sPropName = oChangeInfo.name;
				var vNewValue = oChangeInfo.newValue;
				var oPropData = this.getMetadata().getProperty(sPropName);
				if (oPropData) {
					this.setProperty(sPropName, vNewValue, true); // must suppress invalidation as this is intended to only sync the managed object state, not to trigger a rerender
				}
			}
		};

		WebComponent.prototype.__attachCustomEventsListeners = function() {
			var oEvents = this.getMetadata().getEvents();
			for (var sEventName in oEvents) {
				var sCustomEventName = hyphenate(sEventName);
				this.getDomRef().addEventListener(sCustomEventName, this.__handleCustomEventBound);
			}
		};

		WebComponent.prototype.__detachCustomEventsListeners = function() {
			var oDomRef = this.getDomRef();
			if (!oDomRef) {
				return;
			}

			var oEvents = this.getMetadata().getEvents();
			for (var sEventName in oEvents) {
				if (oEvents.hasOwnProperty(sEventName)) {
					var sCustomEventName = hyphenate(sEventName);
					oDomRef.removeEventListener(sCustomEventName, this.__handleCustomEventBound);
				}
			}
		};

		WebComponent.prototype.__handleCustomEvent = function(oEvent) {
			var sCustomEventName = oEvent.type;
			var sEventName = camelize(sCustomEventName);

			// Prepare the event data object
			var oEventData = this.__formatEventData(oEvent.detail);

			// Finally fire the semantic event on the control instance
			var oEventObj = this.getMetadata().getEvent(sEventName);
			var bPrevented = !oEventObj.fire(this, oEventData);
			if (bPrevented) {
				oEvent.preventDefault();
			}
		};

		WebComponent.prototype.__formatEventData = function(vDetail) {
			// If the event data is an object, recursively convert all object dom element properties to control references
			if (typeof vDetail === "object") {
				return fnConvert(vDetail);
			}

			// If not an object, this is a DOM event such as click, just return an empty object
			return {};
		};

		WebComponent.prototype.__callPublicMethod = function(name, args) {
			if (!this.getDomRef()) {
				throw new Error("Method called before custom element has been created by: " + this.getId());
			}

			var converted = Array.from(args).map(function(arg) { //  convert any public method parameter that is a Control instance to a DOM Ref
				if (arg instanceof Element) {
					return arg.getDomRef();
				}
				return arg;
			});

			var vResult = this.getDomRef()[name].apply(this.getDomRef(), converted);
			if (typeof vResult === "object") {
				vResult = fnConvert(vResult);
			}

			return vResult;
		};

		WebComponent.prototype.__callPublicGetter = function(name) {
			if (!this.getDomRef()) {
				throw new Error("Getter called before custom element has been created by: " + this.getId());
			}

			var vResult = this.getDomRef()[name];
			if (typeof vResult === "object") {
				vResult = fnConvert(vResult);
			}

			return vResult;
		};

		WebComponent.prototype.destroy = function() {
			var oDomRef = this.getDomRef();
			this.__detachCustomEventsListeners();
			if (oDomRef && typeof oDomRef.detachInvalidate === "function") {
				oDomRef.detachInvalidate(this.__onInvalidationBound);
			}

			return Control.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Maps the "enabled" property to the "disabled" attribute
		 * @param bEnabled
		 * @returns {boolean}
		 * @private
		 */
		WebComponent.prototype._mapEnabled = function(bEnabled) {
			return !bEnabled;
		};

		/**
		 * Maps the "textDirection" property to the "dir" attribute
		 * @param sTextDirection
		 * @returns {string}
		 * @private
		 */
		WebComponent.prototype._mapTextDirection = function(sTextDirection) {
			if (sTextDirection === TextDirection.Inherit) {
				return null;
			}

			return sTextDirection.toLowerCase();
		};

		/**
		 * Generates a string containing the ID's from the association ariaLabelledBy.
		 * @param {string[]} aAriaLabelledBy an array of IDs associated with this control
		 * @returns {string} sAriaLabelledBy
		 */
		WebComponent.prototype._getAriaLabelledByForRendering = function (aAriaLabelledBy) {
			var aFilteredIds = LabelEnablement.getReferencingLabels(this);

			if (Array.isArray(aAriaLabelledBy)) {
				aAriaLabelledBy.forEach(function (sId) {
					if (aFilteredIds.indexOf(sId) < 0) {
						aFilteredIds.unshift(sId);
					}
				});
			}

			return aFilteredIds.join(" ");
		};

		return WebComponent;
	});
