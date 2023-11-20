sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var ExtensionLegacy = Extension.extend("sap.ui.integration.qunit.extensions.ExtensionLegacy");

	ExtensionLegacy.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setActions([
			{
				type: 'Navigation',
				url: "http://www.sap.com",
				target: "_blank",
				text: 'AutoOpen - SAP website - Extension'
			}
		]);
	};

	return ExtensionLegacy;
});
