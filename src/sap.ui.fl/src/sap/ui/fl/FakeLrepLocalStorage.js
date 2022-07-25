/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(
	FakeLrepConnectorLocalStorage
) {
	/**
	 * Utility handling the Fake Lrep storage for local storage;
	 *
	 * This class stays since some tests are still using this internal; We will remove this in the near future.
	 *
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.48
	 * @alias sap.ui.fl.FakeLrepLocalStorage
	 *
	 * @private
	 * @ui5-restricted
	 * @deprecated since 1.70. Configure the <code>sap.ui.core.Configuration.flexibilityServices</code> to use a test connector
	 * like <code>["LocalStorageConnector"]</code>, <code>["SessionStorageConnector"]</code> or <code>["JsObjectConnector"]</code>.
	 * @see {@link https://ui5.sap.com/#/topic/642dab291a7b47ec9d46c39b3c482aba|Boostrapping UI5 Flexibility}
	 */

	"use strict";

	return {
		deleteChanges: function() {
			return FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();
		}
	};
}, /* bExport= */ true);
