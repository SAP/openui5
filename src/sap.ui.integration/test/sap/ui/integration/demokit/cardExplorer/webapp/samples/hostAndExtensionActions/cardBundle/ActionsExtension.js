sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var ActionsExtension = Extension.extend( "card.explorer.sample.hostAndExtensionActions.list.card.ActionsExtension");

	ActionsExtension.prototype.init = function () {
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

	return ActionsExtension;
});