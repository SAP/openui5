sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var CustomFormattersExtension = Extension.extend("card.explorer.extension.customFormatters.CustomFormattersExtension");

	CustomFormattersExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			toUpperCase: function (sName) {
				return sName.toUpperCase();
			},
			appendSuffix: function (sDescription) {
				var oParameters = this.getCard().getCombinedParameters();
				return sDescription + ". Available since: " + oParameters.suffix;
			}.bind(this)
		});
	};

	return CustomFormattersExtension;
});
