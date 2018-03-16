/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/changeHandler/ChangeHandlerMediator"
], function(
	jQuery,
	ChangeHandlerMediator
) {
	"use strict";

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
	var AddTableColumn = {};

	var COLUMNS_AGGREGATION_NAME = "columns";
	var CELLS_AGGREGATION_NAME = "cells";
	var ITEMS_AGGREGATION_NAME = "items";

	/**
	 * Adds a column using SmartField
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Table} oTable - Table that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @param {object} mPropertyBag.view - application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddTableColumn.applyChange = function(oChange, oTable, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeDefinition = oChange.getDefinition();
		var mContent = oChange.getContent();
		var mChangeHandlerSettings = ChangeHandlerMediator.getChangeHandlerSettings({
			"scenario": "addODataField",
			"oDataServiceVersion": mContent.oDataServiceVersion
		});
		var fnChangeHandlerCreateFunction = mChangeHandlerSettings
			&& mChangeHandlerSettings.content
			&& mChangeHandlerSettings.content.createFunction;

		var fnCheckChangeDefinition = function(mContent) {
			var bMandatoryContentPresent = false;

			bMandatoryContentPresent = mContent.newFieldSelector
				&& (mContent.newFieldIndex !== undefined)
				&& mContent.bindingPath
				&& mContent.oDataServiceVersion
				&& fnChangeHandlerCreateFunction;

			return  bMandatoryContentPresent;
		};


		if (mContent && fnCheckChangeDefinition(mContent)) {
			var oTemplate = oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME, oView);
			var oText = oModifier.createControl(
				'sap.m.Text',
				oAppComponent,
				oView,
				mContent.newFieldSelector.id + '--column',
				{
					text: "{/#" + mContent.entityType + "/" + mContent.bindingPath + "/@sap:label}"
				}
			);

			if (oTemplate) {
				var mCreateProperties = {
					"appComponent" : mPropertyBag.appComponent,
					"view" : mPropertyBag.view,
					"fieldSelector" : mContent.newFieldSelector.id + '--field',
					"bindingPath" : mContent.bindingPath
				};

				var oSmartField = fnChangeHandlerCreateFunction(oModifier, mCreateProperties);

				oModifier.insertAggregation(oTemplate, CELLS_AGGREGATION_NAME, oSmartField, mContent.newFieldIndex, oView);
				oModifier.updateAggregation(oTable, ITEMS_AGGREGATION_NAME);//only needed in JS case
				oChange.setRevertData(mContent.newFieldSelector.id + '--field');
			}

			var oControl = oModifier.createControl('sap.m.Column', oAppComponent, oView, mContent.newFieldSelector);
			oModifier.insertAggregation(oControl, 'header', oText, 0, oView);
			oModifier.insertAggregation(oTable, COLUMNS_AGGREGATION_NAME, oControl, mContent.newFieldIndex, oView);

			return true;
		} else {
			jQuery.sap.log.error("Change does not contain sufficient information to be applied or ChangeHandlerMediator could not be retrieved: [" + oChangeDefinition.layer + "]"
				+ oChangeDefinition.namespace + "/"
				+ oChangeDefinition.fileName + "."
				+ oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Table} oTable - Table that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @param {object} mPropertyBag.view - application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddTableColumn.revertChange = function(oChange, oTable, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var mContent = oChange.getContent();

		// Column Content
		var oTemplate = oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME);

		if (oTemplate) {
			oModifier.removeAggregation(oTemplate, CELLS_AGGREGATION_NAME, oModifier.bySelector(oChange.getRevertData(), oAppComponent, oView));
			oModifier.updateAggregation(oTable, ITEMS_AGGREGATION_NAME);
		}

		// Column Header
		oModifier.removeAggregation(oTable, COLUMNS_AGGREGATION_NAME, oModifier.bySelector(mContent.newFieldSelector, oAppComponent, oView));

		oChange.resetRevertData();

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
	 * @param {Object} oSpecificChangeInfo - information specific to this change
	 * @param {string} oSpecificChangeInfo.newControlId - the control ID for the control to be added,
	 * @param {string} oSpecificChangeInfo.bindingPath - the binding path for the new control,
	 * @param {string} oSpecificChangeInfo.parentId - Table where the new control will be added,
	 * @param {number} oSpecificChangeInfo.index - the index where the field will be added,
	 * @param {string} oSpecificChangeInfo.oDataServiceVersion - the OData service version.
	 * @param {Object} mPropertyBag The property bag containing the App Component
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @param {object} mPropertyBag.appComponent - application component
	 * @param {object} mPropertyBag.view - application view
	 * @public
	 */
	AddTableColumn.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeDefinition = oChange.getDefinition();

		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}
		if (oSpecificChangeInfo.parentId) {
			oChange.addDependentControl(oSpecificChangeInfo.parentId, "targetTable", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.parentId attribute required");
		}
		if (oSpecificChangeInfo.bindingPath) {
			oChangeDefinition.content.bindingPath = oSpecificChangeInfo.bindingPath;
		} else {
			throw new Error("oSpecificChangeInfo.bindingPath attribute required");
		}
		if (oSpecificChangeInfo.entityType) {
			oChangeDefinition.content.entityType = oSpecificChangeInfo.entityType;
		} else {
			throw new Error("oSpecificChangeInfo.entityType attribute required");
		}
		if (oSpecificChangeInfo.newControlId) {
			oChangeDefinition.content.newFieldSelector = mPropertyBag.modifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.targetIndex attribute required");
		} else {
			oChangeDefinition.content.newFieldIndex = oSpecificChangeInfo.index;
		}
		if (oSpecificChangeInfo.oDataServiceVersion === undefined) {
			throw new Error("oSpecificChangeInfo.oDataServiceVersion attribute required");
		} else {
			oChangeDefinition.content.oDataServiceVersion = oSpecificChangeInfo.oDataServiceVersion;
		}
	};

	return AddTableColumn;
},
/* bExport= */true);
