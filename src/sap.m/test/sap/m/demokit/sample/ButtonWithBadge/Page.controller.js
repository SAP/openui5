sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/mvc/Controller'
],
function(JSONModel, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ButtonWithBadge.Page", {

		onInit: function () {
			// create model with settings
			this.oModel = new JSONModel();
			this.oModel.setData({
				badgeMin:			"1",
				badgeMax:			"9999",
				badgeCurrent:		1,
				buttonText: 		"Button with Badge",
				buttonIcon: 		"sap-icon://cart",
				buttonType: 		"Default",
				buttonWithIcon:		true,
				buttonWithText:		true
			});
			this.getView().setModel(this.oModel);

			// create internal vars with instances of controls
			this.oLabel = this.byId("ButtonLabel");
			this.oButton = this.byId("BadgedButton");
			this.oMin = this.byId("MinInput");
			this.oMax = this.byId("MaxInput");
			this.oCurrent = this.byId("CurrentValue");
			this.oLabelCheckBox = this.byId("LabelCheckBox");

			// initialize Badge
			this.currentChangeHandler();
		},

		// current value or min/max values change handler
		currentChangeHandler: function() {
			var iCurrent = this.oCurrent.getValue(),
				oButtonBadgeCustomData = this.oButton.getBadgeCustomData(),
				sValue = iCurrent.toString();

			if (!oButtonBadgeCustomData) {
				return;
			}

			oButtonBadgeCustomData.setValue(sValue);
		},

		minChangeHandler: function() {
			this.oButton.setBadgeMinValue(this.oModel.getProperty("/badgeMin"));
		},

		maxChangeHandler: function() {
			this.oButton.setBadgeMaxValue(this.oModel.getProperty("/badgeMax"));
		}

	});

	return PageController;

});
