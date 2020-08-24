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
				badgeMin:			"",
				badgeMax:			"",
				badgeCurrent:		1,
				buttonText: 		"Button with Badge",
				buttonTooltip: 		"Badged Button",
				buttonIcon: 		"sap-icon://cart",
				buttonType: 		"Default",
				buttonWithIcon:		true,
				buttonWithText:		true,
				buttonWithTooltip:	false
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
				sValue = iCurrent.toString(),
				bVisible = true,
				iMin,
				iMax;

			if (!oButtonBadgeCustomData) {
				return;
			}

			// sanitize min and max values
			this._sanitizeMinMax();
			iMin = parseInt(this.oMin.getValue());
			iMax = parseInt(this.oMax.getValue());

			// update badge value and visibility
			// if there are min or max values entered
			if (!isNaN(iMin) && iCurrent < iMin) {
				bVisible = false;
			} else if (!isNaN(iMax) && iCurrent > iMax) {
				sValue = iMax.toString() + "+";
			}
			oButtonBadgeCustomData.setValue(sValue);
			oButtonBadgeCustomData.setVisible(bVisible);
		},

		// sanitize min and max values if necessary
		_sanitizeMinMax: function() {
			var iMin = parseInt(this.oMin.getValue()),
				iMax = parseInt(this.oMax.getValue()),
				bSetValuesAgain = false;

			// limit min value to fit inside a spec (1-9999)
			if (!isNaN(iMin)) {
				if (iMin > 9999) {
					iMin = 9999;
					bSetValuesAgain = true;
				} else if (iMin < 1) {
					iMin = 1;
					bSetValuesAgain = true;
				}
			}

			// limit max value to fit inside a spec (1-9999)
			if (!isNaN(iMax)) {
				if (iMax > 9999) {
					iMax = 9999;
					bSetValuesAgain = true;
				} else if (iMax < 1) {
					iMax = 1;
					bSetValuesAgain = true;
				}
			}

			// check if min > max and swap them if necessary
			if (!isNaN(iMin) && !isNaN(iMax) && iMin > iMax) {
				// swap min and max
				iMax = [iMin, iMin = iMax][0];
				bSetValuesAgain = true;
			}

			// update new values if necessary
			if (bSetValuesAgain) {
				this.oMin.setValue(iMin);
				this.oMax.setValue(iMax);
			}
		}

	});

	return PageController;

});
