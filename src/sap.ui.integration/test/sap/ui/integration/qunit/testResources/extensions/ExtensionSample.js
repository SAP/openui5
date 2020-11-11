sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	var ExtensionSample = Extension.extend("sap.ui.integration.qunit.testResources.extensions.ExtensionSample");

	ExtensionSample.prototype.init = function () {
		this.attachAction(function () {
			Log.error("Extension");
		});
	};

	return ExtensionSample;
});
