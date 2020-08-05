/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	ObjectPathConnector,
	ObjectStorageUtils
) {
	"use strict";

	var FakeLrepConnector = {};
	var FL_PREFIX = "sap.ui.fl";

	// prototype is used for overwriting methods (to stay compatible)
	FakeLrepConnector.prototype = {};

	/**
	 * Enables fake LRep connector.
	 *
	 * Hooks into the {@link sap.ui.fl.LrepConnector.createConnector} factory function to enable the fake LRep connector.
	 * After enabling fake LRep connector, function {@link sap.ui.fl.FakeLrepConnector.disableFakeConnector} must be called to restore the original connector.
	 *
	 * @param {string} sInitialComponentJsonPath Relative path to a test-component-changes.json file
	 */
	FakeLrepConnector.enableFakeConnector = function(sInitialComponentJsonPath) {
		this.setFlexibilityServicesAndClearCache("LocalStorageConnector", sInitialComponentJsonPath);
	};

	FakeLrepConnector.setFlexibilityServicesAndClearCache = function(sStorageConnectorName, sInitialComponentJsonPath) {
		this._oFlexibilityServices = sap.ui.getCore().getConfiguration().getFlexibilityServices();

		var aConnectorConfig = [];
		if (sInitialComponentJsonPath) {
			ObjectPathConnector.setJsonPath(sInitialComponentJsonPath);
			aConnectorConfig.push({connector: "ObjectPathConnector"});
		}
		aConnectorConfig.push({connector: sStorageConnectorName});
		sap.ui.getCore().getConfiguration().setFlexibilityServices(aConnectorConfig);
		sap.ui.requireSync("sap/ui/fl/Cache").clearEntries();
	};

	/**
	 * Restores the original {@link sap.ui.fl.LrepConnector.createConnector} factory function.
	 */
	FakeLrepConnector.disableFakeConnector = function() {
		FakeLrepConnector.prototype = {};
		sap.ui.requireSync("sap/ui/fl/Cache").clearEntries();

		// only reset the flexibility Services in case they were changes by the FakeConnector before
		if (this._oFlexibilityServices) {
			sap.ui.getCore().getConfiguration().setFlexibilityServices(this._oFlexibilityServices);
			delete this._oFlexibilityServices;
		}
	};

	FakeLrepConnector.forTesting = {
		getNumberOfChanges: function (oConnector, sReference) {
			return oConnector.loadFlexData({reference: sReference})
			.then(function (aResponses) {
				return aResponses.reduce(function (iNumberOfChanges, oResponse) {
					return iNumberOfChanges + oResponse.changes.length;
				}, 0);
			});
		},
		spyMethod: function (sandbox, assert, oConnector, sMethod) {
			var oSpy = sandbox.spy(oConnector, sMethod);

			return function (iNumberOfExpectedObjects, iCallIndex) {
				iCallIndex = iCallIndex || 0;
				var iNumberOfObjects = oSpy.getCall(iCallIndex).args[0].flexObjects.length;
				assert.equal(iNumberOfObjects, iNumberOfExpectedObjects, sMethod + " was called " + iNumberOfExpectedObjects + " times");
			};
		},
		clear: function(oConnector, mPropertyBag) {
			sap.ui.requireSync("sap/ui/fl/Cache").clearEntries();
			return oConnector.reset(mPropertyBag);
		},
		setStorage: function(oConnector, oNewStorage) {
			oConnector.oStorage = oNewStorage;
		},
		synchronous: {
			clearAll: function (oStorage) {
				Object.keys(oStorage).map(function(sKey) {
					var bIsFlexObject = sKey.includes(FL_PREFIX);

					if (!bIsFlexObject) {
						return;
					}

					oStorage.removeItem(sKey);
				});
			},
			store: function (oStorage, sKey, oItem) {
				var sFlexKey = ObjectStorageUtils.createFlexKey(sKey);
				var sItem = JSON.stringify(oItem);
				oStorage.setItem(sFlexKey, sItem);
			},
			getNumberOfChanges: function(oStorage, sReference) {
				var iCount = 0;
				Object.keys(oStorage).map(function(sKey) {
					var bIsFlexObject = sKey.includes(FL_PREFIX);

					if (!bIsFlexObject) {
						return;
					}
					var oFlexObject = JSON.parse(oStorage.getItem(sKey));
					if (oFlexObject.reference === sReference || oFlexObject.reference + ".Component" === sReference) {
						iCount++;
					}
				});
				return iCount;
			}
		}
	};

	return FakeLrepConnector;
}, true);