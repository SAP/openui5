/*!
 * ${copyright}
 */

// Provides the base class for all controls and UI elements.
sap.ui.define([
		"../Control",
		"./WebComponentMetadata",
		"./WebComponentRenderer",
		"sap/ui/core/Core",
		"sap/base/strings/hyphenate",
		"sap/base/strings/camelize"
	],
	function(
		Control,
		WebComponentMetadata,
		WebComponentRenderer,
		Core,
		hyphenate,
		camelize
	) {
		"use strict";

		/**
		 * Constructs and initializes a Web Component with the given <code>sId</code> and settings.
		 *
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @alias sap.ui.core.WebComponent
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var WebComponent = Control.extend("sap.ui.core.webcomp.WebComponent", {

			metadata : {
				stereotype : "webcomponent",
				"abstract" : true,
				library : "sap.ui.core"
			},

			constructor : function(sId, mSettings) {
				Control.apply(this, arguments);

				this.__attachCustomEventsListeners();
				this.attachBrowserEvent("_property-change", this.__onPropertyChange, this);
			},

			renderer: WebComponentRenderer

		}, /* Metadata constructor */ WebComponentMetadata);

		/**
		 * Assigns the __slot property which tells RenderManager to render the sap.ui.core.Element (oElement) with a "slot" attribute
		 *
		 * @param oElement
		 * @param sAggregationName
		 * @private
		 */
		WebComponent.prototype._setSlot = function(oElement, sAggregationName) {
			if (oElement) {
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

		WebComponent.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var vResult = Control.prototype.setAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		WebComponent.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			var vResult = Control.prototype.insertAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		WebComponent.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			var vResult = Control.prototype.addAggregation.apply(this, arguments);
			this._setSlot(oObject, sAggregationName);
			return vResult;
		};

		WebComponent.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			var oChild = Control.prototype.removeAggregation.apply(this, arguments);
			this._unsetSlot(oChild);
			return oChild;
		};

		WebComponent.prototype.__attachCustomEventsListeners = function() {
			var oEvents = this.getMetadata().getEvents();
			for (var sEventName in oEvents) {
				if (oEvents.hasOwnProperty(sEventName)) {
					var sCustomEventName = hyphenate(sEventName);
					this.attachBrowserEvent(sCustomEventName, this.__handleCustomEvent, this);
				}
			}
		};

		WebComponent.prototype.__detachCustomEventsListeners = function() {
			var oEvents = this.getMetadata().getEvents();
			for (var sEventName in oEvents) {
				if (oEvents.hasOwnProperty(sEventName)) {
					var sCustomEventName = hyphenate(sEventName);
					this.detachBrowserEvent(sCustomEventName, this.__handleCustomEvent, this);
				}
			}
		};

		WebComponent.prototype.__handleCustomEvent = function(oEvent) {
			var sCustomEventName = oEvent.type;
			var sEventName = camelize(sCustomEventName);

			// Update properties that depend on the custom event // TODO: what about other property types
			var oProperties = this.getMetadata().getPropertiesToUpdateOnEvent(sEventName);
			for (var sPropName in oProperties) {
				if (oProperties.hasOwnProperty(sPropName)) {
					var oPropData = oProperties[sPropName];
					var vNewPropValue = this.getDomRef()[sPropName];
					oPropData.set(this, vNewPropValue);
				}
			}

			// Prepare the event data object
			var oEventData = this.__formatEventData(oEvent.detail);

			// Let the control react internally to the custom event before firing the semantic event
			this.onBeforeFireEvent(sEventName, oEventData);

			// Finally fire the semantic event on the control instance
			var oEventObj = this.getMetadata().getEvent(sEventName);
			var bPrevented = !oEventObj.fire(this, oEventData);
			if (bPrevented) {
				oEvent.preventDefault();
			}
		};

		WebComponent.prototype.__formatEventData = function(vDetail) {
			var fnGetControlFor = function(obj) {
				if (obj instanceof HTMLElement && obj.id && Core.byId(obj.id)) {
					return Core.byId(obj.id);
				}
			};

			var fnConvert = function(obj) {
				// TODO: what if an argument is really a DOM element?? Metadata descriptor
				// HTML Element - if represents a control, return the control. Otherwise return the HTML Element and stop.
				if (obj instanceof HTMLElement) {
					var oControl = fnGetControlFor(obj);
					return oControl ? oControl : obj;
				}

				// Array
				if (Array.isArray(obj)) {
					return obj.map(fnConvert);
				}

				// Object
				if (typeof obj === "object") {
					var oResult = {};
					for (var i in obj) {
						if (obj.hasOwnProperty(i)) {
							oResult[i] = fnConvert(obj[i]);
						}
					}
					return oResult;
				}

				// Anything else
				return obj;
			};

			// If the event data is an object, recursively convert all object dom element properties to control references
			if (typeof vDetail === "object") {
				return fnConvert(vDetail);
			}

			// If not an object, this is a DOM event such as click, just return an empty object
			return {};
		};

		WebComponent.prototype.__onPropertyChange = function(oEvent) {
			var sPropName = oEvent.detail.name;
			var vNewValue = oEvent.detail.newValue;
			var oPropData = this.getMetadata().getProperty(sPropName);
			if (oPropData) {
				oPropData.set(this, vNewValue); // TODO: reverse mapping
			}
		};

		/**
		 * Hook
		 *
		 * @abstract
		 * @param sEventName
		 * @param oEventData
		 */
		WebComponent.prototype.onBeforeFireEvent = function(sEventName, oEventData) {};

		WebComponent.prototype.__callPublicMethod = function(name, args) {
			if (!this.getDomRef()) {
				throw new Error("Method called before custom element has been created");
			}

			return this.getDomRef()[name].apply(this.getDomRef(), args);
		};

		WebComponent.prototype.destroy = function() {
			this.__detachCustomEventsListeners();
			this.detachBrowserEvent("_property-change", this.__onPropertyChange, this);
			return Control.prototype.destroy.call(this, arguments);
		};

		return WebComponent;
	});
