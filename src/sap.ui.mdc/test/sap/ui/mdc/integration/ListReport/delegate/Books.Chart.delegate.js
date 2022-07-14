/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/vizChart/ChartDelegate",
	"sap/ui/mdc/library",
	"sap/ui/mdc/odata/v4/ODataMetaModelUtil"
], function(ChartDelegate, MDCLib, ODataMetaModelUtil) {
	"use strict";

	var SampleChartDelegate = Object.assign({}, ChartDelegate);

	SampleChartDelegate._createPropertyInfosForAggregatable = function(sKey, oPropertyAnnotations, oFilterRestrictionsInfo, oSortRestrictionsInfo) {
		var aProperties = [];

		if (oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"]){
			oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"].forEach(function(sAggregationMethod){
				aProperties.push({
					name: sAggregationMethod.$Path + sKey,
					propertyPath: sKey,
					label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] + " (" + sAggregationMethod + ")" || sKey + " (" + sAggregationMethod + ")" ,
					sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
					filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
					groupable: false,
					aggregatable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"],
					aggregationMethod: sAggregationMethod.$Path,
					maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
					sortKey: oPropertyAnnotations["@Org.OData.Aggregation.V1.RecommendedAggregationMethod"].$Path + sKey,
					kind: "Aggregatable",//Only needed for P13n Item Panel
					availableRoles: this._getLayoutOptionsForType("aggregatable"), //for p13n
					role: MDCLib.ChartItemRoleType.axis1,
					datapoint: null //To be implemented by FE
				});
			}.bind(this));
		}

		return aProperties;
	};

	return SampleChartDelegate;
});
