sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	var ExtensionPreventDefault = Extension.extend("sap.ui.integration.qunit.testResources.extensions.ExtensionPreventDefault");

	ExtensionPreventDefault.prototype.init = function () {
		this.attachAction(function (oEvent) {
			Log.error("Extension");
			oEvent.preventDefault();
		});
	};

	return ExtensionPreventDefault;
});
