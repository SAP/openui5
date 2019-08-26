/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/Connector",
	"sap/ui/fl/write/_internal/Connector"
], function(
	ApplyConnector,
	WriteConnector
) {
	"use strict";

	/**
	 * Adapts the existing @see sap.ui.fl.LrepConnector API to the new apply/write.Connector API
	 *
	 * @namespace sap.ui.fl.write._internal.CompatibilityConnector
	 * @experimental Since 1.71
	 * @since 1.71
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */


	var CompatibilityConnector = function() {};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.loadChanges
	 * @see sap.ui.fl.apply._internal.Connector.loadFlexData
	 * @param {object} mComponent - Contains component data needed for reading changes
	 * @param {string} mComponent.name - Name of component
	 * @param {string} [mComponent.appVersion] - Current running version of application
	 * @returns {Promise} Returns a Promise with the changes response
	 */
	CompatibilityConnector.prototype.loadChanges = function(mComponent) {
		return ApplyConnector.loadFlexData({
			reference: mComponent.name,
			appVersion: mComponent.appVersion
			//,cacheKey: "" //read from async hints
		}).then(function(mFlexData) {
			return {
				changes: mFlexData,
				loadModules: false
				//TODO check other return values build in LrepConnector.prototype._onChangeResponseReceived
			};
		});
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.loadSettings
	 * @see sap.ui.fl.apply._internal.Connector.loadFlexData
	 * @returns {Promise} Returns a Promise with the settings response
	 */
	CompatibilityConnector.prototype.loadSettings = function() {
		return WriteConnector.loadFeatures();
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.create
	 * @see sap.ui.fl.apply._internal.Connector.write
	 *
	 * @param {object} oPayload The content which is send to the server
	 * @param {string} [sChangelist] The transport ID will be handled internally, so there is no need to be passed.
	 * @param {boolean} bIsVariant - is variant?
	 * @returns {Promise} Resolve if successful, rejects with errors
	 */
	CompatibilityConnector.prototype.create = function(vFlexObjects /*, sChangelist, bIsVariant */) {
		var aFlexObjects = vFlexObjects;
		if (!Array.isArray(aFlexObjects)) {
			aFlexObjects = [vFlexObjects];
		}
		return WriteConnector.write({
			layer : aFlexObjects[0].layer,
			flexObjects: aFlexObjects
		});
	};

	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.update
	 *
	 * @param {object} oPayload The content which is send to the server
	 * @param {string} sChangeName Name of the change
	 * @param {string} sChangelist (optional) The transport ID.
	 * @param {boolean} bIsVariant - is variant?
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.prototype.update = function(/* oPayload, sChangeName, sChangelist, bIsVariant */) {
		return Promise.reject("not implemented");
	};


	/**
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.deleteChange
	 *
	 * @param {string} mParameters property bag
	 * @param {string} mParameters.sChangeName - name of the change
	 * @param {string} [mParameters.sLayer="USER"] - other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER
	 * @param {string} mParameters.sNamespace - the namespace of the change file
	 * @param {string} mParameters.sChangelist - The transport ID
	 * @param {boolean} bIsVariant - is it a variant?
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.prototype.deleteChange = function(/* mParameters, bIsVariant */) {
		return Promise.reject("not implemented");
	};

	/**
	 *
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.getFlexInfo
	 * @see sap.ui.fl.apply._internal.Connector.getFlexInfo
	 *
	 * @param {object} mPropertyBag Contains additional data needed for flex/info request
	 * @param {string} mPropertyBag.reference Name of Component
	 * @param {string} mPropertyBag.layer Layer on which the request is sent to the the backend
	 * @param {string} [mPropertyBag.appVersion] Version of the application that is currently running
	 * @returns {Promise<object>} Promise resolves as soon as the writing was completed
	 */
	CompatibilityConnector.prototype.getFlexInfo = function(mParameters) {
		return WriteConnector.getFlexInfo(mParameters);
	};

	/**
	 *
	 * Maps the existing API to the new API
	 * @see sap.ui.fl.LrepConnector.prototype.resetChanges
	 * @see sap.ui.fl.apply._internal.Connector.reset
	 *
	 * @param {string} mParameters property bag
	 * @param {string} mParameters.sReference - flex reference
	 * @param {string} mParameters.sAppVersion - version of the application for which the reset takes place
	 * @param {string} [mParameters.sLayer="USER"] - other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER
	 * @param {string} mParameters.sChangelist - The transport ID
	 * @param {string} mParameters.sGenerator - generator with which the changes were created
	 * @param {string} mParameters.aSelectorIds - selector IDs of controls for which the reset should filter
	 * @param {string} mParameters.aChangeTypes - change types of the changes which should be reset
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.prototype.resetChanges = function(mParameters) {
		return WriteConnector.reset({
			reference: mParameters.sReference,
			layer: mParameters.sLayer,
			appVersion: mParameters.sAppVersion,
			generator: mParameters.sGenerator,
			selectorIds: mParameters.aSelectorIds,
			changeTypes: mParameters.aChangeTypes
		});
	};

	/**
	 * @param {string} sOriginNamespace The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".
	 * @param {string} sName Name of the change
	 * @param {string} sType File type extension
	 * @param {string} sOriginLayer File layer
	 * @param {string} sTargetLayer File where the new Target-Layer
	 * @param {string} sTargetNamespace target namespace
	 * @param {string} sChangelist The changelist where the file will be written to
	 * @returns {Promise<object>} Returns the result from the request
	 */
	CompatibilityConnector.prototype.publish = function(/* sOriginNamespace, sName, sType, sOriginLayer, sTargetLayer, sTargetNamespace, sChangelist */) {
		return Promise.reject("not implemented");
	};

	return CompatibilityConnector;
}, true);
