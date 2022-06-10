sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var SharedExtension = Extension.extend("card.explorer.my.lib.SharedExtension");

	SharedExtension.prototype.init = function () {
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

	SharedExtension.prototype.getData = function() {
		return this.getCard().request({
			"url": "./trainings.json"
		});
	};

	return SharedExtension;
});