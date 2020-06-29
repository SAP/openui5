/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/TableDelegate", "sap/ui/mdc/odata/v4/BaseDelegate", 'sap/ui/core/Core', 'sap/ui/mdc/util/FilterUtil', 'sap/ui/mdc/odata/v4/util/DelegateUtil', 'sap/ui/mdc/condition/FilterConverter'
], function(TableDelegate, BaseDelegate, Core, FilterUtil, DelegateUtil, FilterConverter) {
	"use strict";
	/**
	 * Helper class for sap.ui.mdc.Table.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.v4.TableDelegate
	 */
	var ODataTableDelegate = Object.assign({}, TableDelegate, BaseDelegate);
	/**
	 * Fetches the relevant metadata for the table and returns property info array
	 *
	 * @param {Object} oTable - instance of the mdc Table
	 * @returns {Array} array of property info
	 */
	ODataTableDelegate.fetchProperties = function(oTable) {
		var oMetadataInfo = oTable.getDelegate().payload, aProperties = [], oPropertyInfo, oObj, sEntitySetPath, oModel, oMetaModel, oPropertyAnnotations;
		sEntitySetPath = "/" + oMetadataInfo.collectionName;
		oModel = oTable.getModel(oMetadataInfo.model);
		oMetaModel = oModel.getMetaModel();
		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
			var oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
			// TODO: Filter restrictions
			var aSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			var aNonSortableProperties = (aSortRestrictions["NonSortableProperties"] || []).map(function(oCollection) {
				return oCollection["$PropertyPath"];
			});

			for ( var sKey in oEntityType) {
				oObj = oEntityType[sKey];
				if (oObj && oObj.$kind === "Property") {
					// TODO: Enhance with more properties as used in MetadataAnalyser and check if this should be made async
					oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");
					oPropertyInfo = {
						name: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"],
						description: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path,
						maxLength: oObj.$MaxLength,
						precision: oObj.$Precision,
						scale: oObj.$Scale,
						type: oObj.$Type,
						sortable: aNonSortableProperties.indexOf(sKey) == -1,
						filterable: true
					};
					aProperties.push(oPropertyInfo);
				}
			}
			return aProperties;
		});
	};

	/**
	 * Updates the binding info with the relevant path and model from the metadata.
	 *
	 * @param {Object} oMDCTable The MDC table instance
	 * @param {Object} oMetadataInfo The metadataInfo set on the table
	 * @param {Object} oBindingInfo The bindingInfo of the table
	 */
	ODataTableDelegate.updateBindingInfo = function(oMDCTable, oMetadataInfo, oBindingInfo) {

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

		var oFilter = Core.byId(oMDCTable.getFilter()), bFilterEnabled = oMDCTable._getFilterEnabled(), mConditions;

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		if (bFilterEnabled) {
			mConditions = oMDCTable.getConditions();
			//TODO: reuse 'FilterUtil' --> Table does not derive from sap.ui.mdc.Control as of now
			var aFilters = FilterConverter.createFilters(mConditions);
			oBindingInfo.filters = aFilters;

		} else if (oFilter) {
			mConditions = oFilter.getConditions();
			if (mConditions) {

				var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				var aParameterNames = DelegateUtil.getParameterNames(oFilter);
				var oFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, aPropertiesMetadata, aParameterNames);
				if (oFilterInfo) {
					oBindingInfo.filters = oFilterInfo.filters;
				}

				var sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
				if (sParameterPath) {
					oBindingInfo.path = sParameterPath;
				}
			}

			// get the basic search
			var sSearchText = oFilter.getSearch();
			if (sSearchText) {

				if (!oBindingInfo.parameters) {
					oBindingInfo.parameters = {};
				}

				// add basic search parameter as expected by v4.ODataListBinding
				oBindingInfo.parameters.$search = sSearchText;
			}
		}
	};

	/**
	 * Set the <code>delegate</code> property for the inner <code>FilterBar</code>
	 *
	 * @param {Object} oPayload The payload configuration for the current Table instance
	 * @returns {Object} Object for the inner FilterBar <code>delegate</code> property
	 *
	 * @public
	 */
	ODataTableDelegate.getFilterDelegate = function(oPayload) {
		return {
			name: "sap/ui/mdc/odata/v4/FilterBarDelegate",
			payload: oPayload
		};
	};

	return ODataTableDelegate;
});
