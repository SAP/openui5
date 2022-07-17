/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/write/_internal/connectors/LocalStorageConnector"
],
function(
	FakeLrepConnector,
	LocalStorageConnector
) {
	"use strict";

	/**
	 * Utility for storing changes in local storage.
	 *
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.48
	 * @alias sap.ui.fl.FakeLrepConnectorLocalStorage
	 */

	return {
		enableFakeConnector: function (mPropertyBag) {
			var sJsonPath = mPropertyBag ? mPropertyBag.sInitialComponentJsonPath : undefined;
			FakeLrepConnector.setFlexibilityServicesAndClearCache("LocalStorageConnector", sJsonPath);
		},
		disableFakeConnector: function () {
			FakeLrepConnector.disableFakeConnector();
		},
		forTesting: {
			spyWrite: function (sandbox, assert) {
				return FakeLrepConnector.forTesting.spyMethod(sandbox, assert, LocalStorageConnector, "write");
			},
			getNumberOfChanges: function (sReference) {
				return FakeLrepConnector.forTesting.getNumberOfChanges(LocalStorageConnector, sReference);
			},
			synchronous: {
				clearAll: function () {
					FakeLrepConnector.forTesting.synchronous.clearAll(window.localStorage);
				},
				store: function (sKey, oItem) {
					FakeLrepConnector.forTesting.synchronous.store(window.localStorage, sKey, oItem);
				}
			}
		}
	};
}, /* bExport= */ true);