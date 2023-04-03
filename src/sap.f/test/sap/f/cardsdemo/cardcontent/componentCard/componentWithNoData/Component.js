sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/IllustratedMessageType"
], function (UIComponent, IllustratedMessageType) {
	"use strict";

	var Component = UIComponent.extend("sap.f.cardsdemo.cardcontent.componentCard.componentWithNoData.Component", {
		onCardReady: function (oCard) {
			oCard.showLoadingPlaceholders();

			setTimeout(function() {
				oCard.hideLoadingPlaceholders();
				oCard.showNoData({
					type: IllustratedMessageType.NoData,
					title: "Custom title"
				});

			}, 1000);
		}
	});

	return Component;
});
