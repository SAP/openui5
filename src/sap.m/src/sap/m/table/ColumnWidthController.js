/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController",
	'sap/m/p13n/modules/xConfigAPI',
	"sap/base/util/merge"
], function (BaseController, xConfigAPI, merge) {
	"use strict";

	/**
	 * Constructor for a new <code>ColumnWidthController</code>.
	 * This controller can be registered using the <code>sap.m.p13n.Engine</code> to persist table column width changes
	 * and can be used in combination with <code>sap.m.Table</code> and <code>sap.ui.table.Table</code> controls.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @param {sap.ui.core.Control} mSettings.control The table instance that is personalized by this controller
	 *
	 * @class
	 * The <code>ColumnWidthController</code> entity serves to create table-specific column width personalization changes.
	 *
	 * @extends sap.m.p13n.SelectionController
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.m.table.ColumnWidthController
	 */
	var ColumnWidthController = BaseController.extend("sap.m.table.ColumnWidthController", {
		constructor: function(mSettings) {
			BaseController.apply(this, arguments);
			this._bExposeXConfig = mSettings.exposeXConfig;//used for mdc.Table to expose xConfig in its original format
			this._bXConfigEnabled = true;
			this._bResetEnabled = true;
			this._sTargetAggregation = "columns";
		}
	});

	/**
	 * Retruns the state key for external state representation
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @returns {string} The external state key
	 */
	ColumnWidthController.prototype.getStateKey = function() {
		return "supplementaryConfig";
	};

	/**
	 * Retruns the available change types for change creation
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @returns {object} An object of available change operations
	 */
	ColumnWidthController.prototype.getChangeOperations = function() {
		return {
			set: "setColumnWidth"
		};
	};

	/**
	 * Check the incoming state vor validity and transform it accordingly for further internal processing
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @param {object} oState The column width state
	 * @returns {object} The validated and transformed state
	 */
	ColumnWidthController.prototype.sanityCheck = function(oState) {
		var aColumnWidth = [];
		if (this._bExposeXConfig) {
			if (oState && oState.hasOwnProperty("aggregations") && oState.aggregations.hasOwnProperty("columns")) {
				Object.keys(oState.aggregations.columns).forEach(function(sItem) {
					var oColumnWidth = {
						name: sItem,
						width: oState.aggregations.columns[sItem].width
					};
					aColumnWidth.push(oColumnWidth);
				});
			}
		} else {
			Object.keys(oState).map((sKey) => {
				aColumnWidth.push({
					key: sKey, width: oState[sKey]
				});
			});
		}
		return aColumnWidth;
	};

	/**
	 * Returns the current column width state of the associated table instance
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @returns {object} The current column width state
	 */
	ColumnWidthController.prototype.getCurrentState = function() {

		if (this._bExposeXConfig) {
			return this.getAdaptationControl().getCurrentState().xConfig;
		} else {
			var oXConfig = xConfigAPI.readConfig(this.getAdaptationControl());

			var columnWidthState = {};
			Object.keys(oXConfig?.aggregations?.columns || {}).forEach((sKey) => {
				if (oXConfig.aggregations.columns[sKey]) {
					columnWidthState[sKey] = oXConfig.aggregations.columns[sKey].width;
				}
			});
			return columnWidthState;
		}

	};

	/**
	 * Transforms an array of column width changes to the state object representation
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @param {object[]} aChanges An array of column width changes
	 * @returns {object} The column width state
	 */
	ColumnWidthController.prototype.changesToState = function(aChanges) {

		var oState;
		var oControl = aChanges.length && aChanges[0].selectorElement;

		aChanges.forEach(function(oChange){
			var oChangeContent = merge({}, oChange.changeSpecificData.content);
			var oXSettings = {
				name: oChangeContent.name,
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

	/**
	 * Calculated the delta in an array of change objects for two given states
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @param {object} mDeltaInfo An object containing information about two states to compare
	 * @param {array} mDeltaInfo.existingState An array describing the control state before a adaptation
	 * @param {array} mDeltaInfo.changedState An array describing the control state after a certain adaptation
	 * @param {object} mDeltaInfo.control Control instance which is being used to generate the changes
	 * @param {object} mDeltaInfo.changeOperations Map containing the changeOperations for the given Control instance
	 * @returns {object[]} An array of column width changes
	 */
	ColumnWidthController.prototype.getDelta = function(mDeltaInfo) {
		mDeltaInfo.deltaAttribute = "width";
		mDeltaInfo.operation = "setColumnWidth";
		mDeltaInfo.changedState = mDeltaInfo.changedState instanceof Array ? mDeltaInfo.changedState : this.sanityCheck(mDeltaInfo.changedState);
		mDeltaInfo.existingState = this.sanityCheck(mDeltaInfo.existingState);
		var aChanges = this.getPropertySetterChanges(mDeltaInfo);
		return aChanges;
	};

	return ColumnWidthController;

});