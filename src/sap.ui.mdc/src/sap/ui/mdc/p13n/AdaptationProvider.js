/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object"
], function(BaseObject) {
	"use strict";

	/**
	 * @class Interface to implement basic adaptation functionality.
	 * Implementing this interface enables the usage of certain p13n
	 * modules such as the UIManager and the DefaultProviderRegistry.
	 *
	 * @author SAP SE
	 * @since 1.90
	 * @experimental As of version 1.90
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.mdc.p13n.AdaptationProvider
	 */
	var AdaptationProvider = BaseObject.extend("sap.ui.mdc.p13n.AdaptationProvider", {
		metadata: {
			baseType : "sap.ui.mdc.p13n.AdaptationProvider"
		}
	});

	/**
	 * Initialize adaptation for a provided control instance, set of keys and properties
	 *
	 * @param {string|sap.ui.core.Control} vControl The control id or instance
	 * @param {Array} aKeys An Array of keys
	 * @param {Array} [aCustomInfo] An Array of propertyinfos
	 *
	 * @returns {Promise} A Promise resolving in the according property helper instance
	 */
	AdaptationProvider.prototype.initAdaptation = function(vControl, aKeys, aCustomInfo){
		throw new Error("Please implement 'initAdaptation'");
	};

	/**
	 * Reset the personalization for a provided control instance and key
	 *
	 * @param {sap.ui.core.Control} oControl The control instance
	 * @param {string} sKey Key to be affected by reset
	 *
	 * @returns {Promise} A Promise resolving after the reset has been processed
	 */
	AdaptationProvider.prototype.reset = function(oControl, sKey){
		throw new Error("Please implement 'reset'");
	};

	/**
	 * Reset the personalization for a provided control instance and key
	 *
	 * @param {sap.ui.core.Control} oControl The control instance
	 * @param {Array} aKeys An Array of keys
	 *
	 * @returns {Promise} A Promise resolving after all changes have been processed
	 */
	AdaptationProvider.prototype.handleP13n = function(oControl, aKeys){
		throw new Error("Please implement 'handleP13n'");
	};

	return AdaptationProvider;
});
