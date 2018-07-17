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

	return FakeLrepConnectorStorage(FakeLrepSessionStorage);
}, /* bExport= */ true);