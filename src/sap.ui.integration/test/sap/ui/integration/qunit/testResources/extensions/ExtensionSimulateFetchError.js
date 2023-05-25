sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var ExtensionSimulateFetchError = Extension.extend("sap.ui.integration.qunit.testResources.extensions.ExtensionSimulateFetchError");

	ExtensionSimulateFetchError.prototype.fetch = function () {
		throw new Error("Simulated fetch error");
	};

	return ExtensionSimulateFetchError;
});
