/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/thirdparty/URI", "sap/ui/fl/Utils", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache"
], function(jQuery, uri, FlexUtils, LrepConnector, Cache) {
	"use strict";
	var lrepConnector = Object.create(LrepConnector.prototype);
	var instance;

	/**
	 * Please use the @link {FakeLrepConnector#enableFakeConnector} function
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

	for (var prop in lrepConnector){
		if (typeof lrepConnector[prop] === 'function'){
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
		});
	};

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
	 * Hooks into the @link {sap.ui.fl.LrepConnector.createConnector} factory
	 * function to enable the fake lrep connector.
	 *
	 * @param sInitialComponentJsonPath - the relative path to a test-component-changes.json file
	 */
	FakeLrepConnector.enableFakeConnector = function(sInitialComponentJsonPath){
		Cache._entries = {};

		if (FakeLrepConnector.enableFakeConnector.original){
			return;
		}

		FakeLrepConnector.enableFakeConnector.original = LrepConnector.createConnector;

		LrepConnector.createConnector = function(){
			if (!instance) {
				instance = new FakeLrepConnector(sInitialComponentJsonPath);
			}

			return instance;
		};
	};

	/**
	 * Restore the original @link {sap.ui.fl.LrepConnector.createConnector} factory
	 * function.
	 */
	FakeLrepConnector.disableFakeConnector = function(){
		if (FakeLrepConnector.enableFakeConnector.original){
			LrepConnector.createConnector = FakeLrepConnector.enableFakeConnector.original;
		}
	};

	return FakeLrepConnector;

}, true);
