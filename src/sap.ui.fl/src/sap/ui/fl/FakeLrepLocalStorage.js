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
	 */

	"use strict";

	return {
		deleteChanges: function() {
			return FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();
		}
	};
}, /* bExport= */ true);
