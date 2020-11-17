sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var Extension2 = Extension.extend("sap.ui.integration.qunit.testResources.extensions.Extension2");

	Extension2.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			toUpperCase2: function (sValue) {
				return sValue.toUpperCase();
			}
		});
	};

	return Extension2;
});
