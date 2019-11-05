/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepConnectorStorage",
	"sap/ui/fl/FakeLrepSessionStorage"
],
function(
	FakeLrepConnectorStorage,
	FakeLrepSessionStorage
) {
	"use strict";

	/**
	 * Class for connecting to Fake LREP storing changes in session storage
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

	return FakeLrepConnectorStorage(FakeLrepSessionStorage, window.sessionStorage);
}, /* bExport= */ true);