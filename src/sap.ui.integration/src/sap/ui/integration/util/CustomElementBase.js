/*!
* ${copyright}
*/

/* global Reflect, HTMLElement, CustomEvent */

sap.ui.define([
	"sap/base/Log",
	"./Utils",
	"sap/base/strings/hyphenate",
	"sap/base/strings/camelize",
	// polyfills
	"sap/ui/integration/thirdparty/customElements",
	"sap/ui/integration/thirdparty/customEvent"
], function (
	Log,
	Utils,
	hyphenate,
	camelize,
	// polyfills
	customElements,
	customEvent
) {
	"use strict";

	/**
	 * Awaits definition for other custom elements.
	 * @param {string[]} aDependencies Array of custom elements names that the current custom element needs to be loaded.
	 * @returns {Promise} Promise
	 */
	function awaitDependencies(aDependencies) {
		var aPromises = aDependencies.map(function (sCustomElementName) {
			return window.customElements.whenDefined(sCustomElementName);
		});

		return Promise.all(aPromises);
	}

	/**
	 * Constructor for a new html element.
	 * @class
	 * @alias sap.ui.integration.util.CustomElementBase
	 * @private
	 */
	function CustomElement () {
		return Reflect.construct(HTMLElement, [], this.constructor);
	}

	CustomElement.prototype = Object.create(HTMLElement.prototype);
	CustomElement.prototype.constructor = CustomElement;

	/**
	 * Called when the element is placed in DOM.
	 */
	CustomElement.prototype.connectedCallback = function () {
		this._init();
		this._upgradeAllProperties(); // Ensure all the properties pass through the defined setter.
		this._upgradeAllAssociations();
		this._oControlInstance.placeAt(this.firstElementChild);
		this._attachEventListeners();
	};

	/**
	 * Called when the element is removed from DOM.
	 */
	CustomElement.prototype.disconnectedCallback = function () {

		if (this._oControlInstance) {
			this._oControlInstance.destroy();
			delete this._oControlInstance;
		}

		if (this.firstElementChild) {
			this.removeChild(this.firstElementChild);
		}
	};

	/**
	 * Called when attributed changes. Reflect such changes to the underlying control.
	 *
	 * @param {string} sAttributeName The attribute name in "dashed-case".
	 * @param {any} vOldValue The old value of the attribute.
	 * @param {any} vNewValue The new value of the attribute.
	 */
	CustomElement.prototype.attributeChangedCallback = function (sAttributeName, vOldValue, vNewValue) {
		this._init();
		var sCamelizedAttributeName = camelize(sAttributeName);

		if (Utils.isJson(vNewValue)) {
			vNewValue = JSON.parse(vNewValue);
		}

		// reflect attributes to the UI5 Control
		if (this.constructor._mAllProperties[sCamelizedAttributeName]) {
			this.constructor._mAllProperties[sCamelizedAttributeName].set(this._oControlInstance, vNewValue);
		} else if (this.constructor._mAllAssociations[sCamelizedAttributeName]) {
			awaitDependencies(this.constructor._aDependencies).then(function () {
				var vValue = document.getElementById(vNewValue)._getControl();
				this.constructor._mAllAssociations[sCamelizedAttributeName].set(this._oControlInstance, vValue);
			}.bind(this));
		} else {
			Log.error("Unknown attribute " + sAttributeName + " set to " + this.id);
		}
	};

	/**
	 * Instantiated control and prepares HTML element that will server for UIArea.
	 * @private
	 */
	CustomElement.prototype._init = function () {

		if (!this._oControlInstance) {
			this._oControlInstance = new this.constructor._ControlClass();
		}

		// holder for UIArea
		if (!this.firstElementChild) {
			var oUiArea = document.createElement("div");
			oUiArea.style.display = "block"; // display: contents looks like the best choice, but it is not supported on all browsers
			this.appendChild(oUiArea);
		}
	};

	/**
	 * Gives access to the underlying control. This API might change.
	 * @experimental
	 * @public
	 * @returns {sap.ui.core.Control} The underlying control instance.
	 */
	CustomElement.prototype.getControl = function () {
		Log.warning("getControl method is experimental and might change in future.");
		return this._getControl();
	};

	/**
	 * Gives access to the underlying control for internal use.
	 * @private
	 * @returns {sap.ui.core.Control} The underlying control instance.
	 */
	CustomElement.prototype._getControl = function () {
		this._init();
		return this._oControlInstance;
	};

	/**
	 * Attaches listeners to all the control events and dispatches them as custom events.
	 * @private
	 */
	CustomElement.prototype._attachEventListeners = function () {
		Object.keys(this.constructor._oMetadata.getEvents()).map(function (sEventId) {
			this._oControlInstance.attachEvent(sEventId, function (oEvent) {
				this.dispatchEvent(new CustomEvent(sEventId, {
					detail: oEvent,
					bubbles: true
				}));
			}, this);
		}.bind(this));
	};

	/**
	 * Re-sets all the properties, to ensure that they all pass through the defined setter.
	 * @private
	 */
	CustomElement.prototype._upgradeAllProperties = function () {
		this.constructor._aAllProperties.forEach(this._upgradeProperty.bind(this));
	};

	/**
	 * Re-sets a single property.
	 * @param {string} sPropertyName The name of the property to re-set.
	 */
	CustomElement.prototype._upgradeProperty = function (sPropertyName) {
		if (this[sPropertyName]) {
			var vValue = this[sPropertyName];
			delete this[sPropertyName];
			this[sPropertyName] = vValue;
		}
	};

	/**
	 * Awaits for dependencies in order to reach ._getControl method.
	 * Then sets associations of the internal control.
	 * @private
	 */
	CustomElement.prototype._upgradeAllAssociations = function () {
		awaitDependencies(this.constructor._aDependencies).then(function () {
			for (var sKey in this.constructor._mAllAssociations) {
				if (this.constructor._mAllAssociations[sKey].get(this._oControlInstance)) {
					var vValue = document.getElementById(this[sKey])._getControl();
					this.constructor._mAllAssociations[sKey].set(this._oControlInstance, vValue);
				}
			}
		}.bind(this));
	};

	/**
	 * Generates accessors for the current class.
	 * @private
	 * @static
	 */
	CustomElement._generateAccessors = function () {

		var oPrototype = this.prototype;

		// define accessors to sync properties with attributes
		// properties are defined in "camelCase"
		this._aAllProperties.forEach(function (sPropertyName) {
			Object.defineProperty(oPrototype, sPropertyName, {
				get: function () {
					return this.getAttribute(hyphenate(sPropertyName));
				},
				set: function (vValue) {

					// TO DO: clarify if stringifying is our job
					if (typeof vValue === "object") {
						vValue = JSON.stringify(vValue);
					}

					return this.setAttribute(hyphenate(sPropertyName), vValue);
				}
			});
		});
	};

	/**
	 * Defines custom html element, which will wrap a UI5 class.
	 *
	 * @param {string} sCustomElementName The name of the custom html element (e.g: "card").
	 * @param {sap.ui.core.Control} ControlClass A UI5 class that will be wrapped in the custom html element.
	 * @param {string[]} aDependencies Array of all dependencies for the current class.
	 * @private
	 * @static
	 */
	CustomElement.define = function (sCustomElementName, ControlClass, aDependencies) {

		this._ControlClass = ControlClass;
		this._oMetadata = ControlClass.getMetadata();
		this._mAllAssociations = this._oMetadata.getAllAssociations();
		this._mAllProperties = this._oMetadata.getAllProperties();
		var sKey = "";
		this._aAllProperties = []; // holds all properties and associations in "camelCase"
		this._aDependencies = aDependencies;

		for (sKey in this._mAllProperties) {
			this._aAllProperties.push(sKey);
		}

		for (sKey in this._mAllAssociations) {
			this._aAllProperties.push(sKey);
		}

		Object.defineProperty(this, "observedAttributes", {
			get: function() {
				var aAllAttributes = this._aAllProperties.map(hyphenate); // all properties and associations in "dashed-case"
				return aAllAttributes;
			}
		});

		this._generateAccessors();

		window.customElements.define(sCustomElementName, this);
	};

	return CustomElement;
});