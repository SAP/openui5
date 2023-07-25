sap.ui.define([
	"sap/m/DynamicDateOption",
	'sap/m/DynamicDateValueHelpUIType',
	'sap/m/StepInput',
	'sap/m/Label',
	'sap/ui/core/LocaleData',
	"sap/ui/core/Core",
	"sap/ui/core/date/UI5Date"
], function(
	DynamicDateOption,
	DynamicDateValueHelpUIType,
	StepInput,
	Label,
	LocaleData,
	oCore,
	UI5Date
) {
	"use strict";

	return DynamicDateOption.extend("sap.m.sample.DynamicDateRangeWithCustomOptions.CustomPreviousXWeekend", {
		getValueHelpUITypes: function() {
			return [new DynamicDateValueHelpUIType({ type: "int" })];
		},
		createValueHelpUI: function (oControl, fnControlsUpdated) {
			var oLabel = new Label({
				text: this.getKey(),
				width: "100%"
			});
			var oStepInput = new StepInput({ min: 1
			}).addStyleClass("sapUiSmallMarginTop");

			oControl.aControlsByParameters = {};
			oControl.aControlsByParameters[this.getKey()] = [];

			if (fnControlsUpdated instanceof Function) {
				oStepInput.attachChange(function() {
					fnControlsUpdated(this);
				}, this);
			}

			oControl.aControlsByParameters[this.getKey()].push(oStepInput);

			return [oLabel, oStepInput];
		},
		format: function(oValue) {
			return oValue.values[0] + " To Last Weekend";
		},
		parse: function(sValue) {
			var oResult,
				sVal = sValue,
				iNumberEnd = sVal.indexOf(" ");
			if (iNumberEnd > -1) {
				oResult = {};
				oResult.operator = "XtoLastWeekend";
				oResult.values = [parseInt(sVal.slice(0, iNumberEnd))];
			}

			return oResult;
		},
		validateValueHelpUI: function (oControl) {
			var oStepInput = oControl.aInputControls[1];

			return oStepInput.getValue() > 0;
		},
		toDates: function(oValue) {
			var oLocale = oCore.getConfiguration().getLocale();
			var oLocaleData = new LocaleData(oLocale);
			var iValue = oValue.values[0];
			var oSaturdayDate = UI5Date.getInstance();
			var oSundayDate = UI5Date.getInstance();
			var iDaysInWeek = 7;

			// Move to the exact week
			oSaturdayDate.setUTCDate(oSaturdayDate.getUTCDate() - iDaysInWeek * iValue);
			oSundayDate.setUTCDate(oSundayDate.getUTCDate() - iDaysInWeek * iValue);

			//Pick the week days
			oSaturdayDate.setUTCDate(oSaturdayDate.getUTCDate() + (oLocaleData.getWeekendStart() - oSaturdayDate.getUTCDay()));
			oSundayDate.setUTCDate(oSundayDate.getUTCDate() + (oLocaleData.getWeekendStart() + 1 - oSundayDate.getUTCDay()));

			return [oSaturdayDate, oSundayDate];
		},
		getGroup() {
			return "Custom";
		}
	});

});
