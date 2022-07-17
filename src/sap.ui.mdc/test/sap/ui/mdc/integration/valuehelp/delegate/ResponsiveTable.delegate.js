/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/odata/v4/TableDelegate",
	"sap/ui/core/Core",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"delegates/odata/v4/FilterBarDelegate",
	"sap/ui/mdc/odata/v4/ODataMetaModelUtil",
	"sap/ui/mdc/odata/v4/TypeUtil",
	"sap/ui/model/Filter",
	"sap/base/Log"
], function(
	TableDelegate,
	Core,
	FilterUtil,
	DelegateUtil,
	FilterBarDelegate,
	ODataMetaModelUtil,
	TypeUtil,
	Filter,
	Log
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var ODataTableDelegate = Object.assign({}, TableDelegate);

	ODataTableDelegate.fetchProperties = function(oTable) {
		var oModel = this._getModel(oTable);
		var pCreatePropertyInfos;

		if (!oModel) {
			pCreatePropertyInfos = new Promise(function(resolve) {
				oTable.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}.bind(this)).then(function(oModel) {
				return this._createPropertyInfos(oTable, oModel);
			}.bind(this));
		} else {
			pCreatePropertyInfos = this._createPropertyInfos(oTable, oModel);
		}

		return pCreatePropertyInfos.then(function(aProperties) {
			if (oTable.data){
				oTable.data("$tablePropertyInfo", aProperties);
			}
			return aProperties;
		});
	};

	function onModelContextChange(oEvent, oData) {
		var oTable = oEvent.getSource();
		var oModel = this._getModel(oTable);

		if (oModel) {
			oTable.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	ODataTableDelegate._createPropertyInfos = function(oTable, oModel) {
		var oMetadataInfo = oTable.getDelegate().payload;
		var aProperties = [];
		var sEntitySetPath = "/" + oMetadataInfo.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
			var oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
			var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
			var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

			for (var sKey in oEntityType) {
				var oObj = oEntityType[sKey];

				if (oObj && oObj.$kind === "Property") {
					// ignore (as for now) all complex properties
					// not clear if they might be nesting (complex in complex)
					// not clear how they are represented in non-filterable annotation
					// etc.
					if (oObj.$isCollection) {
						Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					var oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

					aProperties.push({
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						typeConfig: oTable.getTypeUtil().getTypeConfig(oObj.$Type),
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1
					});
				}
			}

			return aProperties;
		});
	};

	/**
	 * Updates the binding info with the relevant path and model from the metadata.
	 *
	 * @param {Object} oTable The MDC table instance
	 * @param {Object} oBindingInfo The bindingInfo of the table
	 */
	 ODataTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		var oDelegatePayload = oTable.getPayload();

		if (oDelegatePayload ) {
			oBindingInfo.path = oBindingInfo.path || oDelegatePayload.collectionPath || "/" + oDelegatePayload.collectionName;
			oBindingInfo.model = oBindingInfo.model || oDelegatePayload.model;
		}

		if (oDelegatePayload && oDelegatePayload.collectionName === "Authors") {
			oBindingInfo.parameters.$expand = "countryOfOrigin";
		}

		var oFilterBar = Core.byId(oTable.getFilter());
		// var bTableFilterEnabled = oTable.isFilteringEnabled();
		var mConditions;
		var oOuterFilterInfo;
		var aFilters = [];

		// if (bTableFilterEnabled) {
		// 	mConditions = oTable.getConditions();
		// 	var aPropertiesMetadata = oTable.getPropertyHelper().getProperties();
		// 	oInnerFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeUtil(), mConditions, aPropertiesMetadata);

		// 	if (oInnerFilterInfo.filters) {
		// 		aFilters.push(oInnerFilterInfo.filters);
		// 	}
		// }

		if (oFilterBar) {
			mConditions = oFilterBar.getConditions();
			if (mConditions) {

				var aPropertiesMetadata = oFilterBar.getPropertyHelper().getProperties();
				oOuterFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeUtil(), mConditions, aPropertiesMetadata);

				if (oOuterFilterInfo.filters) {
					aFilters.push(oOuterFilterInfo.filters);
				}
			}

			// get the basic search
			var sSearchText = oFilterBar.getSearch instanceof Function ? oFilterBar.getSearch() :  "";
			if (sSearchText && sSearchText.indexOf(" ") === -1) { // to allow search for "(".....
				sSearchText = '"' + sSearchText + '"'; // TODO: escape " in string
			} // if it contains spaces allow opeartors like OR...
			oBindingInfo.parameters.$search = sSearchText || undefined;
		}

		if (aFilters && aFilters.length > 0) {
			oBindingInfo.filters = new Filter(aFilters, true);
		}
	};

	ODataTableDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	ODataTableDelegate.getTypeUtil = function (oPayload) {
		return TypeUtil;
	};

	ODataTableDelegate._getModel = function(oTable) {
		var oMetadataInfo = oTable.getDelegate().payload;
		return oTable.getModel(oMetadataInfo.model);
	};

	return ODataTableDelegate;
});
