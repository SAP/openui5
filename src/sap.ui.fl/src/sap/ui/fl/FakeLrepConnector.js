/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/thirdparty/URI", "sap/ui/fl/Utils", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache", "sap/ui/fl/ChangePersistenceFactory"
], function(jQuery, uri, FlexUtils, LrepConnector, Cache, ChangePersistenceFactory) {
	"use strict";
	var oLrepConnector = Object.create(LrepConnector.prototype);
	FakeLrepConnector._oBackendInstances = {};

	/**
	 * Please use the {@link FakeLrepConnector#enableFakeConnector} function
	 * to enable the FakeLrepConnector.
	 *
	 * Provides a fake implementation for the sap.ui.fl.LrepConnector
	 * @param {String} sInitialComponentJsonPath - the relative path to a test-component-changes.json file
	 *
	 * @constructor
	 * @alias sap.ui.fl.FakeLrepConnector
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 */
	function FakeLrepConnector(sInitialComponentJsonPath){
		this.sInitialComponentJsonPath = sInitialComponentJsonPath;
	}

	for (var prop in oLrepConnector){
		if (typeof oLrepConnector[prop] === 'function'){
			/*eslint-disable noinspection, no-loop-func */
			FakeLrepConnector.prototype[prop] = (function(prop){
				return function() {
					throw new Error('Method ' + prop + '() is not implemented in FakeLrepConnector.');
				};
			}(prop));
			/*eslint-enable noinspection, no-loop-func */
		}
	}

	FakeLrepConnector.prototype.loadChanges = function(sComponentClassName){
		var initialComponentJsonPath = this.sInitialComponentJsonPath;

		return new Promise(function(resolve, reject){
			jQuery.getJSON(initialComponentJsonPath).done(function(oResponse){
				var result = {
					changes: oResponse,
					componentClassName: sComponentClassName
				};

				resolve(result);
			}).fail(function(error){
				reject(error);
			});
		});
	};

	FakeLrepConnector.prototype.create = function(payload, changeList, isVariant){
		// REVISE ensure old behavior for now, but check again for changes
		if (!isVariant){
			return Promise.resolve();
		}

		if (!payload.creation){
			payload.creation = new Date().toISOString();
		}

		return Promise.resolve({
			response: payload,
			status: 'success'
		});
	};

	FakeLrepConnector.prototype.update = function(payload, changeName, changelist, isVariant) {
		// REVISE ensure old behavior for now, but check again for changes
		if (!isVariant){
			return Promise.resolve();
		}

		return Promise.resolve({
			response: payload,
			status: 'success'
		});
	};

	FakeLrepConnector.prototype.deleteChange = function(params, isVariant){
		// REVISE ensure old behavior for now, but check again for changes
		if (!isVariant){
			return Promise.resolve();
		}

		return Promise.resolve({
			response: undefined,
			status: 'nocontent'
		});
	};

	FakeLrepConnector.prototype.send = function(sUri, sMethod, oData, mOptions){
		return new Promise(function(resolve, reject){
			handleGetTransports(sUri, sMethod, oData, mOptions, resolve, reject);
			handleMakeChangesTransportable(sUri, sMethod, oData, mOptions, resolve, reject);
			handleManifirstSupport(sUri, sMethod, oData, mOptions, resolve, reject);
			handleResetChanges(sUri, sMethod, oData, mOptions, resolve, reject);
		});
	};

	function handleResetChanges(sUri, sMethod, oData, mOptions, resolve) {
		if (sUri.match(/^\/sap\/bc\/lrep\/changes\//) && sMethod === 'DELETE') {
			var aUriParameters = [];
			var regExp = /\?reference=([\w.]+)\&.+\&layer=(\w+)\&generator=([\w.]+)/;
			aUriParameters = sUri.match(regExp);
			resolve({
				response: {
					"parameters": aUriParameters
				},
				status: "success"
			});
		}
	}

	function handleManifirstSupport(sUri, sMethod, oData, mOptions, resolve) {
		if (sUri.match(/^\/sap\/bc\/ui2\/app_index\/ui5_app_mani_first_supported\//) && sMethod === 'GET') {
			resolve({
				response: false,
				status: "success"
			});
		}
	}

	function handleMakeChangesTransportable(sUri, sMethod, oData, mOptions, resolve){
		if (sUri.match(/^\/sap\/bc\/lrep\/actions\/make_changes_transportable\//) && sMethod === 'POST'){
			resolve();
		}
	}

	//REVISE Make response configurable
	function handleGetTransports(sUri, sMethod, oData, mOptions, resolve, reject){
		if (sUri.match(/^\/sap\/bc\/lrep\/actions\/gettransports\//)){
			resolve({
				response: {
					"transports": [
						{
							"transportId": "U31K008488",
							"description": "The Ultimate Transport",
							"owner": "Fantasy Owner",
							"locked": false
						}
					],
					"localonly": false,
					"errorCode": ""
				}
			});
		}
	}

	/**
	 * Enables fake LRep connector.
	 *
	 * Hooks into the {@link sap.ui.fl.LrepConnector.createConnector} factory function to enable the fake LRep connector.
	 * If the <code>sAppComponentName</code> is provided, replaces the connector instance of corresponding {@link sap.ui.fl.ChangePersistence} by a fake one.
	 * After enabling fake LRep connector, function {@link sap.ui.fl.FakeLrepConnector.disableFakeConnector} must be called to restore the original connector.
	 *
	 * @param {string} sInitialComponentJsonPath - Relative path to a test-component-changes.json file
	 * @param {string} [sAppComponentName] - Name of application component to overwrite the existing LRep connector
	 * @param {string} [sAppVersion] - Version of application to overwrite the existing LRep connector
	 */
	FakeLrepConnector.enableFakeConnector = function(sInitialComponentJsonPath, sAppComponentName, sAppVersion){

		function replaceConnectorFactory() {
			FakeLrepConnector.enableFakeConnector.original = LrepConnector.createConnector;
			LrepConnector.createConnector = function(){
				if (!FakeLrepConnector._oFakeInstance){
					FakeLrepConnector._oFakeInstance = new FakeLrepConnector(sInitialComponentJsonPath);
				}
				return FakeLrepConnector._oFakeInstance;
			};
		}

		if (sAppComponentName && sAppVersion) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
			if (!(oChangePersistence._oConnector instanceof FakeLrepConnector)){
				Cache.clearEntry(sAppComponentName, sAppVersion);
				if (!FakeLrepConnector._oBackendInstances[sAppComponentName]){
					FakeLrepConnector._oBackendInstances[sAppComponentName] = {};
				}
				FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion] = oChangePersistence._oConnector;
				oChangePersistence._oConnector = new FakeLrepConnector(sInitialComponentJsonPath);
			}
			replaceConnectorFactory();
			return;
		}

		Cache.clearEntries();

		if (FakeLrepConnector.enableFakeConnector.original){
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
	FakeLrepConnector.disableFakeConnector = function(sAppComponentName, sAppVersion){

		function restoreConnectorFactory() {
			if (FakeLrepConnector.enableFakeConnector.original){
				LrepConnector.createConnector = FakeLrepConnector.enableFakeConnector.original;
				FakeLrepConnector.enableFakeConnector.original = undefined;
				FakeLrepConnector._oFakeInstance = undefined;
			}
		}

		if (sAppComponentName && sAppVersion) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
			if (!(oChangePersistence._oConnector instanceof LrepConnector)) {
				Cache.clearEntry(sAppComponentName, sAppVersion);
				if (FakeLrepConnector._oBackendInstances[sAppComponentName] && FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion]) {
					oChangePersistence._oConnector = FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion];
					FakeLrepConnector._oBackendInstances[sAppComponentName][sAppVersion] = undefined;
				}
			}
			restoreConnectorFactory();
			return;
		}

		Cache.clearEntries();
		restoreConnectorFactory();
	};

	return FakeLrepConnector;

}, true);
