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

	return FakeLrepConnectorStorage(FakeLrepLocalStorage);
}, /* bExport= */ true);