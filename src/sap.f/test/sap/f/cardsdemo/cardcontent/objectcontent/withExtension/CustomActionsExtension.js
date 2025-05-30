sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var CustomActionsExtension = Extension.extend("card.explorer.extension.customActions.CustomActionsExtension");

	CustomActionsExtension.prototype.onCardReady = function () {
		var oCard = this.getCard();

		oCard.addActionDefinition(new ActionDefinition({
			type: "Custom",
			text: "Report action text",
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
					type: "Navigation",
					text: "{i18n>bookActionText}",
					icon: "sap-icon://learning-assistant",
					parameters: {
						url: oRes.url
					}
				}));
			});
	};

	CustomActionsExtension.prototype.getData = function () {
		return Promise.resolve({
			header: {
				subHeader: "Overdue Billing"
			},
			contacts: [
				{
					"name": "Alain Chevalier",
					"photo": "./AlainChevalier.png"
				},
				{
					"name": "Donna Moore",
					"photo": "./DonnaMoore.png"
				}
			]
		});
	};

	return CustomActionsExtension;
});