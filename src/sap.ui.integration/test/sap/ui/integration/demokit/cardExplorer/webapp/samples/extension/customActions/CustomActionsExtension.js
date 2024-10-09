sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition", "sap/ui/integration/library"], function (Extension, ActionDefinition, integrationLibrary) {
	"use strict";

	var CustomActionsExtension = Extension.extend("card.explorer.extension.customActions.CustomActionsExtension");

	const CardActionType = integrationLibrary.CardActionType;

	CustomActionsExtension.prototype.onCardReady = function () {
		var oCard = this.getCard();

		oCard.addActionDefinition(new ActionDefinition({
			type: "Custom",
			text: "{i18n>reportActionText}",
			icon: "sap-icon://learning-assistant",
			enabled: true,
			press: function (oEvent) {
				var oReportAction = oEvent.getSource();
				oReportAction.setEnabled(false);
			}
		}));

		// Actions can be added at any time, for example after response from a backend
		oCard.request({
				url: "./urlInfo.json"
			}).then(function (oRes) {

				oCard.addActionDefinition(new ActionDefinition({
					type: CardActionType.Navigation,
					text: "{i18n>bookActionText}",
					icon: "sap-icon://learning-assistant",
					parameters: {
						url: oRes.url
					},
					actionDefinitions: [
						new ActionDefinition({
							type: CardActionType.Navigation,
							startsSection: true,
							text: "Cloud as a Service",
							icon: "sap-icon://learning-assistant",
							parameters: {
								url: oRes.externalTrainingsUrl + "?course=cloud"
							}
						}),
						new ActionDefinition({
							type: CardActionType.Navigation,
							text: "Big Data Analytics",
							icon: "sap-icon://learning-assistant",
							parameters: {
								url: oRes.externalTrainingsUrl + "?course=bigdata"
							}
						}),
						new ActionDefinition({
							type: CardActionType.Navigation,
							startsSection: true,
							text: "Design for Dummies",
							icon: "sap-icon://learning-assistant",
							parameters: {
								url: oRes.externalTrainingsUrl + "?course=design"
							}
							}),
						new ActionDefinition({
							type: CardActionType.Navigation,
							text: "AI Eye Opener",
							icon: "sap-icon://learning-assistant",
							parameters: {
								url: oRes.externalTrainingsUrl + "?course=ai"
							}
						})
					]
				}));
			});
	};

	return CustomActionsExtension;
});