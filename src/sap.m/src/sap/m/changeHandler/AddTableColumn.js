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
			return oModifier.createControl(
				'sap.m.Text',
				oAppComponent,
				oView,
				mContent.newFieldSelector.id + '--column',
				{
					text: "{/#" + sEntityType + "/" + mContent.bindingPath + "/@sap:label}"
				}
			);
		}
		return mInnerControls.label;
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

		/**
		 * Add a new column
		 * @param {*} mPropertyBag - Parameters
		 */
		addProperty : function(mPropertyBag) {
			var mInnerControls = mPropertyBag.innerControls;
			if (mInnerControls.valueHelp) {
				//TODO clarify if value help needs to be supported and where to add them
				//for V2 addODataProperty compatibility it is not necessary to support value helps
				throw Error("Adding properties with value helps is not yet supported by addTableColumn change handler");
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

			var oTemplate = oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME, oView);
			if (oTemplate) {
				var oSmartField = mInnerControls.control;

				oModifier.insertAggregation(oTemplate, CELLS_AGGREGATION_NAME, oSmartField, iIndex, oView);
				oModifier.updateAggregation(oTable, ITEMS_AGGREGATION_NAME);//only needed in JS case
				oRevertData.newCellSelector = {
					id: mFieldSelector.id + '--field',
					idIsLocal: true
				};
			}

			var oControl = oModifier.createControl('sap.m.Column', oAppComponent, oView, mFieldSelector);
			var oLabel = getLabel(mChangeDefinition, mInnerControls, oModifier, oView, oAppComponent);
			oModifier.insertAggregation(oControl, 'header', oLabel, 0, oView);
			oModifier.insertAggregation(oTable, COLUMNS_AGGREGATION_NAME, oControl, iIndex, oView);
		},
		/**
		 * Revert the controls for the cell that are added in addition to the new column
		 * @param {*} mPropertyBag - Parameters
		 */
		revertAdditionalControls : function(mPropertyBag) {
			var oTable = mPropertyBag.control;
			var oChange = mPropertyBag.change;

			var oModifier = mPropertyBag.modifier;
			var oAppComponent = mPropertyBag.appComponent;

			// Column Content
			var oTemplate = oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME);
			if (oTemplate) {
				var oNewCell = oModifier.bySelector(oChange.getRevertData().newCellSelector, oAppComponent);
				oModifier.removeAggregation(oTemplate, CELLS_AGGREGATION_NAME, oNewCell);
				oModifier.destroy(oNewCell);
				oModifier.updateAggregation(oTable, ITEMS_AGGREGATION_NAME);
			}

		},
		aggregationName: COLUMNS_AGGREGATION_NAME,
		parentAlias: "targetTable",
		fieldSuffix: "--field",
		skipCreateLabel: function(mPropertyBag) {
			//if entity type is given we create label ourselves
			return !!ObjectPath.get("changeDefinition.oDataInformation.entityType", mPropertyBag);
		},
		skipCreateLayout: true,
		supportsDefault: true
	});

	return AddTableColumn;
},
/* bExport= */true);
