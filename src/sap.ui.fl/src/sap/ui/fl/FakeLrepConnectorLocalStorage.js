/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory"
	], function(
	FakeLrepLocalStorage, FakeLrepConnector, LrepConnector, Cache, ChangePersistenceFactory) {
	"use strict";

	FakeLrepConnectorLocalStorage._oBackendInstances = {};

	/**
	 * Class for connecting to Fake LREP storing changes in localStorage
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.48
	 * @alias sap.ui.fl.FakeLrepConnectorLocalStorage
	 */
	function FakeLrepConnectorLocalStorage(mSettings){
		this.mSettings = jQuery.extend({
			"isKeyUser": true,
			"isAtoAvailable": false,
			"isProductiveSystem": false
		}, mSettings);
	}

	jQuery.extend(FakeLrepConnectorLocalStorage.prototype, FakeLrepConnector.prototype);

	/**
	 * Creates a Fake Lrep change in localStorage
	 * @param  {Object|Array} vChangeDefinitions - single or multiple changeDefinitions
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.prototype.create = function(vChangeDefinitions) {
		var response;
		if (Array.isArray(vChangeDefinitions)) {
			response = vChangeDefinitions.map(function(mChangeDefinition) {
				return this._saveChange(mChangeDefinition);
			}.bind(this));
		} else {
			response = this._saveChange(vChangeDefinitions);
		}

		return Promise.resolve({
			response: response,
			status: 'success'
		});
	};

	FakeLrepConnectorLocalStorage.prototype._saveChange = function(mChangeDefinition) {
		if (!mChangeDefinition.creation){
			mChangeDefinition.creation = new Date().toISOString();
		}
		FakeLrepLocalStorage.saveChange(mChangeDefinition.fileName, mChangeDefinition);
		return mChangeDefinition;
	};


	FakeLrepConnectorLocalStorage.prototype.update = function(mChangeDefinition, sChangeName, aChangelist, bIsVariant) {
		return Promise.resolve({
			response: this._saveChange(mChangeDefinition),
			status: 'success'
		});
	};

	/**
	 * Deletes a Fake Lrep change in localStorage
	 * @param  {Object} oChange - The change object
	 * @param  {Object} oChange.sChangeName - File name of the change object
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.prototype.deleteChange = function(oChange) {

		FakeLrepLocalStorage.deleteChange(oChange.sChangeName);

		return Promise.resolve({
			response: undefined,
			status: "nocontent"
		});
	};

	/**
	 * Deletes all Fake Lrep changes in localStorage
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.prototype.deleteChanges = function() {

		FakeLrepLocalStorage.deleteChanges();

		return Promise.resolve({
			response: undefined,
			status: "nocontent"
		});
	};

	/**
	 * Loads the changes for the given Component class name
	 * from the FakeLrepLocalStorage
	 * and also loads the mandatory FakeLrepConnector.json file.
	 * The settings are take from the JSON file, but changes are replaced with
	 * the changes from the local storage.
	 *
	 * @param {String} sComponentClassName - Component class name
	 * @returns {Promise} Returns a Promise with the changes and componentClassName
	 * @public
	 */
	FakeLrepConnectorLocalStorage.prototype.loadChanges = function(sComponentClassName) {

		var aChanges = FakeLrepLocalStorage.getChanges();

		return new Promise(function(resolve, reject){
			var result = {
				changes: {
					changes : aChanges,
					contexts : [],
					settings : this.mSettings
				},
				componentClassName: sComponentClassName
			};
			resolve(result);
		}.bind(this));

	};

	/**
	 * Enables fake LRep connector.
	 *
	 * Hooks into the {@link sap.ui.fl.LrepConnector.createConnector} factory function to enable the fake LRep connector.
	 * If the <code>sAppComponentName</code> is provided, replaces the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by a fake one.
	 * After enabling fake LRep connector, function {@link sap.ui.fl.FakeLrepConnectorLocalStorage.disableFakeConnector} must be called to restore the original connector.
	 *
	 * @param {object} [mSettings] - map of FakeLrepConnector settings
	 * @param {string} [sAppComponentName] - Name of application component to overwrite the existing LRep connector
	 * @param {string} [sAppVersion] - Version of application to overwrite the existing LRep connector
	 */
	FakeLrepConnectorLocalStorage.enableFakeConnector = function(mSettings, sAppComponentName, sAppVersion){
		mSettings = mSettings || {};

		function replaceConnectorFactory() {
			FakeLrepConnectorLocalStorage.enableFakeConnector.original = LrepConnector.createConnector;
			LrepConnector.createConnector = function() {
				if (!FakeLrepConnectorLocalStorage._oFakeInstance){
					FakeLrepConnectorLocalStorage._oFakeInstance = new FakeLrepConnectorLocalStorage(mSettings);
				}
				return FakeLrepConnectorLocalStorage._oFakeInstance;
			};
		}

		if (sAppComponentName && sAppVersion) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
			if (!(oChangePersistence._oConnector instanceof FakeLrepConnectorLocalStorage)) {
				Cache.clearEntry(sAppComponentName, sAppVersion);
				if (!FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName]){
					FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName] = {};
				}
				FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion] = oChangePersistence._oConnector;
				oChangePersistence._oConnector = new FakeLrepConnectorLocalStorage(mSettings);
			}
			replaceConnectorFactory();
			return;
		}

		Cache.clearEntries();

		if (FakeLrepConnectorLocalStorage.enableFakeConnector.original){
			return;
		}
		replaceConnectorFactory();
	};

	/**
	 * Restores the original {@link sap.ui.fl.LrepConnector.createConnector} factory function.
	 * If the <code>sAppComponentName</code> is provided, restores the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by the original one.
	 *
	 * @param {string} [sAppComponentName] - Name of application component to restore the original LRep connector
	 * @param {string} [sAppVersion] - Version of application to restore the original LRep connector
	 */
	FakeLrepConnectorLocalStorage.disableFakeConnector = function(sAppComponentName, sAppVersion){

		function restoreConnectorFactory() {
			if (FakeLrepConnectorLocalStorage.enableFakeConnector.original){
				LrepConnector.createConnector = FakeLrepConnectorLocalStorage.enableFakeConnector.original;
				FakeLrepConnectorLocalStorage.enableFakeConnector.original = undefined;
				FakeLrepConnectorLocalStorage._oFakeInstance = undefined;
			}
		}

		if (sAppComponentName && sAppVersion) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
			if (!(oChangePersistence._oConnector instanceof LrepConnector)){
				Cache.clearEntry(sAppComponentName, sAppVersion);
				if (FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName] && FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion]) {
					oChangePersistence._oConnector = FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion];
					FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion] = undefined;
				}
			}
			restoreConnectorFactory();
			return;
		}

		Cache.clearEntries();
		restoreConnectorFactory();
	};

	return FakeLrepConnectorLocalStorage;

}, /* bExport= */ true);