/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/write/_internal/connectors/ObjectPathConnector"
], function(
	FlexConfiguration,
	FlexState,
	ObjectStorageUtils,
	ObjectPathConnector
) {
	"use strict";

	var FakeLrepConnector = {};
	var FL_PREFIX = "sap.ui.fl";

	// prototype is used for overwriting methods (to stay compatible)
	FakeLrepConnector.prototype = {};

	FakeLrepConnector.setFlexibilityServicesAndClearCache = function(sStorageConnectorName, sInitialComponentJsonPath) {
		this._oFlexibilityServices = FlexConfiguration.getFlexibilityServices();

		var aConnectorConfig = [];
		if (sInitialComponentJsonPath) {
			ObjectPathConnector.setJsonPath(sInitialComponentJsonPath);
			aConnectorConfig.push({connector: "ObjectPathConnector"});
		}
		aConnectorConfig.push({connector: sStorageConnectorName});
		FlexConfiguration.setFlexibilityServices(aConnectorConfig);
		FlexState.clearState();
	};

	/**
	 * Restores the original {@link sap.ui.fl.LrepConnector.createConnector} factory function.
	 */
	FakeLrepConnector.disableFakeConnector = function() {
		FakeLrepConnector.prototype = {};
		FlexState.clearState();

		// only reset the flexibility Services in case they were changes by the FakeConnector before
		if (this._oFlexibilityServices) {
			FlexConfiguration.setFlexibilityServices(this._oFlexibilityServices);
			delete this._oFlexibilityServices;
		}
	};

	FakeLrepConnector.forTesting = {
		getNumberOfChanges(oConnector, sReference) {
			return oConnector.loadFlexData({reference: sReference})
			.then(function(aResponses) {
				return aResponses.reduce(function(iNumberOfChanges, oResponse) {
					return iNumberOfChanges + oResponse.changes.length;
				}, 0);
			});
		},
		spyMethod(sandbox, assert, oConnector, sMethod) {
			var oSpy = sandbox.spy(oConnector, sMethod);

			return function(iNumberOfExpectedObjects, iCallIndex) {
				iCallIndex ||= 0;
				var iNumberOfObjects = oSpy.getCall(iCallIndex).args[0].flexObjects.length;
				assert.equal(iNumberOfObjects, iNumberOfExpectedObjects, `${sMethod} was called ${iNumberOfExpectedObjects} times`);
			};
		},
		clear(oConnector, mPropertyBag) {
			FlexState.clearState();
			return oConnector.reset(mPropertyBag);
		},
		setStorage(oConnector, oNewStorage) {
			oConnector.storage = oNewStorage;
		},
		synchronous: {
			clearAll(oStorage) {
				var fnRemoveItem = function(sKey) {
					var bIsFlexObject = sKey.includes(FL_PREFIX);

					if (!bIsFlexObject) {
						return;
					}

					oStorage.removeItem(sKey);
				};

				Object.keys(oStorage).map(fnRemoveItem);
			},
			store(oStorage, sKey, oItem) {
				var sFlexKey = ObjectStorageUtils.createFlexKey(sKey);
				var sItem = JSON.stringify(oItem);
				oStorage.setItem(sFlexKey, sItem);
			},
			getNumberOfChanges(oStorage, sReference) {
				return Object.keys(oStorage).filter(function(sKey) {
					return sKey.includes(FL_PREFIX) && ObjectStorageUtils.isSameReference(JSON.parse(oStorage.getItem(sKey)), sReference);
				}).length;
			}
		}
	};

	return FakeLrepConnector;
}, true);