/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the chart and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	"sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"sap/ui/mdc/enums/ChartItemRoleType"
], function (
	FilterBarDelegate,
	VizChartDelegate,
	ODataMetaModelUtil,
	ChartItemRoleType
) {
	"use strict";

	var ChartDelegate = Object.assign({}, VizChartDelegate);
	ChartDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	ChartDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	/**
	 * Returns the relevant property infos based on the metadata used with the MDC chart instance.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
	 * @returns {array} Array of the property infos to be used within MDC chart
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	 ChartDelegate.fetchProperties = function (oChart) {

		var oModel = this._getModel(oChart);
		var pCreatePropertyInfos;

		if (!oModel) {
			pCreatePropertyInfos = new Promise(function (resolve) {
				oChart.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}.bind(this)).then(function (oModel) {
				return this._createPropertyInfos(oChart, oModel);
			}.bind(this));
		} else {
			pCreatePropertyInfos = this._createPropertyInfos(oChart, oModel);
		}

		return pCreatePropertyInfos.then(function (aProperties) {
			if (oChart.data) {
				oChart.data("$mdcChartPropertyInfo", aProperties);
			}
			return aProperties;
		});
	};

	function onModelContextChange(oEvent, oData) {
		var oChart = oEvent.getSource();
		var oModel = this._getModel(oChart);

		if (oModel) {
			oChart.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	ChartDelegate._createPropertyInfos = function (oChart, oModel) {
		var oDelegatePayload = oChart.getDelegate().payload;
		var aProperties = [];
		var sEntitySetPath = "/" + oDelegatePayload.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function (aResults) {
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
						//Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					var oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

					//TODO: Check what we want to do with properties neither aggregatable nor groupable
					//Right now: skip them, since we can't create a chart from it
					if (!oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] && !oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {
						continue;
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"]){
						aProperties = aProperties.concat(this._createPropertyInfosForAggregatable(sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo));
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {

						aProperties.push({
							name: sKey,
							propertyPath: sKey,
							label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
							sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
							filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
							groupable: true,
							aggregatable: false,
							maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
							dataType: oObj.$Type,
							//formatOptions: null,
							//constraints: {},
							role: ChartItemRoleType.category, //standard, normally this should be interpreted from UI.Chart annotation
							criticality: null ,//To be implemented by FE
							textProperty: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path  : null //To be implemented by FE
							//textFormatter: string-> can be used to provide a custom formatter for the textProperty
						});

					}
				}
			}

			return aProperties;
		}.bind(this));
	};

	ChartDelegate._createPropertyInfosForAggregatable = function(sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo) {
		var aProperties = [];

		if (oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"]){
			oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"].forEach(function(sAggregationMethod){
				if (sAggregationMethod.hasOwnProperty("$Path")) {
					sAggregationMethod = sAggregationMethod["$Path"];
				}

				aProperties.push({
					name: sAggregationMethod + sKey,
					propertyPath: sKey,
					label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] + " (" + sAggregationMethod + ")" || sKey + " (" + sAggregationMethod + ")" ,
					sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
					filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
					groupable: false,
					aggregatable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"],
					aggregationMethod: sAggregationMethod,
					maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
					dataType: oObj.$Type,
					datapoint: null //To be implemented by FE
				});
			});
		}

		return aProperties;
	};

	ChartDelegate.addItem = function (oChart, sPropertyName, mPropertyBag, sRole) {
		if (oChart.getModel) {
			return Promise.resolve(this._createMDCChartItem(sPropertyName, oChart, sRole));
		}
	};

	return ChartDelegate;
});