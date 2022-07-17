/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
],
function(
	FakeLrepConnector,
	SessionStorageConnector
) {
	"use strict";

	/**
	 * Utility for storing changes in session storage.
	 *
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.58
	 * @alias sap.ui.fl.FakeLrepConnectorSessionStorage
	 */

	return {
		enableFakeConnector: function (mPropertyBag) {
			var sJsonPath = mPropertyBag ? mPropertyBag.sInitialComponentJsonPath : undefined;
			FakeLrepConnector.setFlexibilityServicesAndClearCache("SessionStorageConnector", sJsonPath);
		},
		disableFakeConnector: function() {
			FakeLrepConnector.disableFakeConnector();
		},
		forTesting: {
			spyWrite: function (sandbox, assert) {
				return FakeLrepConnector.forTesting.spyMethod(sandbox, assert, SessionStorageConnector, "write");
			},
			getNumberOfChanges: function (sReference) {
				return FakeLrepConnector.forTesting.getNumberOfChanges(SessionStorageConnector, sReference);
			},
			clear: function(mPropertyBag) {
				return FakeLrepConnector.forTesting.clear(SessionStorageConnector, mPropertyBag);
			},
			setStorage: function(oNewStorage) {
				FakeLrepConnector.forTesting.setStorage(SessionStorageConnector, oNewStorage);
			},
			synchronous: {
				clearAll: function () {
					FakeLrepConnector.forTesting.synchronous.clearAll(window.sessionStorage);
				},
				getNumberOfChanges: function(sReference) {
					return FakeLrepConnector.forTesting.synchronous.getNumberOfChanges(SessionStorageConnector.storage, sReference);
				}
			}
		}
	};
}, /* bExport= */ true);