/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(BaseObject, merge, JsControlTreeModifier) {
	"use strict";

	var oModificationHandler;

	/**
	 *  @class Interface to implement different modification layers
	 *  (E.g. Flex-explicit, Flex-implicit, transient)
	 *
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.87.0
	 * @experimental As of version 1.87.0
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.mdc.p13n.modification.ModificationHandler
	 */
	var ModificationHandler = BaseObject.extend("sap.ui.mdc.p13n.modification.ModificationHandler");

	/**
	 * Should implement the appliance of changes
	 *
	 * @param {array} aChanges An array of changes
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @returns {Promise} Returns a <code>Promise</code> reflecting change processing
	 */
	ModificationHandler.prototype.processChanges = function(aChanges, oModificationPayload){
		return Promise.resolve();
	};

	/**
	 * Should implement a function that returns a promise resolving
	 * after the current pending changes have been applied.
	 *
	 * @param {object} mPropertyBag A propertybag containing modification specific configuration
	 * @param {sap.ui.core.Element} mPropertyBag.element The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @returns {Promise} Returns a <code>Promise</code> reflecting change appliance

	 */
	ModificationHandler.prototype.waitForChanges = function(mPropertyBag, oModificationPayload) {
		return Promise.resolve();
	};

	/**
	 * Should implement a function that returns a promise resolving
	 * after the current pending changes have been reset.
	 *
	 * @param {object} mPropertyBag A propertybag containing modification specific configuration
	 * @param {sap.ui.core.Element} mPropertyBag.selector The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @returns {Promise} Returns a <code>Promise</code> reflecting the reset execution
	 */
	ModificationHandler.prototype.reset = function(mPropertyBag, oModificationPayload) {
		return Promise.resolve();
	};

	/**
	 * Should implement a function that returns information ont modification support
	 *
	 * @param {object} mPropertyBag A propertybag containing modification specific configuration
	 * @param {sap.ui.core.Element} mPropertyBag.selector The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
 	 * @returns {boolean} reflects the modification support state
	 */
	ModificationHandler.prototype.isModificationSupported = function(mPropertyBag, oModificationPayload){
		return false;
	};

	ModificationHandler.getInstance = function() {
		if (!oModificationHandler){
			oModificationHandler = new ModificationHandler();
		}
		return oModificationHandler;
	};

	return ModificationHandler;
});
