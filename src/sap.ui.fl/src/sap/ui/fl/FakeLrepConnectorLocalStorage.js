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
	 *
	 * @private
	 * @ui5-restricted
	 * @deprecated since 1.70. Configure the <code>sap.ui.core.Configuration.flexibilityServices</code> to use a test connector
	 * like <code>["LocalStorageConnector"]</code>, <code>["SessionStorageConnector"]</code> or <code>["JsObjectConnector"]</code>.
	 * @see {@link https://ui5.sap.com/#/topic/642dab291a7b47ec9d46c39b3c482aba|Boostrapping UI5 Flexibility}
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