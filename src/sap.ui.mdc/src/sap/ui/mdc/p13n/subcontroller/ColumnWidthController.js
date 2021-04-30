/*
 * ! ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/mdc/p13n/FlexUtil"
], function (BaseController, FlexUtil) {
	"use strict";

	var ColumnWidthController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnWidthController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
	});

	ColumnWidthController.prototype.sanityCheck = function(oChange) {
        var aColumnWidth = [];
		if (oChange.hasOwnProperty("aggregations") && oChange.aggregations.hasOwnProperty("columns")) {
			Object.keys(oChange.aggregations.columns).forEach(function(sItem) {
				var oColumnWidth = {
					name: sItem,
					width: oChange.aggregations.columns[sItem].width
				};
				aColumnWidth.push(oColumnWidth);
			});
		}
        return aColumnWidth;
    };

	ColumnWidthController.prototype.getCurrentState = function() {
		return this.getAdaptationControl().getCurrentState().xConfig;
	};

	ColumnWidthController.prototype.getDelta = function(mPropertyBag) {
		mPropertyBag.deltaAttribute = "width";
		mPropertyBag.operation = "setColumnWidth";
		mPropertyBag.existingState = this.sanityCheck(mPropertyBag.existingState);
		return FlexUtil.getPropertySetterChanges(mPropertyBag);
	};

	return ColumnWidthController;

});