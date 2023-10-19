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
	 *
	 * @private
	 * @ui5-restricted
	 * @deprecated since 1.70. Configure the <code>sap.ui.core.Configuration.flexibilityServices</code> to use a test connector
	 * like <code>["LocalStorageConnector"]</code>, <code>["SessionStorageConnector"]</code> or <code>["JsObjectConnector"]</code>.
	 * @see {@link https://ui5.sap.com/#/topic/642dab291a7b47ec9d46c39b3c482aba|Boostrapping UI5 Flexibility}
	 */

	return {
		enableFakeConnector(mPropertyBag) {
			var sJsonPath = mPropertyBag ? mPropertyBag.sInitialComponentJsonPath : undefined;
			FakeLrepConnector.setFlexibilityServicesAndClearCache("SessionStorageConnector", sJsonPath);
		},
		disableFakeConnector() {
			FakeLrepConnector.disableFakeConnector();
		},
		forTesting: {
			spyWrite(sandbox, assert) {
				return FakeLrepConnector.forTesting.spyMethod(sandbox, assert, SessionStorageConnector, "write");
			},
			getNumberOfChanges(sReference) {
				return FakeLrepConnector.forTesting.getNumberOfChanges(SessionStorageConnector, sReference);
			},
			clear(mPropertyBag) {
				return FakeLrepConnector.forTesting.clear(SessionStorageConnector, mPropertyBag);
			},
			setStorage(oNewStorage) {
				FakeLrepConnector.forTesting.setStorage(SessionStorageConnector, oNewStorage);
			},
			synchronous: {
				clearAll() {
					FakeLrepConnector.forTesting.synchronous.clearAll(window.sessionStorage);
				},
				getNumberOfChanges(sReference) {
					return FakeLrepConnector.forTesting.synchronous.getNumberOfChanges(SessionStorageConnector.storage, sReference);
				}
			}
		}
	};
}, /* bExport= */ true);