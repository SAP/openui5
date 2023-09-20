/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController",
	"sap/m/p13n/FlexUtil",
    'sap/m/p13n/modules/xConfigAPI',
	"sap/base/util/merge"
], function (BaseController, FlexUtil, xConfigAPI, merge) {
	"use strict";

	const ColumnWidthController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnWidthController", {
		constructor: function() {
			BaseController.apply(this, arguments);
			this._bXConfigEnabled = true;
			this._bResetEnabled = true;
		}
	});

	ColumnWidthController.prototype.sanityCheck = function(oState) {
        const aColumnWidth = [];
		if (oState && oState.hasOwnProperty("aggregations") && oState.aggregations.hasOwnProperty("columns")) {
			Object.keys(oState.aggregations.columns).forEach(function(sItem) {
				const oColumnWidth = {
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

        let oState;
		const oControl = aChanges.length && aChanges[0].selectorElement;

        aChanges.forEach(function(oChange){
			const oChangeContent = merge({}, oChange.changeSpecificData.content);
			const oXSettings = {
				key: oChangeContent.name,
				controlMeta: {
					aggregation: "columns"
				},
				property: "width",
				value: oChangeContent.value
			};

			oState = xConfigAPI.createAggregationConfig(oControl, oXSettings, oState);

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