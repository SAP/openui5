/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(
	FakeLrepConnectorLocalStorage
) {
	/**
	 * Class handling the Fake Lrep storage for local storage;
	 * This class stays since some tests are still using this internal; We will remove this in the near future.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
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
