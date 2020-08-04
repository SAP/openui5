/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/TableDelegate", 'sap/ui/core/Core', 'sap/ui/mdc/util/FilterUtil', 'sap/ui/mdc/odata/v4/util/DelegateUtil', 'sap/ui/mdc/odata/v4/FilterBarDelegate', './ODataMetaModelUtil', 'sap/ui/mdc/odata/v4/TypeUtil'
], function(TableDelegate, Core, FilterUtil, DelegateUtil, FilterBarDelegate, ODataMetaModelUtil, TypeUtil) {
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
	var ODataTableDelegate = Object.assign({}, TableDelegate);

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
			var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

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

						//Required for inbuilt filtering: filterable, typeConfig
						//Optional: maxConditions, fieldHelp
						filterable: oFilterRestrictionsInfo.propertyInfo[sKey] ? oFilterRestrictionsInfo.propertyInfo[sKey].filterable : true,
						typeConfig: oTable.getTypeUtil().getTypeConfig(oObj.$Type),
						fieldHelp: undefined,
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1
					};
					aProperties.push(oPropertyInfo);
				}
			}
			oTable.data("$tablePropertyInfo",aProperties);
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

		var oFilter = Core.byId(oMDCTable.getFilter()), bFilterEnabled = oMDCTable.isFilteringEnabled(), mConditions, oFilterInfo;

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		if (bFilterEnabled) {
			mConditions = oMDCTable.getConditions();
			var aTableProperties = oMDCTable.data("$tablePropertyInfo");
			oFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, aTableProperties);
			oBindingInfo.filters = oFilterInfo.filters;
		} else if (oFilter) {
			mConditions = oFilter.getConditions();
			if (mConditions) {

				var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
				var aParameterNames = DelegateUtil.getParameterNames(oFilter);
				oFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, aPropertiesMetadata, aParameterNames);
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
	 * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields
	 * <b>Note:</b> The functionality provided in this delegate should act as a subset of a FilterBarDelegate
	 * to enable the Table for inbuilt filtering
	 *
	 * @returns {Object} Object for the Tables filter personalization:
	 *
	 * oFilterDelegate = {
	 * 		addFilterItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 *
	 * @public
	 */
	ODataTableDelegate.getFilterDelegate = function() {
		return {
			/**
			 *
			 * @param {Object} oProperty Corresponding property to create a FilterField
			 * @param {Object} oTable Table instance
			 */
			addFilterItem: function(oProperty, oTable) {
				return FilterBarDelegate._createFilterField(oProperty, oTable);
			}
		};
	};

	ODataTableDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	return ODataTableDelegate;
});
