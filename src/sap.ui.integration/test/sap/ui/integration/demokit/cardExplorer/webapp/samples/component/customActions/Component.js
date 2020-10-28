sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/integration/ActionDefinition"
], function (UIComponent, ActionDefinition) {
	"use strict";

	var Component = UIComponent.extend("my.component.sample.cardContent.Component", {
		onCardReady: function (oCard) {
			oCard.addActionDefinition(new ActionDefinition({
				type: "Custom",
				text: "{i18n>reportActionText}",
				enabled: true,
				press: function (oEvent) {
					var oReportAction = oEvent.getSource();
					oReportAction.setEnabled(false);
				}
			}));

			// Actions can be added at any time, for example after response from a backend
			oCard.request({
					url: sap.ui.require.toUrl("my/component/sample/customActions/urlInfo.json")
				}).then(function (oRes) {
					oCard.addActionDefinition(new ActionDefinition({
						type: "Navigation",
						text: "{i18n>visitActionText}",
						parameters: {
							url: oRes.url
						}
					}));
				});
		}
	});

	return Component;
});
