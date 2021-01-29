/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/mdc/util/FilterUtil"
], function(
	TableDelegateBase,
	Column,
	Text,
	Core,
	FilterUtil
) {
	"use strict";

	/**
	 * Test delegate.
	 */
	var TableDelegate = Object.assign( TableDelegateBase);

	TableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		if (oTable.getModel) {
			return this._createColumn(sPropertyName, oTable);
		}
		return Promise.resolve(null);
	};

	TableDelegate.updateBindingInfo = function(oMDCTable, oMetadataInfo, oBindingInfo) {
		if (!oMDCTable) {
			return;
		}

		if (oMetadataInfo && oBindingInfo) {
			oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
			oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
		}

		if (!oBindingInfo) {
			oBindingInfo = {};
		}

		var oFilter = Core.byId(oMDCTable.getFilter()),
			bFilterEnabled = oMDCTable.isFilteringEnabled(),
			mConditions;

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		var oFilterControl = bFilterEnabled ? oMDCTable : oFilter;
		if (oFilterControl) {
			var aPropertiesMetadata = bFilterEnabled ? [] : oFilter.getPropertyInfoSet();
			mConditions = oFilterControl.getConditions();

			var oFilterInfo = FilterUtil.getFilterInfo(oFilterControl, mConditions, aPropertiesMetadata);
			oBindingInfo.filters = oFilterInfo.filters;
		}
	};

	/**
	 * Creates the Column for the specified property info and table
	 *
	 * @param {String} sPropertyName The property info name
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Promise that resolves with the instance of mdc.table.Column
	 * @private
	 */
	TableDelegate._createColumn = function(sPropertyName, oTable) {
		return this.fetchProperties(oTable).then(function(aProperties) {
			var oPropertyInfo = aProperties.find(function(oCurrentPropertyInfo) {
				return oCurrentPropertyInfo.name === sPropertyName;
			});

			if (!oPropertyInfo) {
				return null;
			}

			return this._createColumnTemplate(oPropertyInfo, oTable).then(function(oTemplate) {
				var oColumnInfo = this._getColumnInfo(oPropertyInfo, oTable);
				oColumnInfo.template = oTemplate;
				oColumnInfo.dataProperty = sPropertyName;
				return new Column(oTable.getId() + "--" + oPropertyInfo.name, oColumnInfo);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Creates the Column for the specified property info and table
	 *
	 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Object} column info to be used in creation of the column/cell
	 * @private
	 */
	TableDelegate._getColumnInfo = function(oPropertyInfo, oTable) {
		return {
			header: oPropertyInfo.label
		};
	};

	/**
	 * Creates and returns the template info of the column for the specified property info
	 *
	 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Object} template info to be used in creationg of the column/cell
	 * @private
	 */
	TableDelegate._getColumnTemplateInfo = function(oPropertyInfo, oTable) {
		return {
			text: {
				path: oPropertyInfo.path || oPropertyInfo.name
			}
		};
	};

	/**
	 * Creates and returns the template of the column for the specified info
	 *
	 * @param {Object} oPropertyInfo The property info object/json containing at least name and label properties
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Promise that resolves with the template to be used in the column/cell
	 * @private
	 */
	TableDelegate._createColumnTemplate = function(oPropertyInfo, oTable) {
		return Promise.resolve(new Text(this._getColumnTemplateInfo(oPropertyInfo, oTable)));
	};

	return TableDelegate;
});
