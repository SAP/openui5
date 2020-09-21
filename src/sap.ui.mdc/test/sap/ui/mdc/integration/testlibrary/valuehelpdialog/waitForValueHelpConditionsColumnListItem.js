/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForValueHelpConditionsTable",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual"
], function(
	Opa5,
	waitForValueHelpConditionsTable,
	Ancestor,
	AggregationContainsPropertyEqual
) {
	"use strict";

	return function waitForValueHelpConditionsColumnListItem(oSettings) {
		var aMatchers = [];
		if (oSettings.values) {
			aMatchers = oSettings.values.map(function(oValue) {
				return new AggregationContainsPropertyEqual({
					aggregationName: "cells",
					propertyName: "text",
					propertyValue: oValue
				});
			});
		}

		return waitForValueHelpConditionsTable.call(this, {
			success: onValueHelpDialogConditionsTableFound
		});

		function onValueHelpDialogConditionsTableFound(oValueHelpDialogConditionsTable) {
			aMatchers.push(new Ancestor(oValueHelpDialogConditionsTable, false));
			this.waitFor({
				controlType: "sap.m.ColumnListItem",
				searchOpenDialogs: true,
				matchers: aMatchers,
				actions: oSettings.actions,
				success: function(aColumnListItems) {
					Opa5.assert.ok(true, "The column list item condition inside the value help dialog was found");

					if (typeof oSettings.success === "function") {
						var oColumnListItem = aColumnListItems[0];
						oSettings.success.call(this, oColumnListItem);
					}
				},
				errorMessage: "The column list item condition inside the value help dialog could not be found"
			});
		}
	};
});
