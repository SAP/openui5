/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController",
	"sap/ui/mdc/enums/TableType",
	'sap/m/p13n/modules/xConfigAPI',
	"sap/base/util/merge"
], (BaseController, TableType, xConfigAPI, merge) => {
	"use strict";

	/**
	 * Constructor for a new <code>ShowDetailsController</code>.
	 * This controller can be register using the <code>sap.m.p13n.Engine</code> to persist show/hide details changes.
	 *
	 * @class
	 * The <code>ShowDetailsController</code> entity serves to create table-specific show/hide details personalization changes.
	 *
	 * @extends sap.ui.mdc.p13n.subcontroller.SelectionController
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.mdc.p13n.subcontroller.ShowDetailsController
	 */
	const ShowDetailsController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ShowDetailsController", {
		constructor: function(mSettings) {
			BaseController.apply(this, arguments);
			if (!mSettings.control._isOfType(TableType.ResponsiveTable)) {
				throw new Error("ShowDetailsController is only applicable to ResponsiveTable");
			}
		}
	});

	/**
	 * Returns the state key for external state representation.
	 * @returns {string} The external state key
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n, sap.ui.mdc
	 */
	ShowDetailsController.prototype.getStateKey = function() {
		return "supplementaryConfig";
	};

	/**
	 * Returns the available change types for change creation.
	 * @returns {object} An object of available change operations
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n, sap.ui.mdc
	 */
	ShowDetailsController.prototype.getChangeOperations = function() {
		return {
			set: "setShowDetails"
		};
	};

	/**
	 * Returns the current state of the controller.
	 * @returns {object} The current state
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n, sap.ui.mdc
	 */
	ShowDetailsController.prototype.getCurrentState = function() {
		const vState = this.getAdaptationControl().getCurrentState().xConfig;
		if (vState.aggregations?.type?.ResponsiveTable) {
			return {
				aggregations: {
					type: {
						ResponsiveTable: {
							showDetails: vState.aggregations.type.ResponsiveTable.showDetails
						}
					}
				}
			};
		}
		return {};
	};

	ShowDetailsController.prototype.formatToInternalState = function(oExternalState) {
		if (oExternalState?.aggregations?.type?.ResponsiveTable) {
			return {
				aggregations: {
					type: oExternalState.aggregations.type
				}
			};
		}
		return {};
	};

	/**
	 * Transforms an array of show details changes to the state object representation
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n
	 * @param {object[]} aChanges An array of show details changes
	 * @returns {object} The show details state
	 */
	ShowDetailsController.prototype.changesToState = function(aChanges) {
		let oState = {};
		const oControl = aChanges.length && aChanges[0].selectorElement;

		aChanges.forEach((oChange) => {
			const oChangeContent = merge({}, oChange.changeSpecificData.content);
			const oXSettings = {
				name: oChangeContent.name,
				controlMeta: {
					aggregation: "type"
				},
				property: "showDetails",
				value: oChangeContent.value
			};

			oState = xConfigAPI.createAggregationConfig(oControl, oXSettings, oState);
		});

		return oState;
	};

	ShowDetailsController.prototype.sanityCheck = function(oState) {
		const aState = [];
		if (oState?.aggregations?.type?.ResponsiveTable) {
			aState.push({
				name: "ResponsiveTable",
				showDetails: oState.aggregations.type.ResponsiveTable.showDetails
			});
		}
		return aState;
	};

	/**
	 * Calculates the delta between the current state and the changed state.
	 *
	 * @param {object} mDeltaInfo An object containing information about two states to compare
	 * @param {array} mDeltaInfo.existingState An array describing the control state before a adaptation
	 * @param {array} mDeltaInfo.changedState An array describing the control state after a certain adaptation
	 * @param {object} mDeltaInfo.control Control instance which is being used to generate the changes
	 * @param {object} mDeltaInfo.changeOperations Map containing the changeOperations for the given Control instance
	 * @returns {object[]} An array of column width changes
	 *
	 * @private
	 * @ui5-restricted sap.m.p13n, sap.ui.mdc
	 */
	ShowDetailsController.prototype.getDelta = function(mDeltaInfo) {
		mDeltaInfo.changedState = mDeltaInfo.changedState instanceof Array ? mDeltaInfo.changedState : this.sanityCheck(mDeltaInfo.changedState);
		mDeltaInfo.deltaAttribute = "showDetails";
		mDeltaInfo.operation = "setShowDetails";
		mDeltaInfo.existingState = this.sanityCheck(mDeltaInfo.existingState);

		return this.getPropertySetterChanges(mDeltaInfo);
	};

	return ShowDetailsController;

});