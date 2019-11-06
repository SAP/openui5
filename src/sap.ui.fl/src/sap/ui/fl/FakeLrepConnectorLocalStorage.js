/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorStorage",
	"sap/ui/fl/FakeLrepLocalStorage"
],
function(
	FakeLrepConnectorStorage,
	FakeLrepLocalStorage
) {
	"use strict";

	/**
	 * Class for connecting to Fake LREP storing changes in local storage
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.48
	 * @alias sap.ui.fl.FakeLrepConnectorLocalStorage
	 */

	return FakeLrepConnectorStorage(FakeLrepLocalStorage, window.localStorage);
}, /* bExport= */ true);