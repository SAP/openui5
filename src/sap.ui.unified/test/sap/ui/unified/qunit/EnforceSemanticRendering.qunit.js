sap.ui.define([
	"sap/ui/test/generic/_EnforceSemanticRendering"
], function(_EnforceSemanticRendering) {
	"use strict";

	return _EnforceSemanticRendering.run({
		library: "sap.ui.unified",
		excludes: [
			"sap.ui.unified.ContentSwitcher", // deprecated
			"sap.ui.unified.Shell", // deprecated
			"sap.ui.unified.ShellLayout", // deprecated
			"sap.ui.unified.ShellOverlay", // deprecated
			"sap.ui.unified.SplitContainer" // deprecated
		]
	});
});
