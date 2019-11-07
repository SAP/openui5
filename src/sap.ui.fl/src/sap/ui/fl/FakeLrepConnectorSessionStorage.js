/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/apply/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
],
function(
	FakeLrepConnector,
	ApplySessionStorageConnector,
	WriteSessionStorageConnector
) {
	"use strict";

	/**
	 * Class for storing changes in session storage
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
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
				return FakeLrepConnector.forTesting.spyMethod(sandbox, assert, WriteSessionStorageConnector, "write");
			},
			getNumberOfChanges: function (sReference) {
				return FakeLrepConnector.forTesting.getNumberOfChanges(ApplySessionStorageConnector, sReference);
			}
		}
	};
}, /* bExport= */ true);