/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/TableDelegate",
	"sap/ui/core/Core",
	"sap/ui/mdc/util/FilterUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"delegates/odata/v4/FilterBarDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"sap/ui/model/Filter",
	"sap/base/Log",
	'sap/ui/mdc/odata/v4/TypeMap',
	"sap/ui/core/Element"
], function(
	TableDelegate,
	Core,
	FilterUtil,
	DelegateUtil,
	FilterBarDelegate,
	ODataMetaModelUtil,
	Filter,
	Log,
	ODataV4TypeMap,
	Element
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	const ODataTableDelegate = Object.assign({}, TableDelegate);

	ODataTableDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	ODataTableDelegate.fetchProperties = function(oTable) {
		const oModel = this._getModel(oTable);
		let pCreatePropertyInfos;

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
		const oTable = oEvent.getSource();
		const oModel = this._getModel(oTable);

		if (oModel) {
			oTable.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	ODataTableDelegate._createPropertyInfos = function(oTable, oModel) {
		const oMetadataInfo = oTable.getDelegate().payload;
		const aProperties = [];
		const sEntitySetPath = "/" + oMetadataInfo.collectionName;
		const oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
			const oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
			const oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			const oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
			const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

			for (const sKey in oEntityType) {
				const oObj = oEntityType[sKey];

				if (oObj && oObj.$kind === "Property") {
					// ignore (as for now) all complex properties
					// not clear if they might be nesting (complex in complex)
					// not clear how they are represented in non-filterable annotation
					// etc.
					if (oObj.$isCollection) {
						Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					const oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

					aProperties.push({
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						dataType: oObj.$Type,
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
		const oDelegatePayload = oTable.getPayload();

		if (oDelegatePayload ) {
			oBindingInfo.path = oBindingInfo.path || oDelegatePayload.collectionPath || "/" + oDelegatePayload.collectionName;
			oBindingInfo.model = oBindingInfo.model || oDelegatePayload.model;
		}

		if (oDelegatePayload && oDelegatePayload.collectionName === "Authors") {
			oBindingInfo.parameters.$expand = "countryOfOrigin";
		}

		const oFilterBar = Element.registry.get(oTable.getFilter());
		// var bTableFilterEnabled = oTable.isFilteringEnabled();
		let mConditions;
		let oOuterFilterInfo;
		const aFilters = [];

		// if (bTableFilterEnabled) {
		// 	mConditions = oTable.getConditions();
		// 	var aPropertiesMetadata = oTable.getPropertyHelper().getProperties();
		// 	oInnerFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

		// 	if (oInnerFilterInfo.filters) {
		// 		aFilters.push(oInnerFilterInfo.filters);
		// 	}
		// }

		if (oFilterBar) {
			mConditions = oFilterBar.getConditions();
			if (mConditions) {

				const aPropertiesMetadata = oFilterBar.getPropertyHelper().getProperties();
				oOuterFilterInfo = FilterUtil.getFilterInfo(ODataTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata);

				if (oOuterFilterInfo.filters) {
					aFilters.push(oOuterFilterInfo.filters);
				}
			}

			// get the basic search
			let sSearchText = oFilterBar.getSearch instanceof Function ? oFilterBar.getSearch() :  "";
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

	ODataTableDelegate._getModel = function(oTable) {
		const oMetadataInfo = oTable.getDelegate().payload;
		return oTable.getModel(oMetadataInfo.model);
	};

	return ODataTableDelegate;
});
