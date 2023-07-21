/*!
 * ${copyright}
 */
// Provides class module:sap/base/Event
sap.ui.define(["sap/base/assert"],
	function(assert) {
	"use strict";

	var EVENT_PARAMETERS_SYMBOL = Symbol("parameters");

	/**
	 *
	 * @class Creates an event with the given <code>sType</code>, linked to the provided <code>oTarget</code> and enriched with the <code>oParameters</code>.
	 *
	 * @param {string} sType The type of the event
	 * @param {module:sap/base/Eventing} oTarget Target of the event
	 * @param {object} oParameters Parameters for this event. The parameters will be accessible as properties of the Event instance.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias module:sap/base/Event
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var Event = function(sType, oTarget, oParameters) {
		if (arguments.length > 0) {
			/**
			 *The type of the event
			 * @type {string}
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
			this.type = sType;
			/**
			 * The target of the event
			 * @type {object}
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
			this.target = oTarget;
			/**
			 * Stop propagation of the event.
			 * @type {boolean}
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
			this.bStopPropagation = false;
			/**
			 * Prevent the default action of this event.
			 * @type {object}
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
			this.bPreventDefault = false;

			//copy & freeze parameters
			for (var param in oParameters) {
				this[param] = oParameters[param];
				Object.defineProperty(this, param, { configurable: false, writable: false });
			}
			this[EVENT_PARAMETERS_SYMBOL] = oParameters;

			Object.defineProperty(this, "type", { configurable: false, writable: false });
			Object.defineProperty(this, "target", { configurable: false, writable: false });
		}
	};

	/**
	 * Prevent the default action of this event.
	 *
	 * <b>Note:</b> This function only has an effect if preventing the default action of the event is supported by the event source.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	Event.prototype.preventDefault = function() {
		this.bPreventDefault = true;
	};

	/**
	 * Stop propagation of the event.
	 *
	 * <b>Note:</b> This function only has an effect if the propagation of the event is supported by the event source.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	Event.prototype.stopPropagation = function() {
		this.bStopPropagation = true;
	};

	/**
	 * Returns the event parameters as map
	 * @param {module:sap/base/Event} oEvent The event object to retrieve the parameters
	 * @returns {object} Map of event parameters
	 * @private
	 * @ui5-restricted sap/base/i18n sap.ui.core
	 */
	Event.getParameters = function(oEvent) {
		return oEvent[EVENT_PARAMETERS_SYMBOL];
	};

	return Event;
});