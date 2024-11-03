sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/ActionDefinition"
], function (UIComponent, IllustratedMessageType, ActionDefinition) {
	"use strict";

	var Component = UIComponent.extend("sap.f.cardsdemo.cardcontent.componentCard.componentWithNoData.Component", {
		metadata: {
			manifest: "json"
		},
		onCardReady: function (oCard) {
			oCard.showLoadingPlaceholders();

			oCard.addActionDefinition(new ActionDefinition({
				type: "Custom",
				text: "showBlockingMessage",
				press: function () {
					oCard.showBlockingMessage({
						type: "NoData",
						illustrationType: IllustratedMessageType.NoSearchResults,
						title: "Custom No Data Message"
					});
				}
			}));

			oCard.addActionDefinition(new ActionDefinition({
				type: "Custom",
				text: "hideBlockingMessage",
				press: function () {
					oCard.hideBlockingMessage();
				}
			}));

			setTimeout(function() {
				oCard.hideLoadingPlaceholders();
				oCard.showBlockingMessage({
					type: "NoData",
					illustrationType: IllustratedMessageType.NoSearchResults,
					title: "Custom No Data Message"
				});

			}, 1000);
		}
	});

	return Component;
});
