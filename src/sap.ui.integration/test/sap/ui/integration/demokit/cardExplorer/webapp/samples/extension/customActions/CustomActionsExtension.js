sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var CustomActionsExtension = Extension.extend("card.explorer.extension.customActions.CustomActionsExtension");

	CustomActionsExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setActions([
			{
				type: "Navigation",
				parameters: {
					url: "https://training.sap.com/"
				},
				icon: "sap-icon://learning-assistant",
				target: "_blank",
				text: "Book 3rd party training"
			}
		]);
	};

	return CustomActionsExtension;
});