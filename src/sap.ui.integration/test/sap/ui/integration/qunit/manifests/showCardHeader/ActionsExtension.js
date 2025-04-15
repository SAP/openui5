sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/library"
], function (Extension, ActionDefinition, integrationLibrary) {
	"use strict";

	const CardActionType = integrationLibrary.CardActionType;

	const ActionsExtension = Extension.extend("test.manifest.showCardHeader.ActionsExtension");

	ActionsExtension.prototype.onCardReady = function () {
		const oCard = this.getCard();

		oCard.addActionDefinition(new ActionDefinition({
			type: CardActionType.Navigation,
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