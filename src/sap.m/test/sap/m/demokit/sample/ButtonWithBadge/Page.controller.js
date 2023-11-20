sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/mvc/Controller'
],
function(JSONModel, Controller) {
	"use strict";

	// constraints for the minimum and maximum Badge value
	var BADGE_MIN_VALUE = 1,
		BADGE_MAX_VALUE = 9999;

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
			this.iMinValue = parseInt(this.oMin.getValue());
			this.iMaxValue = parseInt(this.oMax.getValue());

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
			var iMin = parseInt(this.oModel.getProperty("/badgeMin"));
			if (iMin >= BADGE_MIN_VALUE && iMin <= this.iMaxValue) {
				this.oButton.setBadgeMinValue(iMin);
				this.iMinValue = iMin;
			} else {
				this.oMin.setValue(this.iMinValue);
			}
		},

		maxChangeHandler: function() {
			var iMax = parseInt(this.oModel.getProperty("/badgeMax"));
			this.oButton.setBadgeMaxValue(iMax);
			if (iMax <= BADGE_MAX_VALUE && iMax >= this.iMinValue) {
				this.oButton.setBadgeMaxValue(iMax);
				this.iMaxValue = iMax;
			} else {
				this.oMax.setValue(this.iMaxValue);
			}
		}

	});

	return PageController;

});
