/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepStorage"
], function(
	FakeLrepStorage
) {
	/**
	 * Class handling the Fake Lrep storage for local storage
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

	return FakeLrepStorage(window.localStorage);
}, /* bExport= */ true);