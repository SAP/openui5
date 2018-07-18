/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FakeLrepStorage"
], function(
	FakeLrepStorage
) {
	"use strict";

	return FakeLrepStorage(window.sessionStorage);
}, /* bExport= */ true);