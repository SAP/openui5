/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache"
	], function(
	FakeLrepLocalStorage, FakeLrepConnector, LrepConnector, Cache ) {
	"use strict";

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
	 * @param  {Object} oChange - the change Object
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.prototype.deleteChange = function(oChange) {

		FakeLrepLocalStorage.deleteChange(oChange.fileName);

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
					settings : this.mSettings
				},
				componentClassName: sComponentClassName
			};
			resolve(result);
		}.bind(this));

	};

	/**
	 * Hooks into the @link {sap.ui.fl.LrepConnector.createConnector} factory
	 * function to enable the fake lrep connector.
	 *
	 * @param sInitialComponentJsonPath - the relative path to a test-component-changes.json file
	 */
	FakeLrepConnectorLocalStorage.enableFakeConnector = function(mSettings){
		Cache._entries = {};

		if (FakeLrepConnectorLocalStorage.fnOriginalCreateConnector){
			return;
		}

		FakeLrepConnectorLocalStorage.fnOriginalCreateConnector = LrepConnector.createConnector;

		LrepConnector.createConnector = function(){
			if (!FakeLrepConnectorLocalStorage._oInstance) {
				FakeLrepConnectorLocalStorage._oInstance = new FakeLrepConnectorLocalStorage(mSettings);
			}

			return FakeLrepConnectorLocalStorage._oInstance;
		};
	};

	/**
	 * Restore the original @link {sap.ui.fl.LrepConnector.createConnector} factory
	 * function.
	 */
	FakeLrepConnectorLocalStorage.disableFakeConnector = function(){
		Cache._entries = {};
		if (FakeLrepConnectorLocalStorage.fnOriginalCreateConnector){
			LrepConnector.createConnector = FakeLrepConnectorLocalStorage.fnOriginalCreateConnector;
			delete FakeLrepConnectorLocalStorage.fnOriginalCreateConnector;
			delete FakeLrepConnectorLocalStorage._oInstance;
		}
	};

	return FakeLrepConnectorLocalStorage;

}, /* bExport= */ true);