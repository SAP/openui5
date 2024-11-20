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
			type: "Navigation",
			parameters: {
				url: "https://training.sap.com/",
				target: "_blank"
			},
			icon: "sap-icon://learning-assistant",
			text: "Book 3rd party training"
		}));

		// Delayed actions
		setTimeout(() => {
            oCard.addActionDefinition(new ActionDefinition({
                type: CardActionType.Navigation,
                text: "Delayed Action",
                icon: "sap-icon://learning-assistant",
                actionDefinitions: [
                    new ActionDefinition({
                        type: CardActionType.Navigation,
                        startsSection: true,
                        text: "Cloud as a Service",
                        icon: "sap-icon://learning-assistant",
                        parameters: {
                            url: "?course=cloud"
                        }
                    }),
                    new ActionDefinition({
                        type: CardActionType.Navigation,
                        text: "Big Data Analytics",
                        icon: "sap-icon://learning-assistant",
                        parameters: {
                            url: "?course=bigdata"
                        }
                    })
                ]
            }));
        }, 2000);
	};

	return ActionsExtension;
});