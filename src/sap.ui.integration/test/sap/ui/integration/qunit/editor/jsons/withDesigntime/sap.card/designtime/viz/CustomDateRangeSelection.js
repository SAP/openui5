sap.ui.define([
	"sap/ui/integration/editor/fields/viz/VizBase",
	"sap/m/DateRangeSelection",
	"sap/base/util/merge"
], function (
	VizBase, DateRangeSelection, merge
) {
	"use strict";

	var CustomDateRangeSelection = VizBase.extend("sap.ui.integration.editor.test.customfield.viz.CustomDateRangeSelection", {
		metadata: {
			library: "sap.ui.integration.editor.test.customfield",
			properties: {
				displayFormat: {
					type: "string",
					defaultValue: ""
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	// create this._oControl and set up it
	CustomDateRangeSelection.prototype.onInit = function () {
		this._oControl = new DateRangeSelection();
	};

	CustomDateRangeSelection.prototype.setDisplayFormat = function (sValue) {
		this.setProperty("displayFormat", sValue, true);
		sValue = this.getDisplayFormat();
		this._oControl.setProperty("displayFormat", sValue);
		return this;
	};

	// bind properties to this._oControl
	CustomDateRangeSelection.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
		VizBase.prototype.bindPropertyToControl.apply(this, arguments);
		if (sProperty === "displayFormat") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("displayFormat", oControlBindingInfo);
		}
	};

	return CustomDateRangeSelection;
});