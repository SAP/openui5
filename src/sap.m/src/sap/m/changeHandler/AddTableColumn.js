/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/BaseAddViaDelegate",
	"sap/base/util/ObjectPath"
], function (
	BaseAddViaDelegate,
	ObjectPath
) {
	"use strict";

	var COLUMNS_AGGREGATION_NAME = "columns";
	var CELLS_AGGREGATION_NAME = "cells";
	var ITEMS_AGGREGATION_NAME = "items";

	function getLabel(mChangeDefinition, mInnerControls, oModifier, oView, oAppComponent){
		var sEntityType = ObjectPath.get("oDataInformation.entityType", mChangeDefinition);
		if (sEntityType) {
			var mContent = mChangeDefinition.content;
			return Promise.resolve()
				.then(oModifier.createControl.bind(
					oModifier,
					'sap.m.Text',
					oAppComponent,
					oView,
					mContent.newFieldSelector.id + '--column',
					{
						text: "{/#" + sEntityType + "/" + mContent.bindingPath + "/@sap:label}"
					}
				));
		}
		return Promise.resolve(mInnerControls.label);
	}

	/**
	 * Change handler for adding a AddTableColumn to sap.m.Table
	 *
	 * @constructor
	 *
	 * @alias sap.m.changeHandler.AddTableColumn
	 *
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.51.0 This class is experimental and provides only limited functionality.
	 * Also the API might be changed in future.
	 */

	var AddTableColumn = BaseAddViaDelegate.createAddViaDelegateChangeHandler({

		aggregationName: COLUMNS_AGGREGATION_NAME,
		parentAlias: "targetTable",
		fieldSuffix: "--field",
		skipCreateLabel: function(mPropertyBag) {
			//if entity type is given we create label ourselves
			return !!ObjectPath.get("changeDefinition.oDataInformation.entityType", mPropertyBag);
		},
		skipCreateLayout: true,
		supportsDefault: true,

		/**
		 * Add a new column
		 * @param {*} mPropertyBag - Parameters
		 * @returns {Promise} Promise resolving when the column is added
		 */
		addProperty : function(mPropertyBag) {
			var mInnerControls = mPropertyBag.innerControls;
			if (mInnerControls.valueHelp) {
				//TODO clarify if value help needs to be supported and where to add them
				//for V2 addODataProperty compatibility it is not necessary to support value helps
				return Promise.reject(new Error("Adding properties with value helps is not yet supported by addTableColumn change handler"));
			}

			var oTable = mPropertyBag.control;
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;

			var oChange = mPropertyBag.change;
			var oRevertData = oChange.getRevertData();
			var mChangeDefinition = oChange.getDefinition();
			var mContent = mChangeDefinition.content;
			var iIndex = mContent.newFieldIndex;
			var mFieldSelector = mContent.newFieldSelector;

			return Promise.resolve()
				.then(oModifier.getBindingTemplate.bind(oModifier,oTable, ITEMS_AGGREGATION_NAME, oView))
				.then(function (oTemplate) {
					if (oTemplate) {
						var oSmartField = mInnerControls.control;

						return Promise.resolve()
							.then(oModifier.insertAggregation.bind(oModifier, oTemplate, CELLS_AGGREGATION_NAME, oSmartField, iIndex, oView))
							.then(oModifier.updateAggregation.bind(oModifier, oTable, ITEMS_AGGREGATION_NAME)) //only needed in JS case
							.then(function() {
								// getSelector() helps to decide whether idIsLocal is true/false
								oRevertData.newCellSelector = oModifier.getSelector(oSmartField, oAppComponent);
								oChange.setRevertData(oRevertData);
							});
					}
					return undefined;
				})
				.then(oModifier.createControl.bind(oModifier, 'sap.m.Column', oAppComponent, oView, mFieldSelector))
				.then(function(oCreatedControl) {
					return getLabel(mChangeDefinition, mInnerControls, oModifier, oView, oAppComponent)
						.then(function(oLabel) {
							return Promise.resolve()
								.then(oModifier.insertAggregation.bind(oModifier, oCreatedControl, 'header', oLabel, 0, oView))
								.then(oModifier.insertAggregation.bind(oModifier, oTable, COLUMNS_AGGREGATION_NAME, oCreatedControl, iIndex, oView));
						});
				});
		},

		/**
		 * Revert the controls for the cell that are added in addition to the new column
		 * @param {*} mPropertyBag - Parameters
		 * @returns {Promise} Promise resolving when the controls are reverted
		 */
		revertAdditionalControls : function(mPropertyBag) {
			var oTable = mPropertyBag.control;
			var oChange = mPropertyBag.change;
			var oChangeRevertData = oChange.getRevertData();

			var oModifier = mPropertyBag.modifier;
			var oAppComponent = mPropertyBag.appComponent;

			var oTemplate, oNewCell;

			// Column Content
			return Promise.resolve()
				.then(oModifier.getBindingTemplate.bind(oModifier, oTable, ITEMS_AGGREGATION_NAME))
				.then(function(oRetrievedTemplate){
					oTemplate = oRetrievedTemplate;
					if (oTemplate) {
						return Promise.resolve()
							.then(oModifier.bySelector.bind(oModifier, oChangeRevertData.newCellSelector, oAppComponent))
							.then(function(oCreatedCell) {
								oNewCell = oCreatedCell;
								return oModifier.removeAggregation(oTemplate, CELLS_AGGREGATION_NAME, oNewCell);
							})
							.then(function() {
								return oModifier.destroy(oNewCell);
							})
							.then(oModifier.updateAggregation.bind(oModifier, oTable, ITEMS_AGGREGATION_NAME));
					}
					return undefined;
				});
		}

	});

	return AddTableColumn;
},
/* bExport= */true);
