sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var ActionsExtension = Extension.extend( "card.explorer.sample.hostAndExtensionActions.list.card.ActionsExtension");

	ActionsExtension.prototype.onCardReady = function () {

		this.getCard().addActionDefinition(new ActionDefinition({
			type: "Navigation",
			parameters: {
				url: "https://training.sap.com/",
				target: "_blank"
			},
			icon: "sap-icon://learning-assistant",
			text: "Book 3rd party training"
		}));
	};

	return ActionsExtension;
});