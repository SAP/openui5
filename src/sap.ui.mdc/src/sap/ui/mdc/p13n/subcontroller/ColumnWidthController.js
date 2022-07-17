/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/mdc/p13n/FlexUtil",
    'sap/ui/mdc/p13n/modules/xConfigAPI',
	"sap/base/util/merge"
], function (BaseController, FlexUtil, xConfigAPI, merge) {
	"use strict";

	var ColumnWidthController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnWidthController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bXConfigEnabled = true;
			this._bResetEnabled = true;
		}
	});

	ColumnWidthController.prototype.sanityCheck = function(oState) {
        var aColumnWidth = [];
		if (oState && oState.hasOwnProperty("aggregations") && oState.aggregations.hasOwnProperty("columns")) {
			Object.keys(oState.aggregations.columns).forEach(function(sItem) {
				var oColumnWidth = {
					name: sItem,
					width: oState.aggregations.columns[sItem].width
				};
				aColumnWidth.push(oColumnWidth);
			});
		}
        return aColumnWidth;
    };

	ColumnWidthController.prototype.getCurrentState = function() {
		return this.getAdaptationControl().getCurrentState().xConfig;
	};

	ColumnWidthController.prototype.getStateKey = function() {
		return "supplementaryConfig";
	};

	ColumnWidthController.prototype.changesToState = function(aChanges) {

        var oState;
		var oControl = aChanges.length && aChanges[0].selectorElement;

        aChanges.forEach(function(oChange){
			var oChangeContent = merge({}, oChange.changeSpecificData.content);
			var oXSettings = {
				name: oChangeContent.name,
				controlMeta: {
					aggregation: "columns",
					property: "width"
				},
				value: oChangeContent.value
			};

			oState = xConfigAPI.createConfigObject(oControl, oXSettings, oState);

        });

        return oState || {};
    };

	ColumnWidthController.prototype.getDelta = function(mPropertyBag) {
		mPropertyBag.deltaAttribute = "width";
		mPropertyBag.operation = "setColumnWidth";
		mPropertyBag.changedState = mPropertyBag.changedState instanceof Array ? mPropertyBag.changedState : this.sanityCheck(mPropertyBag.changedState);
		mPropertyBag.existingState = this.sanityCheck(mPropertyBag.existingState);
		return FlexUtil.getPropertySetterChanges(mPropertyBag);
	};

	return ColumnWidthController;

});