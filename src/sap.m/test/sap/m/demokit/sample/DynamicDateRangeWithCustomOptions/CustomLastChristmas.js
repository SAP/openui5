sap.ui.define([
	"sap/m/DynamicDateOption",
	"sap/ui/core/date/UI5Date"
],
	function (DynamicDateOption, UI5Date) {
		"use strict";

		return DynamicDateOption.extend("sap.m.sample.DynamicDateRangeWithCustomOptions.CustomLastChristmas", {

			metadata: {
				properties: {
					text: { defaultValue: "Last Christmas", type: "string" }
				}
			},

			getValueHelpUITypes: function () {
				return [];
			},

			_getLastChristmasDates: function () {
				const oCurrentDate = UI5Date.getInstance();
				const oChristmasStart = UI5Date.getInstance(oCurrentDate.getFullYear() - 1, 11, 25, 0, 0, 0);
				const oChristmasEnd = UI5Date.getInstance(oCurrentDate.getFullYear() - 1, 11, 26, 0, 0, 0);

				return { oChristmasStart, oChristmasEnd };
			},

			format: function () {
				const { oChristmasStart, oChristmasEnd } = this._getLastChristmasDates();
				const oFormatOptions = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

				return oChristmasStart.toLocaleString('en-US', oFormatOptions) + " - " + oChristmasEnd.toLocaleString('en-US', oFormatOptions);
			},

			toDates: function () {
				const { oChristmasStart, oChristmasEnd } = this._getLastChristmasDates();

				return [oChristmasStart, oChristmasEnd];
			},

			getGroup: function() {
				return "Custom";
			}
		});
	});
