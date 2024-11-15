sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition",
	"sap/m/library",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/ui/integration/util/BindingHelper"
], function (Controller, ActionDefinition, mLibrary, fHeader, fNumericHeader, fNumericSideIndicator, BindingHelper) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ClonedHeader", {
		onInit: function () {
			const oCard5 = this.getView().byId("card5"),
				oCard6 = this.getView().byId("kpicard6");

			oCard5.attachManifestReady(function () {
				oCard5.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});
			oCard6.attachManifestReady(function () {
				oCard6.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			const fHeaders = this.getView().byId("fHeaderContainer"),
				ValueColor = mLibrary.ValueColor,
				fNumericHeaders = this.getView().byId("fNumericHeaderContainer");

			const ofHeader = new fHeader('fHeader', {
				title: "Order for Toms Spezialitäten",
				subtitle: "ID 10249",
				iconSrc: "sap-icon://sap-ui5"
			});

			const ofNumericHeader = new fNumericHeader('fNumericHeader', {
				title: "Project Cloud Transformation",
				details: "Q1, 2018",
				subtitle: "Revenue",
				unitOfMeasurement: "EUR",
				scale: "K",
				trend: "Down",
				state: ValueColor.Error,
				number: "65.34",
				sideIndicators: [
					new fNumericSideIndicator({
						title: "Target",
						number: "100K"
					}),
					new fNumericSideIndicator({
						title: "Deviation",
						number: "34.7",
						unit: "%"
					})
				]
			});

			fHeaders.addItem(ofHeader);
			fNumericHeaders.addItem(ofNumericHeader);

			const aCards = this.getView().findAggregatedObjects(true, function (oControl) {
				return oControl.isA("sap.ui.integration.widgets.Card");
			});

			aCards.forEach((oCard) => {
				oCard.attachManifestApplied(function () {
					if (!oCard._headerCloned) {
						const oHeader = oCard.getCardHeader();

						const oClonedHeader = oHeader.clone('standalone');
						BindingHelper.propagateModels(oHeader, oClonedHeader);
						oClonedHeader.addStyleClass("sapUiSmallMargin").addStyleClass("clonedHeaderItem");

						const oParentContainer = oCard.getParent();
						if (oParentContainer) {
							oParentContainer.addItem(oClonedHeader);
						}

						oCard._headerCloned = true;
					}
				});
			});

		}
	});
});
