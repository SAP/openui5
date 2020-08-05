/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForValueHelpConditionsTable(oSettings) {

		return this.waitFor({
			controlType: "sap.m.Table",
			searchOpenDialogs: true, // search only visible controls inside the static area

			// note: the matches API does not work correctly for UI5 elements that do not have a
			// DOM representation
			check: function(aTables) {

				return aTables.some(function(oControl) {
					var oParent = oControl.getParent();

					if (!oParent) {
						return false;
					}

					if (oParent.isA("sap.ui.mdc.field.FieldValueHelpMTableWrapper")) {
						oParent = oParent.getParent();
						return oParent.isA("sap.ui.mdc.field.FieldValueHelp");
					}

					return false;
				});
			},
			success: onValueHelpConditionsTableFound,
			errorMessage: "The conditions table inside the value help dialog could not be found"
		});

		function onValueHelpConditionsTableFound(aValueHelpDialogConditionsTables) {
			Opa5.assert.ok(true, "The conditions table inside the value help dialog was found");

			if (typeof oSettings.success === "function") {
				var oValueHelpDialogConditionsTable = aValueHelpDialogConditionsTables[0];
				oSettings.success.call(this, oValueHelpDialogConditionsTable);
			}
		}
	};
});
