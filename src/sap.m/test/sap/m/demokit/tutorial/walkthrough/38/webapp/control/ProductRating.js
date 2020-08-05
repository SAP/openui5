sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/RatingIndicator",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/core/InvisibleText"
], function (Control, RatingIndicator, Label, Button, InvisibleText) {
	"use strict";

	return Control.extend("sap.ui.demo.walkthrough.control.ProductRating", {

		metadata: {
			properties: {
				value: {type: "float", defaultValue: 0}
			},
			aggregations: {
				_rating: {type: "sap.m.RatingIndicator", multiple: false, visibility: "hidden"},
				_label: {type: "sap.m.Label", multiple: false, visibility: "hidden"},
				_button: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_invText1: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"},
				_invText2: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"},
				_invText3: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"},
				_invText4: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"}
			},
			events: {
				change: {
					parameters: {
						value: {type: "int"}
					}
				}
			}
		},

		init: function () {
			var invText1 = new InvisibleText({text:"{i18n>ratingIndicatorLabel}"});
			var invText2 = new InvisibleText({text:"{i18n>ratingIndicatorDescription}"});
			var invText3 = new InvisibleText({text:"{i18n>rateButtonLabel}"});
			var invText4 = new InvisibleText({text:"{i18n>rateButtonDescription}"});
			this.setAggregation("_invText1", invText1);
			this.setAggregation("_invText2", invText2);
			this.setAggregation("_invText3", invText3);
			this.setAggregation("_invText4", invText4);

			this.setAggregation("_rating", new RatingIndicator({
				value: this.getValue(),
				iconSize: "2rem",
				visualMode: "Half",
				liveChange: this._onRate.bind(this),
				ariaLabelledBy: invText1,
				ariaDescribedBy: invText2
			}));
			this.setAggregation("_label", new Label({
				text: "{i18n>productRatingLabelInitial}"
			}).addStyleClass("sapUiSmallMargin"));
			this.setAggregation("_button", new Button({
				text: "{i18n>productRatingButton}",
				press: this._onSubmit.bind(this),
				ariaLabelledBy: invText3,
				ariaDescribedBy: invText4
			}).addStyleClass("sapUiTinyMarginTopBottom"));
		},

		setValue: function (fValue) {
			this.setProperty("value", fValue, true);
			this.getAggregation("_rating").setValue(fValue);
		},

		reset: function () {
			var oResourceBundle = this.getModel("i18n").getResourceBundle();

			this.setValue(0);
			this.getAggregation("_label").setDesign("Standard");
			this.getAggregation("_rating").setEnabled(true);
			this.getAggregation("_label").setText(oResourceBundle.getText("productRatingLabelInitial"));
			this.getAggregation("_button").setEnabled(true);
		},

		_onRate: function (oEvent) {
			var oRessourceBundle = this.getModel("i18n").getResourceBundle();
			var fValue = oEvent.getParameter("value");

			this.setProperty("value", fValue, true);

			this.getAggregation("_label").setText(oRessourceBundle.getText("productRatingLabelIndicator", [fValue, oEvent.getSource().getMaxValue()]));
			this.getAggregation("_label").setDesign("Bold");
		},

		_onSubmit: function (oEvent) {
			var oResourceBundle = this.getModel("i18n").getResourceBundle();

			this.getAggregation("_rating").setEnabled(false);
			this.getAggregation("_label").setText(oResourceBundle.getText("productRatingLabelFinal"));
			this.getAggregation("_button").setEnabled(false);
			this.fireEvent("change", {
				value: this.getValue()
			});
		},

		renderer: function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("myAppDemoWTProductRating");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_rating"));
			oRM.renderControl(oControl.getAggregation("_label"));
			oRM.renderControl(oControl.getAggregation("_button"));
			oRM.renderControl(oControl.getAggregation("_invText1"));
			oRM.renderControl(oControl.getAggregation("_invText2"));
			oRM.renderControl(oControl.getAggregation("_invText3"));
			oRM.renderControl(oControl.getAggregation("_invText4"));
			oRM.write("</div>");
		}
	});

});