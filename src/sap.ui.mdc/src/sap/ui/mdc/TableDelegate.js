/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/AggregationBaseDelegate", "./table/Column", "sap/m/Text", 'sap/ui/core/Core', 'sap/ui/mdc/util/FilterUtil'
], function(AggregationBaseDelegate, Column, Text, Core, FilterUtil) {
	"use strict";
	/**
	 * Delegate class for sap.ui.mdc.Table.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.TableDelegate
	 */
	var TableDelegate = Object.assign(AggregationBaseDelegate, {

		addItem: function(sPropertyName, oTable, mPropertyBag) {
			// TODO: Separate OData specific part to OData delegate
			if (oTable.getModel) {
				return this._createColumn(sPropertyName, oTable);
			}
			return Promise.resolve(null);
		},

		removeItem: function(sPropertyName, oTable, mPropertyBag) {
			// return true within the Promise for default behaviour (e.g. continue to destroy the column)
			return Promise.resolve(true);
		},

		/**
		 * Updates the binding info with the relevant path and model from the metadata.
		 *
		 * @param {Object} oMDCTable The MDC table instance
		 * @param {Object} oMetadataInfo The metadataInfo set on the table
		 * @param {Object} oBindingInfo The bindingInfo of the table
		 */
		updateBindingInfo: function(oMDCTable, oMetadataInfo, oBindingInfo) {

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

		},

		/**
		 * Checks the binding of the table and rebinds it if required.
		 *
		 * @param {Object} oMDCTable The MDC table instance
		 * @param {Object} oRowBindingInfo The row binding info of the table
		 */
		rebindTable: function(oMDCTable, oRowBindingInfo) {

			if (oMDCTable && oMDCTable._oTable && oRowBindingInfo) {
				oMDCTable._oTable.bindRows(oRowBindingInfo);
			}
		},

		/**
		 * Creates the Column for the specified property info and table
		 *
		 * @param {String} sPropertyInfoName The property info name
		 * @param {Object} oTable Instance of the table
		 * @returns {Promise} Promise that resolves with the instance of mdc.table.Column
		 * @private
		 */
		_createColumn: function(sPropertyInfoName, oTable) {
			return this.fetchProperties(oTable).then(function(aProperties) {
				var oPropertyInfo = aProperties.find(function(oCurrentPropertyInfo) {
					return oCurrentPropertyInfo.name === sPropertyInfoName;
				});
				if (!oPropertyInfo) {
					return null;
				}
				return this._createColumnTemplate(oPropertyInfo).then(function(oTemplate) {
					var oColumnInfo = this._getColumnInfo(oPropertyInfo);
					// create column template
					oColumnInfo.template = oTemplate;
					return new Column(oTable.getId() + "--" + oPropertyInfo.name, oColumnInfo);
				}.bind(this));
			}.bind(this));
		},

		/**
		 *
		 * @public
		 * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields
		 * <b>Note:</b> The functionality provided in this delegate should act as a subset of a FilterBarDelegate
		 * to enable the Table for inbuilt filtering
		 *
		 * @returns {Object} Object for the Tables filter personalization:
		 *
		 * @example <caption>Example usage of <code>getFilterDelegate</code> </caption>
		 * oFilterDelegate = {
		 * 		addItem: function() {
		 * 			var oFilterFieldPromise = new Promise(...);
		 * 			return oFilterFieldPromise;
		 * 		}
		 * }
		 *
		 */
		getFilterDelegate: function() {
			return {
				/**
				 *
				 * @param {String} sPropertyInfoName The property info name
		 		 * @param {Object} oTable Instance of the table
				 *
				 * @returns {Promise} Promise that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
				 * For more information, see {@link sap.ui.mdc.AggregationBaseDelegate#addItem AggregationBaseDelegate}.
				 */
				addItem: function(sPropertyInfoName, oTable) {
					return Promise.resolve(null);
				},

				/**
				 * @deprecated
				 * @param {Object} oProperty Corresponding property to create a FilterField
				 * @param {Object} oTable Table instance
				 */
				addFilterItem: function(oProperty, oTable) {
					return Promise.resolve(null);
				}
			};
		},

		/**
		 * Creates the Column for the specified property info and table
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @returns {Object} column info to be used in creation of the column/cell
		 * @private
		 */
		_getColumnInfo: function(oPropertyInfo) {
			return {
				header: oPropertyInfo.label,
				dataProperty: oPropertyInfo.name,
				hAlign: oPropertyInfo.align,
				width: oPropertyInfo.width
			};
		},

		/**
		 * Creates and returns the template info of the column for the specified property info
		 *
		 * @param {Object} oPropertyInfo - the property info object/json containing at least name and label properties
		 * @returns {Object} template info to be used in creationg of the column/cell
		 * @private
		 */
		_getColumnTemplateInfo: function(oPropertyInfo) {
			return {
				text: {
					path: oPropertyInfo.path || oPropertyInfo.name
				},
				textAlign: oPropertyInfo.align
			};
		},
		/**
		 * Creates and returns the template of the column for the specified info
		 *
		 * @param {Object} oPropertyInfo The property info object/json containing at least name and label properties
		 * @returns {Promise} Promise that resolves with the template to be used in the column/cell
		 * @private
		 */
		_createColumnTemplate: function(oPropertyInfo) {
			// TODO: use path instead of name? (path falls back to name for OData properties, but can contain a more complex path).
			// This may also needed to address duplicate property scenarios.
			return Promise.resolve(new Text(this._getColumnTemplateInfo(oPropertyInfo)));
		}
	});

	return TableDelegate;
});
