/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/FilterBarDelegate", "sap/ui/v4demo/controls/CustomRangeSlider", "sap/ui/core/Core"
], function (FilterBarDelegate, CustomRangeSlider, Core) {
	"use strict";

	var FilterBarBooksSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarBooksSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {

		var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);

		oFilterFieldPromise.then(function (oFilterField) {

			var oFieldHelp;

			if (sName === "stock") {
				var oCustomRangeSlider = new CustomRangeSlider({ max: 99999, width: "100%" });
				oCustomRangeSlider.addStyleClass("sapUiMediumMarginBottom");
				oCustomRangeSlider.bindProperty("value", "$field>/conditions/stock");
				oFilterField.setContentEdit(oCustomRangeSlider);
				return oFilterField;
			}

			if (sName === "createdAt") {
				oFilterField.setOperators(["EQ", "GT", "LT", "BT"]);
				oFieldHelp = Core.byId("container-v4demo---books--FH3");
				if (oFieldHelp) {
					oFilterField.setFieldHelp(oFieldHelp);
				}
				return oFilterField;
			}

			if (sName === "author_ID") {
				oFilterField.setDisplay("Description");
				oFieldHelp = Core.byId("container-v4demo---books--FH1");
				if (oFieldHelp) {
					oFilterField.setFieldHelp(oFieldHelp);
				}
				return oFilterField;
			}

			if (sName === "title") {
				oFieldHelp = Core.byId("container-v4demo---books--FH4");
				if (oFieldHelp) {
					oFilterField.setFieldHelp(oFieldHelp);
				}
				return oFilterField;
			}
		});

		return oFilterFieldPromise;

	};


	return FilterBarBooksSampleDelegate;
});
