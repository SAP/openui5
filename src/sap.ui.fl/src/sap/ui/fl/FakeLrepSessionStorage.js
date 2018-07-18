/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepStorage"
], function(
	FakeLrepStorage
) {
	/**
	 * Class handling the Fake Lrep storage for session storage
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.58
	 * @alias sap.ui.fl.FakeLrepSessionStorage
	 */

	"use strict";

	return FakeLrepStorage(window.sessionStorage);
}, /* bExport= */ true);